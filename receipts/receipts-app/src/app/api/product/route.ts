// app/api/product/route.js

import { PrismaClient } from '@prisma/client';

// model Product {
//   id              Int       @id @default(autoincrement())
//   name            String
//   weight          Float
//   unitOfMeasure   String
//   referenceItemId Int
//   referenceItem   ReferenceItem @relation(fields: [referenceItemId], references: [id])

//   expenses        Expense[]
  
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

const prisma = new PrismaClient();

import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const { name, weight, unitOfMeasure, referenceItemId } = await req.json();

    // Create a new product
    const newproduct = await prisma.product.create({
      data: {
        name,
        weight,
        unitOfMeasure,
        referenceItem: {
          connect: {
            id: referenceItemId,
          },
        },
      },
    });
    return NextResponse.json(newproduct, { status: 201 });
  } catch (error) {
    console.error('Error creating reference item:', error);
    return NextResponse.json({ error: 'Failed to create reference item '+error }, { status: 500 });
  }
}
