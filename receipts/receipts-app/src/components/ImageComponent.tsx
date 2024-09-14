// components/ImageComponent.tsx

import { ReceiptTextWithRelationships } from '@/types/receiptText';
import React, { useRef, useEffect, useState } from 'react';
import { calculateRectangles } from '@/utils/rectangleUtils';

interface BoundingBox {
    receiptTextId: number;
    coordinates: [number, number][];
}

interface ImageComponentProps {
    imageUrl: string;
    receiptTexts: ReceiptTextWithRelationships[];
    onReceiptTextClick: (id: number | null) => void;
}

const ImageComponent: React.FC<ImageComponentProps> = ({ imageUrl, receiptTexts, onReceiptTextClick }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [rectangles, setRectangles] = useState<Rectangle[]>([]);
    const [activeRectangleId, setActiveRectangleId] = useState<number | null>(null);

    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    const drawBoxes = () => {
        if (!canvas || !image) return;
        if (receiptTexts.length === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = image.clientWidth;
        canvas.height = image.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        rectangles.forEach(rectangle => {
            const { rectX, rectY, rectWidth, rectHeight } = rectangle;
            ctx.lineWidth = 2;
            if (rectangle.expenseId) {
                // ctx.strokeStyle = '#FDE047';
                ctx.fillStyle = '#FDE047';
            } else {
                // ctx.strokeStyle = 'gray';
                ctx.fillStyle = 'lightgray';
            }
            if(rectangle.receiptTextId === activeRectangleId) {
                ctx.fillStyle = '#9EFF00';
            }
            // ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
            ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        });
    };

    const handleResize = () => {
        drawBoxes();
    };
    window.addEventListener('resize', handleResize);

    useEffect(() => {
        const newRectangles = calculateRectangles(receiptTexts, canvas, image);
        setRectangles(newRectangles);
        drawBoxes();
    }, [receiptTexts]);

    drawBoxes(); // Initial draw

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const clickedRect = rectangles.find(
                rect => x >= rect.rectX && x <= rect.rectX + rect.rectWidth && y >= rect.rectY && y <= rect.rectY + rect.rectHeight && rect.expenseId == null
            );
            setRectangles(prevRectangles => {
                return prevRectangles.map(rectangle => {
                    return { ...rectangle, selected: false };
                });
            });
            if (clickedRect) {
                setActiveRectangleId(clickedRect.receiptTextId);
                onReceiptTextClick(clickedRect.receiptTextId);
            } else {
                setActiveRectangleId(null);
                onReceiptTextClick(null);
            }
        }
    };

    return (
        <div className="w-full max-w-[540px] mx-auto">
            {imageUrl ? (
                <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
                    <canvas
                        ref={canvasRef}
                        style={{ position: 'absolute', top: 0, left: 0, mixBlendMode: 'multiply' }}
                        onClick={handleClick}
                    />
                    <img src={imageUrl} ref={imageRef} alt="Receipt" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
            ) : (
                <p>Loading image...</p>
            )}
        </div>
    );
}

export default ImageComponent;