import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Article } from '../../article/entities/article.entity';
import { ragConfig } from '../rag.constants';
import { ChunkPayload } from '../vector-store/article-vector.store';

export const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: ragConfig.chunk.size,
  chunkOverlap: ragConfig.chunk.overlap,
});

export const chunkArticle = async (
  article: Article,
): Promise<ChunkPayload[]> => {
  const chunks = await splitter.splitText(article.content);

  return chunks.map((chunk) => ({
    articleId: article.id,
    articleTitle: article.title,
    status: article.status,
    categoryId: article.categoryId,
    tags: article.tags,
    chunk,
  }));
};
