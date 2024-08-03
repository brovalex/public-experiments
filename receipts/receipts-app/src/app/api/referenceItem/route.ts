// app/api/referenceItem/route.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const { name, quantity, unitOfMeasure, price, pricePerWeight, referenceUrl } = await req.json();

    // Create a new ReferenceItem
    const newReferenceItem = await prisma.referenceItem.create({
      data: {
        name,
        quantity,
        unitOfMeasure,
        price,
        pricePerWeight,
        referenceUrl,
      },
    });
    return NextResponse.json(newReferenceItem, { status: 201 });
  } catch (error) {
    console.error('Error creating reference item:', error);
    return NextResponse.json({ error: 'Failed to create reference item '+error }, { status: 500 });
  }
}
