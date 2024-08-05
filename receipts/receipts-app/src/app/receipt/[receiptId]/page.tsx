'use client'
// src/app/receipt/[receiptId]/page.tsx

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Expense as PrismaExpense } from '@prisma/client';
import { ReceiptWithRelationships } from '@/types/receipt.d';
import { Table } from "flowbite-react";
import { Button, Label, TextInput } from "flowbite-react";
import { DrawSquare, Pen } from "flowbite-react-icons/outline";
import ImageComponent from '@/components/ImageComponent';

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

    // const boxes = ... TODO: implement
    const boxes = [
        [[165, 910], [657, 910], [657, 959], [165, 959]],
        [[163, 1112], [452, 1112], [452, 1156], [163, 1156]]
    ];

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
    };

    interface CurrencyDisplayProps {
        amount: number;
    }

    const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ amount }) => {
        return <div>{formatCurrency(amount)}</div>;
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/2 h-full bg-gray-900 overflow-y-scroll">
                <ImageComponent imageUrl={imageUrl} boxes={boxes} />
            </div>
            <div className="w-1/2 p-4 h-full overflow-y-scroll">
                <h1 className="text-lg font-medium">Receipt #{receiptId}</h1>
                <hr className="my-4" />
                <Table className="table-auto">
                    <Table.Head>
                    <Table.HeadCell>Item</Table.HeadCell>
                    <Table.HeadCell className="text-right">Quantity</Table.HeadCell>
                    <Table.HeadCell className="text-right">Price Each</Table.HeadCell>
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
                                    <Table.Cell className="text-right">{expense.quantity} ×</Table.Cell>
                                    <Table.Cell className="text-right">
                                        <CurrencyDisplay amount={expense.priceEach} />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex gap-1">
                                            <Pen className="w-5 h-5 text-cyan-600" />
                                            <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                                                Edit
                                            </a>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    ) : (
                        <Table.Body className="divide-y">
                            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                    <p>No expenses on this receipt. </p>
                                </Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    )}
                    <Table.Body className="divide-y border-t">
                        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                            <Table.Cell colSpan={4}>
                                <form className="flex w-full flex-col gap-4">
                                <h2 className="text-base font-semibold text-gray-900">Add item</h2>
                                <div>
                                    <div className="mb-2 block">
                                    <Label htmlFor="product" value="Product" />
                                    </div>
                                    <TextInput id="product" type="text" required />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="w-1/2">
                                        <div className="mb-2 block">
                                        <Label htmlFor="textstring" value="Text string (optional)" />
                                        </div>
                                        <TextInput id="textstring" type="text" />
                                    </div>
                                    <div className="w-1/2">
                                        <div className="mb-2 block">
                                        <Label htmlFor="boundingbox" value="Bounding box (optional)" />
                                        </div>
                                        <TextInput id="boundingbox" type="text" rightIcon={DrawSquare} />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button type="submit">Save</Button>
                                    <Button color="light">Cancel</Button>
                                </div>
                                </form>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
                {/* <pre>{JSON.stringify(receipt, null, 2)}</pre> */}
            </div>
        </div>
    )
}

export default ReceiptPage;