// src/utils/expensesUtils.ts

import { ExpenseWithRelationships } from '@/types/expense';
import { ReceiptText } from '@prisma/client';

export const sortExpenses = (
    expenses: ExpenseWithRelationships[], 
    receiptTexts: ReceiptText[]
): ExpenseWithRelationships[] => {
    return expenses.sort((a, b) => {
        // Find corresponding receipt text for each expense
        const receiptTextA = receiptTexts.find(rt => rt.id === a.receiptTextId);
        const receiptTextB = receiptTexts.find(rt => rt.id === b.receiptTextId);

        if (!receiptTextA || !receiptTextB) {
        return 0; // Handle case where receiptText is missing
        }

        // Parse the boundingBox as an array of arrays of numbers
        const boundingBoxA = receiptTextA.boundingBox ? JSON.parse(receiptTextA.boundingBox) as [number, number][] : [];
        const boundingBoxB = receiptTextB.boundingBox ? JSON.parse(receiptTextB.boundingBox) as [number, number][] : [];

        // Extract the smallest y value from each bounding box
        const minYA = Math.min(...boundingBoxA.map(point => point[1]));
        const minYB = Math.min(...boundingBoxB.map(point => point[1]));

        // Sort by the smallest y value
        return minYA - minYB;
    });
}