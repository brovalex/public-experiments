import { Expense, ReceiptText as PrismaReceiptText } from '@prisma/client';

export interface ReceiptTextWithRelationships extends PrismaReceiptText {
  expense: Expense?;
}