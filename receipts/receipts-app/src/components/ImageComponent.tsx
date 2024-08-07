// components/ImageComponent.tsx

import { ReceiptText } from '@prisma/client';
import React, { useRef, useEffect } from 'react';

interface Box {
    coordinates: [number, number][];
}

interface ImageComponentProps {
    imageUrl: string;
    receiptTexts: ReceiptText[];
}

const ImageComponent: React.FC<ImageComponentProps> = ({ imageUrl, receiptTexts }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

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
            receiptTexts.forEach(receiptText => {
                const box = receiptText.boundingBox ? JSON.parse(receiptText.boundingBox) : null;
                if (!box) return;
                const [x1, y1] = box[0];
                const [x2, y2] = box[2];
                const rectX = (x1 / image.naturalWidth) * canvas.width;
                const rectY = (y1 / image.naturalHeight) * canvas.height;
                const rectWidth = ((x2 - x1) / image.naturalWidth) * canvas.width;
                const rectHeight = ((y2 - y1) / image.naturalHeight) * canvas.height;
            
                ctx.lineWidth = 2;
                ctx.fillStyle = '#FDE047';
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
      }, [receiptTexts]);

    return (
        <div className="w-full max-w-[540px] mx-auto">
            {imageUrl ? (
                <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
                    <img src={imageUrl} ref={imageRef} alt="Receipt" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    <canvas
                        ref={canvasRef}
                        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', mixBlendMode: 'multiply' }}
                    />
                </div>
            ) : (
                <p>Loading image...</p>
            )}
        </div>
    );
}

export default ImageComponent;