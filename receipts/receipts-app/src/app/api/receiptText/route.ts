// app/api/receiptText/route.js

// model ReceiptText {
//   id              Int     @id @default(autoincrement())
//   text            String
//   boundingBox     String? // it's actually a JSON, need to deserialize after; eventually use Postgress

//   expenseId       Int     @unique
//   expense         Expense?
//   imageFileId     Int
//   imageFile       ImageFile @relation(fields: [imageFileId], references: [id])

//   createdAt DateTime  @default(now())
//   updatedAt DateTime  @updatedAt
// }

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { text, boundingBox, expenseId, imageFileId } = await req.json();

    // Check if the imageFileId exists
    const imageFile = await prisma.imageFile.findUnique({
      where: { id: imageFileId }
    });

    if (!imageFile) {
      return NextResponse.json({ error: 'ImageFile not found' }, { status: 404 });
    }

    // Create a new ReferenceItem
    const newReceiptText = await prisma.receiptText.create({
      data: {
        "text": text,
        "boundingBox": boundingBox,
        "imageFile": { connect: { id: imageFileId } },
      }
    });
    return NextResponse.json(newReceiptText, { status: 201 });
  } catch (error) {
    console.error('Error creating receipt text:', error);
    return NextResponse.json({ error: 'Failed to create receipt text '+error }, { status: 500 });
  }
}
