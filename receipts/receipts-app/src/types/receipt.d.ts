import { ImageFile, Expense, Receipt as PrismaReceipt } from '@prisma/client';

export interface ReceiptWithRelationships extends PrismaReceipt {
  imageFiles: ImageFile[];
  expenses: Exepnse[];
}