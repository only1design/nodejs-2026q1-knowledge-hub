import { VectorSearchHit } from '../vector-store/article-vector.store';

const cosineSim = (a: number[], b: number[]): number => {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
};

export interface MmrParams {
  queryVector: number[];
  candidates: VectorSearchHit[];
  topK: number;
  lambda: number;
  enabled: boolean;
}

export const mmrRerank = ({
  queryVector,
  candidates,
  topK,
  lambda,
  enabled = true,
}: MmrParams): VectorSearchHit[] => {
  if (!enabled) return candidates.slice(0, topK);

  const pool = candidates.filter((c) => c.vector?.length);
  const selected: VectorSearchHit[] = [];

  while (selected.length < topK && pool.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[i];
      const relevance = cosineSim(candidate.vector!, queryVector);
      const diversity =
        selected.length === 0
          ? 0
          : Math.max(
              ...selected.map((s) => cosineSim(candidate.vector!, s.vector!)),
            );
      const score = lambda * relevance - (1 - lambda) * diversity;

      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    selected.push(pool.splice(bestIdx, 1)[0]);
  }

  return selected;
};
