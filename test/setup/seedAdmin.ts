import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

config({ path: 'config/.env.local' });

export const SEED_ADMIN_LOGIN = 'TEST_SEED_ADMIN';
export const SEED_ADMIN_PASSWORD = 'TestSeedAdmin123!';

const CRYPT_SALT = parseInt(process.env.CRYPT_SALT || '10');

export default async function globalSetup(): Promise<void> {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
  });
  const hashedPassword = await bcrypt.hash(SEED_ADMIN_PASSWORD, CRYPT_SALT);
  const now = BigInt(Date.now());

  try {
    await prisma.user.upsert({
      where: { login: SEED_ADMIN_LOGIN },
      update: { role: 'admin', password: hashedPassword },
      create: {
        login: SEED_ADMIN_LOGIN,
        password: hashedPassword,
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
