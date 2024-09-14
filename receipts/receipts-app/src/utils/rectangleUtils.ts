// src/utils/rectangleUtils.ts

import { ReceiptTextWithRelationships } from '@/types/receiptText';

interface Rectangle {
    rectX: number;
    rectY: number;
    rectWidth: number;
    rectHeight: number;
    receiptTextId: number;
    expenseId: number | null | undefined;
    selected?: boolean;
}

export const calculateRectangles = (
    receiptTexts: ReceiptTextWithRelationships[], 
    canvas: HTMLCanvasElement | null,
    image: HTMLImageElement | null
): Rectangle[] => {
    if (!canvas || !image) return [];
    const newRectangles = receiptTexts.map((receiptText) => {
        const parsedBoundingBox: number[][] = receiptText.boundingBox ? JSON.parse(receiptText.boundingBox) : [];

        const xCoords = parsedBoundingBox.map(coord => coord[0]);
        const yCoords = parsedBoundingBox.map(coord => coord[1]);

        const x = Math.min(...xCoords);
        const y = Math.min(...yCoords);
        const width = Math.max(...xCoords) - x;
        const height = Math.max(...yCoords) - y;

        const rectX = (x / image.naturalWidth) * canvas.width;
        const rectY = (y / image.naturalHeight) * canvas.height;
        const rectWidth = (width / image.naturalWidth) * canvas.width;
        const rectHeight = (height / image.naturalHeight) * canvas.height;
        
        return { 
            rectX, 
            rectY, 
            rectWidth, 
            rectHeight, 
            receiptTextId: receiptText.id, 
            expenseId: receiptText.expense?.id, 
            selected: false
        };
    });
    return newRectangles
};

