import React, { Fragment } from 'react';
import { useCart } from '../context/CartContext';
import { Dialog, Transition } from '@headlessui/react';
import {
    XMarkIcon,
    ShoppingCartIcon,
    MinusIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

interface ShoppingCartProps {
    isOpen: boolean;
    onClose: () => void;
    onCheckout?: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ isOpen, onClose, onCheckout }) => {
    const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

    const handleCheckout = () => {
        if (onCheckout) {
            onCheckout();
        } else {
            // Default checkout behavior - could integrate with payment system
            console.log('Proceeding to checkout with items:', items);
            alert('Funcționalitate checkout va fi implementată cu sistem de plăți!');
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col bg-gray-900 shadow-xl border-l border-gray-800">
                                        {/* Header */}
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                                            <Dialog.Title className="text-xl font-bold text-white flex items-center">
                                                <ShoppingCartIcon className="w-6 h-6 mr-2 text-primary-400" />
                                                Coșul Meu ({totalItems})
                                            </Dialog.Title>
                                            <button
                                                onClick={onClose}
                                                className="text-gray-400 hover:text-white transition-colors"
                                            >
                                                <XMarkIcon className="w-6 h-6" />
                                            </button>
                                        </div>

                                        {/* Cart Items */}
                                        <div className="flex-1 overflow-y-auto p-6">
                                            {items.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                                    <p className="text-gray-400">Coșul tău este gol</p>
                                                    <button
                                                        onClick={onClose}
                                                        className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                                                    >
                                                        Continuă Cumpărăturile
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {items.map(({ product, quantity }) => (
                                                        <div
                                                            key={product.id}
                                                            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                                                        >
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex-1">
                                                                    <h3 className="font-semibold text-white mb-1">{product.name}</h3>
                                                                    <p className="text-sm text-gray-400">{product.category}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeFromCart(product.id)}
                                                                    className="text-red-400 hover:text-red-300 transition-colors ml-2"
                                                                >
                                                                    <TrashIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2">
                                                                    <button
                                                                        onClick={() => updateQuantity(product.id, quantity - 1)}
                                                                        className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                                                                        disabled={quantity <= 1}
                                                                    >
                                                                        <MinusIcon className="w-4 h-4 text-white" />
                                                                    </button>
                                                                    <span className="text-white font-semibold w-8 text-center">
                                                                        {quantity}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => updateQuantity(product.id, quantity + 1)}
                                                                        className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                                                                        disabled={quantity >= product.stock}
                                                                    >
                                                                        <PlusIcon className="w-4 h-4 text-white" />
                                                                    </button>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-sm text-gray-400">
                                                                        {product.price.toFixed(2)} RON x {quantity}
                                                                    </div>
                                                                    <div className="text-lg font-bold text-white">
                                                                        {(product.price * quantity).toFixed(2)} RON
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        {items.length > 0 && (
                                            <div className="border-t border-gray-800 p-6 space-y-4">
                                                <div className="flex items-center justify-between text-lg">
                                                    <span className="text-gray-400">Total:</span>
                                                    <span className="text-2xl font-bold text-white">
                                                        {totalPrice.toFixed(2)} RON
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={handleCheckout}
                                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                                                >
                                                    Finalizează Comanda
                                                </button>

                                                <button
                                                    onClick={clearCart}
                                                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded-lg transition-colors"
                                                >
                                                    Golește Coșul
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ShoppingCart;
