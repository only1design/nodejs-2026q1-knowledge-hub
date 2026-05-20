import { createHash } from 'node:crypto';
import { Article } from '../../article/entities/article.entity';

export const computeArticleHash = (article: Article): string => {
  const payload = JSON.stringify({
    title: article.title,
    content: article.content,
    status: article.status,
    categoryId: article.categoryId,
    tags: [...article.tags].sort(),
  });
  return createHash('sha256').update(payload).digest('hex');
};

export const needsReindex = (article: Article): boolean => {
  const neverIndexed = article.lastIndexedAt == null;
  if (neverIndexed) return true;

  const untouchedSinceIndex = article.updatedAt <= article.lastIndexedAt!;
  if (untouchedSinceIndex) return false;

  return article.lastIndexedHash !== computeArticleHash(article);
};
