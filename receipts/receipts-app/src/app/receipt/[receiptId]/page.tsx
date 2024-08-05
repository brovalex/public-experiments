'use client'
// src/app/receipt/[receiptId]/page.tsx

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Expense as PrismaExpense } from '@prisma/client';
import { ReceiptWithRelationships } from '@/types/receipt.d';
import { Table } from "flowbite-react";

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
                <Table>
                    <Table.Head>
                    <Table.HeadCell>Item</Table.HeadCell>
                    <Table.HeadCell>Quantity</Table.HeadCell>
                    <Table.HeadCell>Price Each</Table.HeadCell>
                    <Table.HeadCell>
                        <span className="sr-only">Edit</span>
                    </Table.HeadCell>
                    </Table.Head>
                    {expenses.length > 0 ? (
                    <Table.Body className="divide-y">
                    {expenses.map((expense: PrismaExpense) => (
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={expense.id}>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                <span>Product name not implement yet</span>
                                <p className="font-normal text-xs text-slate-400">{expense.referenceItem.name}</p>
                            </Table.Cell>
                            <Table.Cell>{expense.quantity} ×</Table.Cell>
                            <Table.Cell>{expense.priceEach}</Table.Cell>
                            <Table.Cell>
                            <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                                Edit
                            </a>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                    </Table.Body>
                    ) : (
                        <p>No expenses on this receipt. </p>
                    )}
                </Table>
                {/* <pre>{JSON.stringify(receipt, null, 2)}</pre> */}
            </div>
        </div>
    )
}

export default ReceiptPage;