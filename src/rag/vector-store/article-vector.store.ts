import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { randomUUID } from 'node:crypto';
import { ServiceUnavailableError } from '../../errors/app.errors';
import { ragConfig } from '../rag.constants';

export interface ChunkPayload {
  articleId: string;
  articleTitle: string;
  status: string;
  categoryId?: string;
  tags: string[];
  chunk: string;
}

export interface ChunkPoint {
  vector: number[];
  payload: ChunkPayload;
}

export interface VectorSearchFilter {
  status?: string;
  categoryId?: string;
  tags?: string[];
}

export interface VectorSearchHit {
  payload: ChunkPayload;
  score: number;
}

@Injectable()
export class ArticleVectorStore implements OnModuleInit {
  private readonly logger = new Logger(ArticleVectorStore.name);
  private readonly client = new QdrantClient({ url: ragConfig.vector.url });
  private readonly collection = ragConfig.vector.collection;

  get collectionName(): string {
    return this.collection;
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  private async ensureCollection() {
    try {
      const exists = await this.client.collectionExists(this.collection);
      if (exists.exists) return;

      await this.client.createCollection(this.collection, {
        vectors: {
          size: ragConfig.embedding.dimensions,
          distance: 'Cosine',
        },
      });
      await this.client.createPayloadIndex(this.collection, {
        field_name: 'articleId',
        field_schema: 'keyword',
      });
      this.logger.log(`Created Qdrant collection "${this.collection}"`);
    } catch (e) {
      this.logger.error('Failed to bootstrap vector collection', e);
      throw new ServiceUnavailableError('Vector DB is unavailable');
    }
  }

  async upsertChunks(points: ChunkPoint[]): Promise<void> {
    if (points.length === 0) return;

    try {
      await this.client.upsert(this.collection, {
        wait: true,
        points: points.map((point) => ({
          id: randomUUID(),
          vector: point.vector,
          payload: point.payload as unknown as Record<string, unknown>,
        })),
      });
    } catch (e) {
      this.logger.error('Vector upsert failed', e);
      throw new ServiceUnavailableError('Vector DB is unavailable');
    }
  }

  async search(
    searchConfig: Parameters<QdrantClient['search']>[1],
  ): Promise<VectorSearchHit[]> {
    try {
      const results = await this.client.search(this.collection, {
        with_payload: true,
        ...searchConfig,
      });

      return results.map((result) => ({
        payload: result.payload as unknown as ChunkPayload,
        score: result.score,
      }));
    } catch (e) {
      this.logger.error('Vector search failed', e);
      throw new ServiceUnavailableError('Vector DB is unavailable');
    }
  }

  async deleteByArticleId(articleId: string): Promise<number> {
    const filter = {
      must: [{ key: 'articleId', match: { value: articleId } }],
    };

    try {
      const { count } = await this.client.count(this.collection, {
        filter,
        exact: true,
      });

      if (count === 0) return 0;

      await this.client.delete(this.collection, { wait: true, filter });

      return count;
    } catch (e) {
      this.logger.error('Vector delete failed', e);
      throw new ServiceUnavailableError('Vector DB is unavailable');
    }
  }

  public buildFilter(filter?: VectorSearchFilter) {
    if (!filter) return undefined;

    const must: Array<Record<string, unknown>> = [];

    if (filter.status) {
      must.push({ key: 'status', match: { value: filter.status } });
    }
    if (filter.categoryId) {
      must.push({ key: 'categoryId', match: { value: filter.categoryId } });
    }
    if (filter.tags?.length) {
      must.push({ key: 'tags', match: { any: filter.tags } });
    }

    return must.length ? { must } : undefined;
  }
}
