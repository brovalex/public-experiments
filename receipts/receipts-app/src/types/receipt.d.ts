import { ImageFileWithRelationships, ExpenseWithRelationships, Receipt as PrismaReceipt } from '@prisma/client';

export interface ReceiptWithRelationships extends PrismaReceipt {
  imageFiles: ImageFileWithRelationships[];
  expenses: ExpenseWithRelationships[];
}