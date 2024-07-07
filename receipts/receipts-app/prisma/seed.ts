// I don't really need to seed through Next.js because I'll seed via Python notebook separately
// but it's nice to have to test

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UnitOfMeasure = [
    { name: 'g' },
    { name: 'mL' },
    { name: 'Count' },
];

const seed = async () => {
  // clean up before the seeding (optional)
  await prisma.expense.deleteMany();

  // createMany not supported for databases e.g. SQLite https://github.com/prisma/prisma/issues/10710
  for (const UoM of UnitOfMeasure) {
    await prisma.unitOfMeasure.create({
      data: UoM,
    });
  }
};

seed();