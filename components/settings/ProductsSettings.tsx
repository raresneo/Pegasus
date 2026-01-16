import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Product } from '../../types';
import * as Icons from '../icons';
import FormModal from '../FormModal';
import Modal from '../Modal';

const ProductsSettings: React.FC = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useDatabase();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({ name: '', category: 'Supplements', price: 0, stock: 0 });
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const openAdd = () => {
        setCurrentProduct({ name: '', category: 'Supplements', price: 0, stock: 0 });
        setIsFormOpen(true);
    };

    const openEdit = (product: Product) => {
        setCurrentProduct(product);
        setIsFormOpen(true);
    };

    const openDelete = (product: Product) => {
        setProductToDelete(product);
        setIsDeleteOpen(true);
    };

    const handleSave = () => {
        if (!currentProduct.name) return;
        
        if (currentProduct.id) {
            updateProduct(currentProduct as Product);
        } else {
            addProduct(currentProduct as Omit<Product, 'id'>);
        }
        setIsFormOpen(false);
    };

    const handleDelete = () => {
        if (productToDelete) {
            deleteProduct(productToDelete.id);
            setIsDeleteOpen(false);
            setProductToDelete(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <Modal 
                isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} 
                title="Delete Product" description={`Are you sure you want to delete ${productToDelete?.name}?`} 
                onConfirm={handleDelete} confirmText="Delete" confirmColor="red" 
            />
            
            <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={currentProduct.id ? 'Edit Product' : 'Add Product'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">Product Name</label>
                        <input type="text" value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} className="p-2 w-full bg-gray-50 dark:bg-background-dark rounded-md border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">Category</label>
                            <select value={currentProduct.category} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})} className="p-2 w-full bg-gray-50 dark:bg-background-dark rounded-md border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary">
                                <option>Supplements</option><option>Drinks</option><option>Gear</option><option>Access</option><option>Snacks</option><option>Services</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">Price</label>
                            <input type="number" value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})} className="p-2 w-full bg-gray-50 dark:bg-background-dark rounded-md border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">Stock Level</label>
                        <input type="number" value={currentProduct.stock} onChange={e => setCurrentProduct({...currentProduct, stock: parseInt(e.target.value)})} className="p-2 w-full bg-gray-50 dark:bg-background-dark rounded-md border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm rounded-md bg-gray-100 dark:bg-background-dark hover:bg-border-light dark:hover:bg-border-dark text-text-light-primary dark:text-text-dark-primary">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600">Save</button>
                </div>
            </FormModal>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-light-primary dark:text-text-dark-primary">Products (POS)</h1>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary mt-1">Manage inventory for your Point of Sale system.</p>
                </div>
                <button onClick={openAdd} className="flex items-center bg-primary-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary-600 text-sm font-medium">
                    <Icons.PlusIcon className="w-5 h-5 mr-2" /> Add Product
                </button>
            </div>

            <div className="bg-white dark:bg-card-dark rounded-lg shadow-md overflow-hidden border border-border-light dark:border-border-dark">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-light-secondary dark:text-text-dark-secondary">
                        <thead className="text-xs text-text-light-primary dark:text-text-dark-primary uppercase bg-gray-50 dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Stock</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light dark:divide-border-dark">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50">
                                    <td className="px-6 py-4 font-semibold text-text-light-primary dark:text-text-dark-primary">{product.name}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-xs">{product.category}</span></td>
                                    <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4">{product.stock}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEdit(product)} className="p-2 hover:text-primary-400"><Icons.PencilIcon className="w-4 h-4" /></button>
                                            <button onClick={() => openDelete(product)} className="p-2 hover:text-red-400"><Icons.TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductsSettings;