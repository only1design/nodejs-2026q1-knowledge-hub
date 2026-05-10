import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { GeminiService } from '../ai/gemini.service';
import { ArticleService } from '../article/article.service';
import { ArticleStatus } from '../article/entities/article.entity';
import { NotFoundError, ServiceUnavailableError } from '../errors/app.errors';
import { chunkArticle } from './chunking/article-chunker';
import {
  ConversationRole,
  ConversationStore,
} from './conversation/conversation.store';
import { RagChatDto } from './dto/rag-chat.dto';
import { RagSearchDto } from './dto/rag-search.dto';
import { ReindexDto } from './dto/reindex.dto';
import { ragGroundedPrompt } from './prompts/rag-grounded.prompt';
import { geminiEmbeddingTaskType, ragConfig } from './rag.constants';
import {
  ragChatResponseJsonSchema,
  ragChatResponseSchema,
} from './schemas/rag-generated.schema';
import { ArticleVectorStore } from './vector-store/article-vector.store';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly articleVectorStore: ArticleVectorStore,
    private readonly conversationStore: ConversationStore,
    private readonly geminiService: GeminiService,
    private readonly articleService: ArticleService,
  ) {}

  async index(reindexDto: ReindexDto) {
    const articles = await this.articleService.findAll({
      status: reindexDto.onlyPublished ? ArticleStatus.PUBLISHED : undefined,
      ids: reindexDto.articleIds ?? undefined,
    });

    if (articles.length === 0) {
      return {
        indexedArticles: 0,
        indexedChunks: 0,
        vectorCollection: this.articleVectorStore.collectionName,
      };
    }

    await Promise.all(
      articles.map((article) =>
        this.articleVectorStore.deleteByArticleId(article.id),
      ),
    );

    const chunkPayloads = (
      await Promise.all(articles.map(chunkArticle))
    ).flat();
    const vectors = await this.embedChunks(
      chunkPayloads.map((payload) => payload.chunk),
    );

    const points = chunkPayloads.map((payload, i) => ({
      vector: vectors[i],
      payload,
    }));
    await this.articleVectorStore.upsertChunks(points);

    this.logger.log(
      `Indexed ${articles.length} articles into ${chunkPayloads.length} chunks`,
    );

    return {
      indexedArticles: articles.length,
      indexedChunks: chunkPayloads.length,
      vectorCollection: this.articleVectorStore.collectionName,
    };
  }

  private async embedChunks(chunks: string[]) {
    const embeddings: number[][] = [];

    for (let i = 0; i < chunks.length; i += ragConfig.embedding.batchSize) {
      const batch = chunks.slice(i, i + ragConfig.embedding.batchSize);
      const batchContents = batch.map((text) => ({ parts: [{ text }] }));
      const response = await this.geminiService.embedContent(batchContents, {
        outputDimensionality: ragConfig.embedding.dimensions,
        taskType: geminiEmbeddingTaskType.RETRIEVAL_DOCUMENT,
      });

      const batchVectors =
        response.embeddings?.map(
          (contentEmbedding) => contentEmbedding.values ?? [],
        ) ?? [];
      embeddings.push(...batchVectors);
    }

    return embeddings;
  }

  private async embedQuery(query: string) {
    const embeddedQuery = await this.geminiService.embedContent(query, {
      outputDimensionality: ragConfig.embedding.dimensions,
      taskType: geminiEmbeddingTaskType.RETRIEVAL_QUERY,
    });

    const vector = embeddedQuery.embeddings?.[0]?.values;
    if (!vector?.length)
      throw new ServiceUnavailableError('Failed to embed query');

    return vector;
  }

  async search(ragSearchDto: RagSearchDto) {
    const vector = await this.embedQuery(ragSearchDto.query);

    const results = await this.articleVectorStore.search({
      vector,
      limit: ragSearchDto.limit,
      filter: this.articleVectorStore.buildFilter({
        status: ragSearchDto.articleStatus,
        categoryId: ragSearchDto.categoryId,
        tags: ragSearchDto.tags,
      }),
    });

    return {
      results: results.map((hit) => ({
        articleId: hit.payload.articleId,
        articleTitle: hit.payload.articleTitle,
        chunk: hit.payload.chunk,
        similarity: hit.score,
      })),
    };
  }

  async chat(ragChatDto: RagChatDto) {
    const conversationId = ragChatDto.conversationId ?? randomUUID();
    const queryVector = await this.embedQuery(ragChatDto.question);
    const vectorSearchHits = await this.articleVectorStore.search({
      vector: queryVector,
      limit: ragConfig.retrieval.topK,
      score_threshold: ragConfig.retrieval.scoreThreshold,
    });

    this.logger.debug(
      `RAG search: ${vectorSearchHits.length} hits, scores: [${vectorSearchHits.map((h) => h.score.toFixed(2)).join(', ')}]`,
    );

    if (vectorSearchHits.length === 0) {
      this.conversationStore.append(conversationId, {
        role: ConversationRole.USER,
        content: ragChatDto.question,
      });

      return {
        answer:
          'I could not find relevant information in the Knowledge Hub to answer this question.',
        sources: [],
        conversationId,
      };
    }

    const prompt = ragGroundedPrompt(
      ragChatDto.question,
      vectorSearchHits,
      this.conversationStore.get(conversationId),
    );
    const generatedResponse = await this.geminiService.generateContent(prompt, {
      responseMimeType: 'application/json',
      responseJsonSchema: ragChatResponseJsonSchema,
    });

    try {
      const ragChatResponse = ragChatResponseSchema.parse(
        JSON.parse(generatedResponse.text),
      );

      this.conversationStore.append(conversationId, {
        role: ConversationRole.USER,
        content: ragChatDto.question,
      });
      this.conversationStore.append(conversationId, {
        role: ConversationRole.ASSISTANT,
        content: ragChatResponse.answer,
      });

      const sources = ragChatResponse.sources
        .filter((sourceIndex) => vectorSearchHits?.[sourceIndex]?.payload)
        .map((sourceIndex) => vectorSearchHits[sourceIndex].payload);

      return {
        answer: ragChatResponse.answer,
        sources,
        conversationId,
      };
    } catch (e) {
      this.logger.error(e);

      throw new ServiceUnavailableError(
        'AI service returned an invalid response',
      );
    }
  }

  async deleteArticleFromIndex(articleId: string) {
    const count = await this.articleVectorStore.deleteByArticleId(articleId);

    if (count === 0) {
      throw new NotFoundError('Article is not indexed in the vector store');
    }
  }

  getChatHistory(conversationId: string) {
    const conversation = this.conversationStore.get(conversationId);

    return {
      conversationId,
      conversation,
    };
  }
}
