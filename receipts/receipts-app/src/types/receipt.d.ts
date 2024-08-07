import { ImageFileWithRelationships, Expense, Receipt as PrismaReceipt } from '@prisma/client';

export interface ReceiptWithRelationships extends PrismaReceipt {
  imageFiles: ImageFileWithRelationships[];
  expenses: Expense[];
}