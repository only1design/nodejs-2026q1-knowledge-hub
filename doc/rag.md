# RAG Module

## Overview

The RAG (Retrieval-Augmented Generation) module grounds Gemini's answers in the Knowledge Hub's own articles. Instead of relying on the model's training data, every answer is built from chunks retrieved from the article corpus stored in Qdrant.

Articles are split into chunks, embedded by Gemini, and stored in Qdrant alongside sparse vectors for hybrid search.  
On each user query it runs hybrid search (dense + sparse fused via RRF inside Qdrant), reranks the results with MMR for source diversity, and injects them as context into a grounded prompt for Gemini.    
Indexing is incremental (driven by timestamp + content hash), so re-runs only re-embed articles that actually changed.

Approaches used: recursive character-based chunking with overlap; asymmetric Gemini embeddings; hashed-vocabulary sparse vectors with TF computed
in-app and IDF applied server-side by Qdrant; English + Russian stopword filtering; hybrid retrieval with prefetch over-fetch and Reciprocal Rank Fusion (RRF); bi-encoder MMR reranking
with a tunable λ for the relevance/diversity tradeoff; incremental indexing via SHA-256 content hashing combined with updatedAt/lastIndexedAt timestamps; grounded prompting with schema-enforced JSON output
and source-index attribution; in-memory conversation history with a per-session message cap.
## Glossary

| Term | Meaning |
|---|---|
| **Embedding** | A fixed-length numeric vector representation of text. Similar meanings produce nearby vectors. |
| **Dense vector** | An embedding where every dimension carries weight (here: 768 floats from Gemini). Captures semantic meaning. |
| **Sparse vector** | A high-dimensional vector where most components are zero. Built from token statistics, captures exact keyword matches. |
| **Cosine similarity** | Angle-based similarity between two vectors. 1.0 = identical direction, 0.0 = orthogonal. |
| **TF** (Term Frequency) | How often a token appears in a chunk, normalized by chunk length. |
| **IDF** (Inverse Document Frequency) | `log(N / dfₜ)` — rare tokens (small `dfₜ`) get a higher weight than common ones. Computed by Qdrant across the whole collection. |
| **TF-IDF** | TF × IDF. Combines local frequency with global rarity to score keyword relevance. |
| **RRF** (Reciprocal Rank Fusion) | Combines several ranked lists into one using `score = Σ 1 / (k + rank)`. Rank-based and score-agnostic, so it merges dense and sparse results without normalizing their disparate score scales. |
| **MMR** (Maximal Marginal Relevance) | Greedy reranker that trades off relevance against diversity: `score = λ · relevance − (1 − λ) · max_similarity_to_already_selected`. Prevents many near-duplicate chunks at the top. |
| **Chunk** | A bounded slice of an article's content. The atomic unit of retrieval. |
| **Top-K** | The K best results returned after retrieval. |

## Chunking strategy

Implemented in `src/rag/chunking/article-chunker.ts` with LangChain's `RecursiveCharacterTextSplitter`.

- **Size**: 800 characters, **overlap**: 200 characters (configurable via `RAG_CHUNK_SIZE` / `RAG_CHUNK_OVERLAP`).
- The splitter tries separators in order (`\n\n`, `\n`, ` `, `""`), so chunks break on paragraph, line, and word boundaries before falling back to mid-word cuts.
- Overlap preserves context across boundaries: a fact split between two chunks is still recoverable because the second chunk repeats the last 200 chars of the first.
- Each chunk carries its parent article's metadata in the payload: `articleId`, `articleTitle`, `status`, `categoryId`, `tags`. This is what enables payload filtering and source attribution.

## Indexing

`RagService.index()` is incremental and idempotent.

1. **Fetch** articles (optionally filtered by `articleIds` or `onlyPublished`).
2. **Filter** to those needing reindex (`src/rag/indexing/article-hash.ts`):
   - Never indexed → always reindex.
   - Indexed but `updatedAt > lastIndexedAt` AND content hash changed → reindex.
   - Otherwise → skip. `force: true` bypasses this filter.
3. **Chunk** each article.
4. **Embed** chunks in batches of 100 using Gemini's `embedContent` with `taskType: RETRIEVAL_DOCUMENT`. Task type matters: Gemini produces asymmetric embeddings optimized for the document-vs-query distinction.
5. **Delete** the article's existing chunks from Qdrant (clean slate per article).
6. **Upsert** new chunks. Each point gets both a dense vector (from Gemini) and a sparse vector (computed locally from the chunk text).
7. **Mark indexed**: store `lastIndexedAt` (now) and `lastIndexedHash` (SHA-256 of title + content + status + categoryId + sorted tags) on the article.

## Sparse vectorization

`src/rag/vector-store/sparse-vectorizer.ts`.

- Tokenize: lowercase → `WordTokenizer` (from `natural`) → drop tokens shorter than 2 chars → strip English + Russian stopwords (`stopword` package).
- Hash each token to an integer in `[0, 100_000)` via MD5 mod-bucketing. This avoids maintaining a vocabulary and trades a small collision probability for zero-state simplicity.
- Compute TF (count / length) per hashed id and emit `{indices, values}`.
- **IDF is not computed client-side.** Qdrant applies it server-side because the collection is created with `sparse_vectors.sparse.modifier: 'idf'`. Qdrant tracks document frequency per token across the corpus and multiplies the stored TF by IDF at query time.

## Search

### Semantic search (`semanticSearch`)

Pure dense. Used by `POST /ai/rag/search`.

1. Embed the query with `taskType: RETRIEVAL_QUERY`.
2. Send the dense vector to Qdrant with `using: 'dense'`.
3. Qdrant computes cosine similarity against every dense vector (under the payload filter), returns the top-K.
4. Optionally filter by `scoreThreshold` (default `0.7` — high, suitable for raw cosine).

