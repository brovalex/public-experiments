import { ImageFile as PrismaImageFile, ReceiptText } from '@prisma/client';

export interface ImageFileWithRelationships extends PrismaImageFile {
  receiptTexts: ReceiptText[];
}