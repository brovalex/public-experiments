// app/api/imageFile/route.js

// model ImageFile {                                         // as opposed to RawImageFile (not implemented yet) 
//   id       Int     @id @default(autoincrement())
//   url      String                                         // ./store/optimized_images/1.jpg

//   receiptId       Int?
//   receipt         Receipt?     @relation(fields: [receiptId], references: [id])
//   receiptText     ReceiptText[]

//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt   
// }

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { url, receiptId } = await req.json();

    // Create a new ReferenceItem
    const newImageFile = await prisma.imageFile.create({
      data: {
        url,
        receipt: { connect: { id: receiptId } },
      },
    });
    return NextResponse.json(newImageFile, { status: 201 });
  } catch (error) {
    console.error('Error creating image file:', error);
    return NextResponse.json({ error: 'Failed to create image file '+error }, { status: 500 });
  }
}
