import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const now = Date.now();

  const aliceId = '2ff4bc32-302a-459c-9ded-40899358194a';
  const alice = await prisma.user.upsert({
    where: { id: aliceId },
    update: {},
    create: {
      id: aliceId,
      login: 'alice',
      password: 'alice123',
      role: 'ADMIN',
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
      password: 'david123',
      role: 'EDITOR',
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

  const articles = [
    await prisma.article.upsert({
      where: { id: '12f4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '12f4bc32-302a-459c-9ded-40899358194a',
        title: 'Getting Started with Prisma',
        content: 'A comprehensive guide to using Prisma ORM with NestJS',
        status: 'PUBLISHED',
        authorId: aliceId,
        categoryId: categories[0].id,
        createdAt: now,
        updatedAt: now,
        tags: { connect: [{ id: tags[0].id }, { id: tags[1].id }] },
      },
    }),
    await prisma.article.upsert({
      where: { id: '13f4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '13f4bc32-302a-459c-9ded-40899358194a',
        title: 'Breaking: New Node.js Release',
        content: 'Node.js 24 has been released with exciting new features',
        status: 'PUBLISHED',
        authorId: davidId,
        categoryId: categories[1].id,
        createdAt: now,
        updatedAt: now,
        tags: { connect: [{ id: tags[2].id }, { id: tags[4].id }] },
      },
    }),
    await prisma.article.upsert({
      where: { id: '14f4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '14f4bc32-302a-459c-9ded-40899358194a',
        title: 'Football Season Recap',
        content: 'A look back at the highlights of the football season',
        status: 'ARCHIVED',
        authorId: aliceId,
        categoryId: categories[2].id,
        createdAt: now,
        updatedAt: now,
        tags: { connect: [{ id: tags[0].id }, { id: tags[3].id }] },
      },
    }),
    await prisma.article.upsert({
      where: { id: '15f4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '15f4bc32-302a-459c-9ded-40899358194a',
        title: 'Docker Best Practices',
        content:
          'Draft article about Docker multi-stage builds and optimization',
        status: 'DRAFT',
        authorId: davidId,
        categoryId: categories[0].id,
        createdAt: now,
        updatedAt: now,
        tags: { connect: [{ id: tags[2].id }] },
      },
    }),
    await prisma.article.upsert({
      where: { id: '16f4bc32-302a-459c-9ded-40899358194a' },
      update: {},
      create: {
        id: '16f4bc32-302a-459c-9ded-40899358194a',
        title: 'Tennis Grand Slam Results',
        content: 'Coverage of the latest Grand Slam tournament',
        status: 'PUBLISHED',
        authorId: aliceId,
        categoryId: categories[2].id,
        createdAt: now,
        updatedAt: now,
        tags: {
          connect: [{ id: tags[1].id }, { id: tags[3].id }, { id: tags[4].id }],
        },
      },
    }),
  ];

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
