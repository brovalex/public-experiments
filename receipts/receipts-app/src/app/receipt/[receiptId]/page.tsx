'use client'
// src/app/receipt/[receiptId]/page.tsx

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Expense as PrismaExpense } from '@prisma/client';
import { ReceiptWithRelationships } from '@/types/receipt.d';
import { ImageFileWithRelationships } from '@/types/imageFile.d';
import { Table } from "flowbite-react";
import { Button, Label, TextInput } from "flowbite-react";
import { DrawSquare, Pen } from "flowbite-react-icons/outline";
import CreatableSelect from 'react-select/creatable';
import { StylesConfig } from 'react-select';
import ImageComponent from '@/components/ImageComponent';
import { useForm, SubmitHandler } from 'react-hook-form';

type ExpenseFormInputs = {
    productId: string;
    price: number;
    quantity: number;
    boundingBoxId: number | null;
  };

interface Option {
    readonly label: string;
    readonly value: string;
}

const createOption = (label: string, id: number) => ({
    label,
    value: id,
});

const ReceiptPage = () => {
    const params = useParams();
    const receiptId = params.receiptId;

    const [receipt, setReceipt] = useState<ReceiptWithRelationships | null>(null);
    const [selectedReceiptTextId, setSelectedReceiptTextId] = useState<number | null>(null);
    
    // TODO: only assuming using a single image for now, add support for multiple images later
    const imageUrl = receipt?.imageFiles[0]?.url ?? '';
    const expenses = receipt?.expenses ?? [];

    const { register, handleSubmit, formState: { errors } } = useForm<ExpenseFormInputs>();

    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<Option | null>();
    const [value, setValue] = useState<Option | null>();
    
    const customStyles: StylesConfig = {
        control: (provided, state) => ({
          ...provided,
          padding: '0.25rem',
          borderRadius: '0.375rem', // rounded-md
          backgroundColor: 'rgb(249, 250, 251)',
        }),
        input: (provided, state) => ({
            ...provided,
            boxShadow: 'none',
        }),
      };

    useEffect(() => {
        if (receiptId) {
            fetch(`/api/receipt/${receiptId}`)
                .then((res) => res.json())
                .then((receipt) => setReceipt(receipt))
                .catch((error) => console.error('Error fetching receipt:', error));
        }
    }, [receiptId]);

    useEffect(() => {
        fetch('/api/product')
            .then((res) => res.json())
            .then((data) => {
                const options = data.map((product: any) => createOption(product.name + ' (' + product.weight + ' ' + product.unitOfMeasure + ')', product.id));
                setOptions(options);
            })
            .catch((error) => console.error('Error fetching products:', error));
    }, []);
    
  
    const handleCreateProduct = (inputValue: string) => {
      setIsLoading(true);
      setTimeout(() => {
        const newOption = createOption(inputValue);
        setIsLoading(false);
        setOptions((prev) => [...prev, newOption]);
        setValue(newOption);
      }, 1000);
    };
    
    const receiptTexts = receipt?.imageFiles[0]?.receiptTexts ?? [];

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

    const handleRectangleClick = (id: number) => {
        setSelectedReceiptTextId(id);
        if (id) {
            document.getElementById('product')?.focus();
        }
      };

    const onSubmit: SubmitHandler<ExpenseFormInputs> = async (data) => {
        try {
            const response = await fetch('/api/expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to submit the form');
            }

            const result = await response.json();
            console.log('Success:', result);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/2 h-full bg-gray-900 overflow-y-scroll">
                <ImageComponent 
                    imageUrl={imageUrl} 
                    receiptTexts={receiptTexts} 
                    onReceiptTextClick={handleRectangleClick}
                    />
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
                                        <span>{expense.product.name}</span>
                                        <p className="font-normal text-xs text-slate-400">{expense.product.referenceItem.name}</p>
                                    </Table.Cell>
                                    <Table.Cell className="text-right">{expense.quantity} ×</Table.Cell>
                                    <Table.Cell className="text-right">
                                        <CurrencyDisplay amount={expense.priceEach.toFixed(2)} />
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
                                <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                                <h2 className="text-base font-semibold text-gray-900">Add expense</h2>
                                <div>
                                    <div className="mb-2 block">
                                    <Label htmlFor="product" value="Product" />
                                    </div>
                                    <CreatableSelect 
                                        inputId="product"
                                        isClearable
                                        isDisabled={isLoading}
                                        isLoading={isLoading}
                                        onChange={(newValue) => setValue(newValue)}
                                        onCreateOption={handleCreateProduct}
                                        options={options}
                                        value={value}
                                        styles={customStyles}
                                    />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="w-1/3">
                                        <div className="mb-2 block">
                                        <Label htmlFor="price" value="Price" />
                                        </div>
                                        <TextInput 
                                            id="price" 
                                            {...register('price', { required: true })}
                                            type="number" 
                                            addon="$" 
                                            step="0.01"
                                        />
                                        {errors.price && <span>This field is required</span>}
                                    </div>
                                    <div className="w-1/3">
                                        <div className="mb-2 block">
                                        <Label htmlFor="quantity" value="Quantity" />
                                        </div>
                                        <TextInput 
                                            id="quantity" 
                                            {...register('quantity', { required: true })}
                                            type="number" 
                                            value="1"
                                        />
                                        {errors.quantity && <span>This field is required</span>}
                                    </div>
                                    <div className="w-1/3">
                                        <div className="mb-2 block">
                                        <Label htmlFor="boundingbox" value="Bounding box id" />
                                        </div>
                                        <TextInput id="boundingboxid" type="number" rightIcon={DrawSquare} value={selectedReceiptTextId ?? ''} disabled />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button type="submit">Save</Button>
                                    <Button color="light">Clear</Button>
                                </div>
                                </form>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
                <pre>{JSON.stringify(receipt, null, 2)}</pre>
            </div>
        </div>
    )
}

export default ReceiptPage;