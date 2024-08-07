// app/api/receiptText/[receiptId]/route.js

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
import { PrismaClient, ReceiptText as PrismaReceiptText } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { receiptId: number } }) {
  try {
    const receiptId: number = Number(params.receiptId);

    if (!receiptId) {
      return NextResponse.json({ message: 'receipt id required' + receiptId }, { status: 400 });
    }

    const receiptTexts: PrismaReceiptText[] = await prisma.receiptText.findMany({
      where: {
        imageFile: {
          receiptId: receiptId,
        },
      },
      include: {
        imageFile: true,
      },
    });
    // const ReceiptTexts: PrismaReceiptText[] = await prisma.receiptText.findMany({
    //   where: { imageFileId },
    // });
    return NextResponse.json(receiptTexts);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching receipt texts' }, { status: 500 });
  }
}
