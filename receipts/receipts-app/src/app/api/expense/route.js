// app/api/expense/route.js

// model Expense {
//   id        Int   @id @default(autoincrement())
  // priceEach Float
  // quantity  Float

  // receiptId       Int
//   receipt         Receipt       @relation(fields: [receiptId], references: [id])
  // receiptTextId   Int?           @unique
//   receiptText     ReceiptText?   @relation(fields: [receiptTextId], references: [id])
  // referenceItemId Int           @unique
//   referenceItem   ReferenceItem @relation(fields: [referenceItemId], references: [id])

//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { priceEach, quantity, receiptId, receiptTextId, referenceItemId } = await req.json();

    // Create a new Expense
    const newExpense = await prisma.expense.create({
      data: {
        "priceEach": priceEach,
        "quantity": quantity,
        "receipt": { connect: { id: receiptId } },
        "receiptText": { connect: { id: receiptTextId } },
        "referenceItem": { connect: { id: referenceItemId } },
      }
    });

    return new Response(JSON.stringify(newExpense), { status: 200 });
  } catch (error) {
    console.error('Error creating receipt text:', error);
    return new Response(JSON.stringify({ error: 'Failed to create receipt text '+error }), { status: 500 });
  }
}
