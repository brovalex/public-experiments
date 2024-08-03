// app/api/receipt/route.js

// model Receipt {
//   id              Int       @id @default(autoincrement())
//   expenses        Expense[]
//   imageFiles      ImageFile[]
  
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // const { url, receiptId } = await req.json();

    // Create a new ReferenceItem
    const newReceipt = await prisma.receipt.create({
      data: {
      },
    });
    return NextResponse.json(newReceipt, { status: 201 });
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json({ error: 'Failed to create receipt '+error }, { status: 500 });
  }
}
