// components/ImageComponent.tsx

import { ReceiptTextWithRelationships } from '@/types/receiptText';
import React, { useRef, useEffect, useState } from 'react';

interface BoundingBox {
    receiptTextId: number;
    coordinates: [number, number][];
}

interface ImageComponentProps {
    imageUrl: string;
    receiptTexts: ReceiptTextWithRelationships[];
    onReceiptTextClick: (id: number | null) => void;
}

interface Rectangle {
    rectX: number;
    rectY: number;
    rectWidth: number;
    rectHeight: number;
    receiptTextId: number;
    expenseId: number | null | undefined;
    selected?: boolean;
}

const ImageComponent: React.FC<ImageComponentProps> = ({ imageUrl, receiptTexts, onReceiptTextClick }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [rectangles, setRectangles] = useState<Rectangle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        
        if (!canvas || !image) return;
        if (receiptTexts.length === 0) return;

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

            return { rectX, rectY, rectWidth, rectHeight, receiptTextId: receiptText.id, expenseId: receiptText.expense?.id, selected: false };
        });

        setRectangles(newRectangles);
      }, [receiptTexts]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        
        if (!canvas || !image) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const drawBoxes = () => {
          if (canvas && image) {
            canvas.width = image.clientWidth;
            canvas.height = image.clientHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            rectangles.forEach(rectangle => {
                // const BoundingBox = receiptText.boundingBox ? JSON.parse(receiptText.boundingBox) : null;
                // const expense = receiptText.expense;
                // if (!BoundingBox) return;
                // const [x1, y1] = BoundingBox[0];
                // const [x2, y2] = BoundingBox[2];

                const { rectX, rectY, rectWidth, rectHeight } = rectangle;
                
                ctx.lineWidth = 2;
                if (rectangle.expenseId) {
                    // ctx.strokeStyle = '#FDE047';
                    ctx.fillStyle = '#FDE047';
                } else {
                    // ctx.strokeStyle = 'gray';
                    ctx.fillStyle = 'lightgray';
                }
                if(rectangle.selected) {
                    ctx.fillStyle = '#9EFF00';
                }
                // ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
                ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
            });
          }
        };
    
        const handleResize = () => {
          drawBoxes();
        };

        window.addEventListener('resize', handleResize);
        drawBoxes(); // Initial draw
    
        return () => {
          window.removeEventListener('resize', handleResize);
        };
    }, [receiptTexts, rectangles]);

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
                setRectangles(prevRectangles => {
                    return prevRectangles.map(rectangle => {
                        if (rectangle.receiptTextId === clickedRect.receiptTextId) {
                            return { ...rectangle, selected: true };
                        } else {
                            return rectangle;
                        }
                    });
                });
                onReceiptTextClick(clickedRect.receiptTextId);
            } else {
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