import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Label, TextInput, Modal, Select } from "flowbite-react";

interface NewProductFormInputs {
    newProductName: string;
    weight: string; // will be converted to a float
    unitOfMeasure: string;
    referenceItem: string;
}

interface NewProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<NewProductFormInputs>();

    const handleFormSubmit = (data: NewProductFormInputs) => {
        onSubmit(data);
        onClose();
    };

    return (
        <Modal show={isOpen} onClose={onClose}>
            <Modal.Header>Add new product</Modal.Header>
            <Modal.Body>
                <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="newProductName" value="Product" />
                        </div>
                        <TextInput 
                            id="newProductName" 
                            {...register('newProductName', { required: false })}
                            type="" 
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
                        <TextInput 
                            id="referenceItem" 
                            {...register('referenceItem', { required: false })}
                            type="text" 
                        />
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleSubmit(handleFormSubmit)}>Save</Button>
                <Button color="light" onClick={onClose}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default NewProductModal;