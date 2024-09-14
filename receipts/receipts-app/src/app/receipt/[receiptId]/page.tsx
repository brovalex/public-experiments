'use client'
// src/app/receipt/[receiptId]/page.tsx

import { useState, useEffect, useRef, use } from 'react';
import { useParams } from 'next/navigation';
import { ExpenseWithRelationships } from '@/types/expense.d';
import { ReceiptWithRelationships } from '@/types/receipt.d';
import { Product, ReceiptText } from '@prisma/client';
import { ImageFileWithRelationships } from '@/types/imageFile.d';
import { Table } from "flowbite-react";
import { Button, Label, TextInput } from "flowbite-react";
import { DrawSquare, Pen } from "flowbite-react-icons/outline";
import CreatableSelect from 'react-select/creatable';
import { StylesConfig } from 'react-select';
import ImageComponent from '@/components/ImageComponent';
import NewProductModal from '@/components/NewProductModal';
import { useForm, SubmitHandler, Controller, set } from 'react-hook-form';
import exp from 'constants';
import { sortExpenses } from '@/utils/expensesUtils';

interface Option {
    readonly label: string;
    readonly value: number;
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
    const [initialNewProductName, setInitialNewProductName] = useState<string | undefined>(undefined);
    
    // TODO: only assuming using a single image for now, add support for multiple images later
    const imageUrl = receipt?.imageFiles[0]?.url ?? '';
    const [expenses, setExpenses] = useState<ExpenseWithRelationships[]>([]);
    const [receiptTexts, setReceiptTexts] = useState<ReceiptText[]>([]);

    const [openNewProductModal, setNewProductOpenModal] = useState(false);
    
    const ImageComponentRef = useRef<{ resetColors: () => void } | null>(null);

    const handleResetColors = () => {
        if (ImageComponentRef.current) {
          ImageComponentRef.current.resetColors();
        }
      };

    const { register, control, setValue, handleSubmit, formState: { errors }, reset } = useForm<ExpenseFormInputs>();

    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<Option[]>([]);
    const [product, setProduct] = useState<Option | null>(null);
    
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
                .then((receipt) => {
                    setReceipt(receipt);
                })
                .catch((error) => console.error('Error fetching receipt:', error))
                .finally(
                    () => setIsLoading(false)
                )
        }
    }, [receiptId]);

    useEffect(() => {
        if (receipt) {
            const newExpenses = receipt?.expenses;
            const newReceiptTexts = receipt?.imageFiles[0]?.receiptTexts ?? [];
            const sortedExpenses = sortExpenses(newExpenses, newReceiptTexts);
            setExpenses(sortedExpenses);
            setReceiptTexts(newReceiptTexts);
        }
    }, [receipt]);

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
        setInitialNewProductName(inputValue);
        setNewProductOpenModal(true);
    };
        
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
    
    interface NewProductFormInputs {
        newProductName: string;
        weight: string; // will be converted to a float
        unitOfMeasure: number;
        referenceItemId: number;
    }

    interface ExpenseFormInputs {
        priceEach: string; // will be converted to a float
        quantity: string;  // will be converted to a float
        receiptId: string;
        receiptTextId: string | null;
        productId: string | null;
    }
      
    const onSubmit: SubmitHandler<ExpenseFormInputs> = async (data) => {
        try {
            const response = await fetch('/api/expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceEach: parseFloat(data.priceEach), // Convert to Float
                    quantity:  parseFloat(data.quantity), // Convert to Int
                    receiptId: parseInt(Array.isArray(receiptId) ? receiptId[0] : receiptId, 10),
                    receiptTextId: selectedReceiptTextId ? selectedReceiptTextId : null,
                    productId: product ? parseInt(product.value) : null, // Convert to Int if not null
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit the form');
            }
            
            const newExpense = await response.json();
            
            setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
            setReceiptTexts((prevReceiptTexts) => prevReceiptTexts.map((receiptText) => {
                if (receiptText.id === selectedReceiptTextId) {
                    return { ...receiptText, expense: newExpense };
                }
                return receiptText;
            }
            ));
            setSelectedReceiptTextId(null);
            setProduct(null); // reset react-select
            handleResetColors();
            reset();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSelectProductOption = (option: { value: string; label: string }) => {
        setValue('productId', option.value);
        setProduct(option);
      };

    const handleAddProduct = (newProduct: Product) => {
        setNewProductOpenModal(false)
        const newOption: Option = createOption(newProduct.name + ' (' + newProduct.weight + ' ' + newProduct.unitOfMeasure + ')', newProduct.id);
        setOptions((prev) => [...prev, newOption]);
        handleSelectProductOption(newOption);
      };
    
    return (
        <div className="flex h-screen">
            <div className="w-1/2 h-full bg-gray-900 overflow-y-scroll">
            {isLoading ? (
                    <p>Loading receipt...</p>
                ) : (
                <ImageComponent 
                    imageUrl={imageUrl} 
                    receiptTexts={receiptTexts} 
                    onReceiptTextClick={handleRectangleClick}
                    ref={ImageComponentRef}
                    />
            )}
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
                            {expenses.map((expense) => (
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
                                    <Controller 
                                        name="productId" 
                                        control={control}
                                        render={({ field }) => <CreatableSelect 
                                            {...field}
                                            inputId="product"
                                            instanceId="product"
                                            className='react-select-container'
                                            isClearable
                                            onChange={(newValue) => setProduct(newValue)}
                                            onCreateOption={handleCreateProduct}
                                            options={options}
                                            value={product}
                                            styles={customStyles}
                                        />}
                                    />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="w-1/3">
                                        <div className="mb-2 block">
                                        <Label htmlFor="priceEach" value="Price" />
                                        </div>
                                        <TextInput 
                                            id="priceEach" 
                                            {...register('priceEach', { required: true })}
                                            type="number" 
                                            step={0.01}
                                        />
                                        {errors.priceEach && <span>This field is required</span>}
                                    </div>
                                    <div className="w-1/3">
                                        <div className="mb-2 block">
                                        <Label htmlFor="quantity" value="Quantity" />
                                        </div>
                                        <TextInput 
                                            id="quantity" 
                                            {...register('quantity', { required: true })}
                                            type="number" 
                                            defaultValue={1}
                                        />
                                        {errors.quantity && <span>This field is required</span>}
                                    </div>
                                    <div className="w-1/3">
                                        <div className="mb-2 block">
                                        <Label htmlFor="receiptTextId" value="Bounding box id" />
                                        </div>
                                        <TextInput 
                                            id="receiptTextId" 
                                            {...register('receiptTextId', { required: false })}
                                            type="number" 
                                            rightIcon={DrawSquare} 
                                            value={selectedReceiptTextId ?? ''} disabled 
                                        />
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
                {/* <pre>{JSON.stringify(receipt, null, 2)}</pre> */}
                <NewProductModal 
                    isOpen={openNewProductModal} 
                    onClose={() => setNewProductOpenModal(false)} 
                    initialNewProductName={initialNewProductName} 
                    onAddProduct={handleAddProduct} 
                />
            </div>
        </div>
    )
}

export default ReceiptPage;