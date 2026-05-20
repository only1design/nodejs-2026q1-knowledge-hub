import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { ArticleStatus, PrismaClient } from '../generated/prisma/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const data = JSON.parse(readFileSync(join(__dirname, 'data.json'), 'utf-8'));

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CRYPT_SALT = parseInt(process.env.CRYPT_SALT || '10');

async function main() {
  const now = BigInt(Date.now());

  const aliceId = '2ff4bc32-302a-459c-9ded-40899358194a';
  const alice = await prisma.user.upsert({
    where: { id: aliceId },
    update: {},
    create: {
      id: aliceId,
      login: 'alice',
      password: await bcrypt.hash('alice123', CRYPT_SALT),
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    },
  });

  const davidId = '3ff4bc32-302a-459c-9ded-40899358194a';
  const david = await prisma.user.upsert({
    where: { id: davidId },
    update: {},
    create: {
      id: davidId,
      login: 'david',
      password: await bcrypt.hash('david123', CRYPT_SALT),
      role: 'editor',
      createdAt: now,
      updatedAt: now,
    },
  });

  const categories = [
    await prisma.category.upsert({
      where: { id: '4ff4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '4ff4bc32-302a-459c-9ded-40899358194a',
        name: 'General',
        description: 'General category',
      },
    }),
    await prisma.category.upsert({
      where: { id: '5ff4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '5ff4bc32-302a-459c-9ded-40899358194a',
        name: 'News',
        description: 'News category',
      },
    }),
    await prisma.category.upsert({
      where: { id: '6ff4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '6ff4bc32-302a-459c-9ded-40899358194a',
        name: 'Sport',
        description: 'Sport category',
      },
    }),
  ];

  const tags = [
    await prisma.tag.upsert({
      where: { id: '7ff4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '7ff4bc32-302a-459c-9ded-40899358194a',
        name: 'Popular',
      },
    }),
    await prisma.tag.upsert({
      where: { id: '8ff4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '8ff4bc32-302a-459c-9ded-40899358194a',
        name: 'Trending',
      },
    }),
    await prisma.tag.upsert({
      where: { id: '9ff4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '9ff4bc32-302a-459c-9ded-40899358194a',
        name: 'Latest',
      },
    }),
    await prisma.tag.upsert({
      where: { id: '10f4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '10f4bc32-302a-459c-9ded-40899358194a',
        name: 'Top',
      },
    }),
    await prisma.tag.upsert({
      where: { id: '11f4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '11f4bc32-302a-459c-9ded-40899358194a',
        name: 'Hot',
      },
    }),
  ];

  const articleMeta: Array<{
    authorId: string;
    categoryId: string;
    tagIds: string[];
    status: ArticleStatus;
  }> = [
    {
      authorId: aliceId,
      categoryId: categories[0].id,
      tagIds: [tags[0].id, tags[1].id],
      status: ArticleStatus.published,
    },
    {
      authorId: davidId,
      categoryId: categories[1].id,
      tagIds: [tags[0].id, tags[3].id],
      status: ArticleStatus.published,
    },
    {
      authorId: aliceId,
      categoryId: categories[2].id,
      tagIds: [tags[1].id, tags[2].id],
      status: ArticleStatus.published,
    },
    {
      authorId: davidId,
      categoryId: categories[1].id,
      tagIds: [tags[0].id, tags[2].id],
      status: ArticleStatus.published,
    },
    {
      authorId: aliceId,
      categoryId: categories[0].id,
      tagIds: [tags[4].id],
      status: ArticleStatus.published,
    },
    {
      authorId: davidId,
      categoryId: categories[0].id,
      tagIds: [tags[2].id, tags[3].id],
      status: ArticleStatus.published,
    },
    {
      authorId: aliceId,
      categoryId: categories[1].id,
      tagIds: [tags[1].id, tags[4].id],
      status: ArticleStatus.draft,
    },
    {
      authorId: davidId,
      categoryId: categories[0].id,
      tagIds: [tags[0].id, tags[4].id],
      status: ArticleStatus.archived,
    },
  ];

  const articles = await Promise.all(
    data.articles.map((article, i) =>
      prisma.article.upsert({
        where: { id: article.id },
        update: {},
        create: {
          id: article.id,
          title: article.title,
          content: article.content,
          status: articleMeta[i].status,
          authorId: articleMeta[i].authorId,
          categoryId: articleMeta[i].categoryId,
          createdAt: now,
          updatedAt: now,
          tags: { connect: articleMeta[i].tagIds.map((id) => ({ id })) },
        },
      }),
    ),
  );

  const comments = [
    await prisma.comment.upsert({
      where: { id: '17f4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '17f4bc32-302a-459c-9ded-40899358194a',
        content: 'Great introduction to Prisma!',
        authorId: davidId,
        articleId: articles[0].id,
        createdAt: now,
      },
    }),
    await prisma.comment.upsert({
      where: { id: '18f4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '18f4bc32-302a-459c-9ded-40899358194a',
        content: 'Exciting news about Node.js 24!',
        authorId: aliceId,
        articleId: articles[1].id,
        createdAt: now,
      },
    }),
    await prisma.comment.upsert({
      where: { id: '19f4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '19f4bc32-302a-459c-9ded-40899358194a',
        content: 'What a season it was!',
        authorId: davidId,
        articleId: articles[2].id,
        createdAt: now,
      },
    }),
  ];

  console.log({ alice, david, categories, tags, articles, comments });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
