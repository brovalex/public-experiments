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

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { priceEach, quantity, receiptId, receiptTextId, productId } = await req.json();

    // Create a new Expense
    const newExpense = await prisma.expense.create({
      data: {
        "priceEach": priceEach,
        "quantity": quantity,
        "receipt": { connect: { id: receiptId } },
        "receiptText": { connect: { id: receiptTextId } },
        "product": { connect: { id: productId } },
      },
      include: {
        product: true,
      },
    });

    // Fetch the reference item for productId
    if (newExpense && newExpense.product) {
      const referenceItem = await prisma.referenceItem.findUnique({
        where: { id: newExpense.product.referenceItemId },
      });
    
      if (referenceItem) {
        newExpense.product.referenceItem = referenceItem;
      }
    }

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('Error creating receipt text:', error);
    return NextResponse.json({ error: 'Failed to create expense '+error }, { status: 500 });
  }
}
