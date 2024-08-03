// app/api/receipt/route.js

// model Receipt {
//   id              Int       @id @default(autoincrement())
//   expenses        Expense[]
//   imageFiles      ImageFile[]
  
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // const { url, receiptId } = await req.json();

    // Create a new ReferenceItem
    const newReceipt = await prisma.receipt.create({
      data: {
      },
    });

    return new Response(JSON.stringify(newReceipt), { status: 200 });
  } catch (error) {
    console.error('Error creating receipt:', error);
    return new Response(JSON.stringify({ error: 'Failed to create receipt '+error }), { status: 500 });
  }
}