Strength: catches paraphrases ("how to speed up SQL" ↔ "improving query performance").
Weakness: misses exact identifiers and rare keywords ("XYZ-Auth-Token") that aren't well represented in the embedding space.

### Hybrid search (`hybridSearch`)

Dense + sparse with RRF fusion. Used by `POST /ai/rag/hybrid-search` and inside `/ai/rag/chat`.

Single Qdrant request with two `prefetch` branches:

```
prefetch:
  - dense  vector, limit = topK * 3
  - sparse vector, limit = topK * 3
query: { fusion: 'rrf' }
limit: topK
```

1. Qdrant runs both prefetch branches in parallel and produces two ranked lists of `topK * 3` candidates.
2. Qdrant fuses them with RRF: each candidate's final score is `Σ 1 / (60 + rank_in_each_list)` (k=60 is the Qdrant default).
3. Top-K of the fused list is returned. Final scores live in ~`0.003–0.05` — that's why the default `RAG_RETRIEVAL_HYBRID_SCORE_THRESHOLD` is low (`0.1` is already aggressive; `0.01–0.02` is more typical).
4. The 3× over-fetch widens the candidate pool so both modalities have room to contribute before fusion truncates.

Strength: combines semantic recall with lexical precision. Sparse rescues exact-match queries; dense rescues conceptual queries.

## Reranking (MMR)

`src/rag/reranking/mmr.ts`. Applied only in `chat()` because chat answers benefit most from non-redundant context.

Why: hybrid search often returns multiple near-duplicate chunks from the same article. The LLM then "sees" the same fact several times and ignores the rest of the candidate pool. MMR diversifies.

Algorithm (greedy):

```
pool = candidates (each with its dense vector)
selected = []
while |selected| < topK:
  for each c in pool:
    relevance = cos(c.vector, queryVector)
    diversity = max(cos(c.vector, s.vector) for s in selected)   # 0 if selected empty
    score     = λ · relevance − (1 − λ) · diversity
  move argmax(score) from pool to selected
return selected
```

- `λ = 0.5` by default → equal weight to relevance and diversity. `λ → 1` collapses to plain top-K by relevance; `λ → 0` maximizes spread regardless of query.
- Candidate pool size: `topK * candidateMultiplier` (default 3). Bigger pool = more diversity headroom, more compute.
- Requires `withVector: true` on the hybrid call so Qdrant returns chunk vectors; without them MMR has nothing to compare.
- Toggle via `RAG_RERANK_ENABLED`. When off, hybrid hits are passed through unchanged.

MMR is a **bi-encoder** rerank — it operates on already-computed vectors. A **cross-encoder** rerank (e.g. Cohere Rerank) would re-score each (query, chunk) pair with a heavier model. We chose MMR because it's free, in-process, and addresses the most visible failure mode (duplicates).

## What Qdrant does for us

Everything that benefits from being close to the data:

- Stores dense vectors (HNSW index, cosine distance) and sparse vectors in one collection.
- Computes IDF across the collection (`modifier: 'idf'`) so we only ship TF.
- Runs the dense and sparse prefetch branches in parallel.
- Performs RRF fusion.
- Filters by payload (`status`, `categoryId`, `tags`) before scoring — fast, since `articleId` and other keyword fields are indexed.
- Applies score thresholds.
- Deletes by filter (used to wipe a single article's chunks before re-upsert).

What we do in-process: chunking, Gemini calls, sparse vector construction (TF only), MMR, prompt assembly, grounded JSON parsing, conversation history.

## Generation

`RagService.chat()` builds a prompt with `ragGroundedPrompt` (`src/rag/prompts/rag-grounded.prompt.ts`):

- Embeds the question, runs hybrid search, MMR-reranks.
- If no hits: returns a canned "I could not find relevant information" answer without calling Gemini.
- Otherwise injects sources + conversation history into the prompt.
- Forces structured JSON output via `responseJsonSchema` (`ragChatResponseSchema`): `{ answer: string, sources: number[] }`.
- Validates the response with Zod, persists turns to `ConversationStore`, maps source indexes back to their chunks for attribution.

Conversation history is stored in memory only (`ConversationStore`), capped at `RAG_CONVERSATION_MAX_MESSAGES` (default 20) per `conversationId`, and lost on restart.

## Configuration cheatsheet

| Env var | Default | What it controls |
|---|---|---|
| `RAG_VECTOR_DB_URL` | `http://vectordb:6333` | Qdrant endpoint |
| `RAG_VECTOR_COLLECTION` | `knowledge_hub_articles` | Qdrant collection name |
| `RAG_CHUNK_SIZE` / `RAG_CHUNK_OVERLAP` | `800` / `200` | Chunk geometry |
| `EMBEDDING_DIMENSION` | `768` | Dense vector size (must match Gemini model) |
| `EMBEDDING_BATCH_SIZE` | `100` | Chunks per Gemini embed call |
| `RAG_RETRIEVAL_TOP_K` | `10` | Final result count |
| `RAG_RETRIEVAL_SEMANTIC_SCORE_THRESHOLD` | `0.7` | Min cosine for `/search` |
| `RAG_RETRIEVAL_HYBRID_SCORE_THRESHOLD` | `0.1` | Min RRF score for hybrid + chat |
| `RAG_RERANK_ENABLED` | `true` | Toggle MMR in chat |
| `RAG_RERANK_CANDIDATE_MULTIPLIER` | `3` | MMR pool size = `topK * this` |
| `RAG_RERANK_MMR_LAMBDA` | `0.5` | MMR relevance/diversity balance |
| `RAG_CONVERSATION_MAX_MESSAGES` | `20` | Chat history cap per session |
