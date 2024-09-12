import React, { useRef, useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Button, Label, TextInput, Modal, Select } from "flowbite-react";
import { default as ReactSelect } from 'react-select';
import { StylesConfig } from 'react-select';

interface NewProductFormInputs {
    newProductName: string;
    weight: string; // will be converted to a float
    unitOfMeasure: string;
    referenceItemId: string;
}

interface Option {
    readonly label: string;
    readonly value: string;
}

const createOption = (label: string, id: number) => ({
    label,
    value: id,
});

interface NewProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    // onSubmit: () => void;
    initialNewProductName?: string | undefined;
}

// TODO: eww, copy paste
const customStyles: StylesConfig = {
    control: (provided, state) => ({
    ...provided,
    padding: '0.25rem',
    fontSize: '14px', 
    borderRadius: '0.375rem', // rounded-md
    backgroundColor: 'rgb(249, 250, 251)',
    }),
    input: (provided, state) => ({
        ...provided,
        boxShadow: 'none',
    }),
};

const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose, initialNewProductName }) => {    
    const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<NewProductFormInputs>();
    
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<Option[] | undefined>();
    const [referenceItem, setReferenceItem] = useState<Option | unknown>();

    const productNameRef = useRef<HTMLInputElement | null>(null);
    const { ref, ...rest } = register('newProductName', { required: false });

    useEffect(() => {
        fetch('/api/referenceItem')
            .then((res) => res.json())
            .then((data) => {
                const options = data.map((referenceItem: any) => createOption(referenceItem.name, referenceItem.id));
                setOptions(options);
            })
            .catch((error) => console.error('Error fetching reference items:', error));
    }, []);
    
    // useEffect(() => {
    // }, [variable1, setValue]);
    
    useEffect(() => {
        if (initialNewProductName) {
            setValue('newProductName', initialNewProductName);
        }
    }, [initialNewProductName, setValue]);

    useEffect(() => {
        // Handler to close the modal when Esc key is pressed
        const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
        };

        // Attach event listener if modal is open
        if (isOpen) {
        window.addEventListener('keydown', handleKeyDown);
        }

        // Cleanup event listener on unmount or when modal is closed
        return () => {
        window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleNewProductFormSubmit: SubmitHandler<NewProductFormInputs> = async (data) => {
        try {
            const response = await fetch('/api/product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.newProductName,
                    weight: parseFloat(data.weight), // Convert to Float
                    unitOfMeasure: data.unitOfMeasure,
                    referenceItemId: parseInt(data.referenceItem, 10),
                    referenceItemId: referenceItem ? parseInt(referenceItem.value) : null, // Convert to Int if not null
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit the new product form');
            }
            
            const newProduct = await response.json();
            console.log('New product:', newProduct);
            onClose();
            
            // setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
            // setReceiptTexts((prevReceiptTexts) => prevReceiptTexts.map((receiptText) => {
            //     if (receiptText.id === selectedReceiptTextId) {
            //         return { ...receiptText, expense: newExpense };
            //     }
            //     return receiptText;
            // }
            // ));
            // setSelectedReceiptTextId(null);
            // setProduct(null);
            // reset();
        } catch (error) {
            console.error('Error:', error);
        }
    };
    

    return (
        <Modal show={isOpen} onClose={onClose} initialFocus={productNameRef}>
            <Modal.Header>Add new product</Modal.Header>
            <Modal.Body>
                <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(handleNewProductFormSubmit)}>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="newProductName" value="Product" />
                        </div>
                        <TextInput 
                            {...rest} 
                            id="newProductName" 
                            ref={(e) => {
                                ref(e)
                                productNameRef.current = e
                            }}
                            type="text" 
                        />
                    </div>
                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <div className="mb-2 block">
                                <Label htmlFor="weight" value="Weight" />
                            </div>
                            <TextInput 
                                id="weight" 
                                {...register('weight', { required: true })}
                                type="number" 
                            />
                            {errors.weight && <span>This field is required</span>}
                        </div>
                        <div className="w-1/2">
                            <div className="mb-2 block">
                                <Label htmlFor="unitOfMeasure" value="Unit of measure" />
                            </div>
                            <Select 
                            id="unitOfMeasure" 
                            {...register('unitOfMeasure', { required: true })}
                            required>
                                <option value="count">count</option>
                                <option value="g">g</option>
                                <option value="mL">mL</option>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="referenceItem" value="Reference item" />
                        </div>
                        <Controller 
                            name="referenceItem" 
                            control={control}
                            render={({ field }) => <ReactSelect 
                                {...field}
                                inputId="referenceItem"
                                instanceId="referenceItem"
                                className='react-select-container'
                                isClearable
                                isDisabled={isLoading}
                                isLoading={isLoading}
                                options={options}
                                onChange={(newValue) => setReferenceItem(newValue)}
                                value={referenceItem}
                                styles={customStyles}
                            />}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="submit">Add</Button>
                        <Button color="light" onClick={onClose}>Cancel</Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default NewProductModal;