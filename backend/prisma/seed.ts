/**
 * Seed script — creates a demo user with a folder, tags, and a couple of notes.
 * Safe to run repeatedly (idempotent upserts). Run: pnpm --filter @nenap/backend db:seed
 */
import { PrismaClient, NoteStatus } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: { id: DEMO_USER_ID, email: 'demo@nenap.app', displayName: 'Demo' },
  });

  const folder = await prisma.folder.upsert({
    where: { userId_name: { userId: user.id, name: 'Ideas' } },
    update: {},
    create: { userId: user.id, name: 'Ideas' },
  });

  const tag = await prisma.tag.upsert({
    where: { userId_name: { userId: user.id, name: 'important' } },
    update: {},
    create: { userId: user.id, name: 'important' },
  });

  await prisma.note.create({
    data: {
      userId: user.id,
      folderId: folder.id,
      title: 'Welcome to Nenap',
      originalContent: 'Focus on the moment. Nenap remembers the rest.',
      status: NoteStatus.completed,
      tags: { connect: { id: tag.id } },
    },
  });

  console.log('Seeded demo user, folder, tag, and a note.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
