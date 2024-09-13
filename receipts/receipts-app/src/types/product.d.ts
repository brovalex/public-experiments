import { Product as PrismaProduct, ReferenceItem } from '@prisma/client';

export interface ProductWithRelationships extends PrismaProduct {
  referenceItem: ReferenceItem;
}