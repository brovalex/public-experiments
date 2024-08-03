'use client'
// src/app/receipt/[receiptId]/page.tsx

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Expense as PrismaExpense } from '@prisma/client';
import { ReceiptWithRelationships } from '@/types/receipt.d';

const ReceiptPage = () => {
    const params = useParams();
    const receiptId = params.receiptId;

    const [receipt, setReceipt] = useState<ReceiptWithRelationships | null>(null);

    useEffect(() => {
        if (receiptId) {
            fetch(`/api/receipt/${receiptId}`)
                .then((res) => res.json())
                .then((receipt) => setReceipt(receipt))
                .catch((error) => console.error('Error fetching receipt:', error));
        }
    }, [receiptId]);
    
    const imageUrl = receipt?.imageFiles[0]?.url ?? '';
    const expenses = receipt?.expenses ?? [];
    
    return (
        <div className="flex h-screen">
            <div className="w-1/2 p-4">
                {imageUrl ? (
                    <img src={imageUrl} alt="Receipt" className="max-w-full h-auto" />
                ) : (
                    <p>Loading image...</p>
                )}
            </div>
            <div className="w-1/2 p-4">
                <h1 className="text-2xl font-bold">Receipt</h1>
                <p>Receipt ID: {receiptId}</p>
                <hr />
                {expenses.length > 0 ? (
                    <ul>
                        {expenses.map((expense: PrismaExpense) => (
                            <li key={expense.id}>
                                <p>{expense.referenceItem.name}</p>
                                <code>{expense.receiptText.text}</code>
                                <p>{expense.priceEach} x {expense.quantity}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No expenses on this receipt. </p>
                )}
                {/* <pre>{JSON.stringify(receipt, null, 2)}</pre> */}
            </div>
        </div>
    )
}

export default ReceiptPage;