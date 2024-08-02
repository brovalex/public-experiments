// app/api/referenceItem/route.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
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

    return new Response(JSON.stringify(newReferenceItem), { status: 200 });
  } catch (error) {
    console.error('Error creating reference item:', error);
    return new Response(JSON.stringify({ error: 'Failed to create reference item '+error }), { status: 500 });
  }
}
