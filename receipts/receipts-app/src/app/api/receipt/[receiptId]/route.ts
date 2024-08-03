// app/api/receipts/[receiptId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { receiptId: string } }) {
  try {
    const { receiptId } = params;
    console.log(receiptId)
    const receipt = await prisma.receipt.findUnique({
      where: { id: Number(receiptId) },
      include: { expenses: true, imageFiles: true },
    });
    return NextResponse.json(receipt);
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return NextResponse.json({ error: 'Failed to fetch receipt '+error }, { status: 500 });
  }
}