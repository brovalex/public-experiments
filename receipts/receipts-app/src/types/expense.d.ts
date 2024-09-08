import { Product, Expense as PrismaExpense } from '@prisma/client';

export interface ExpenseWithRelationships extends PrismaExpense {
  product: Product?;
}