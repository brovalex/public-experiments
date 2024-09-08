import { Product, Expense as PrismaExpense } from '@prisma/client';

export interface ExpenseWithRelationShips extends PrismaExpense {
  product: Product?;
}