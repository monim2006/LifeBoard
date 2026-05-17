import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('P@ssw0rd!', 10);

  await prisma.user.upsert({
    where: { email: 'demo@lifeboard.local' },
    update: {
      username: 'demo',
      passwordHash,
      theme: 'light',
      currency: 'USD',
      weekStartDay: 'Monday',
    },
    create: {
      email: 'demo@lifeboard.local',
      username: 'demo',
      passwordHash,
      theme: 'light',
      currency: 'USD',
      weekStartDay: 'Monday',
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
