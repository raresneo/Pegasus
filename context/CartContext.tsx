import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '../types';

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        // Load cart from localStorage on init
        const saved = localStorage.getItem('pegasus_cart');
        return saved ? JSON.parse(saved) : [];
    });

    // Save to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem('pegasus_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = useCallback((product: Product, quantity: number = 1) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.product.id === product.id);

            if (existingItem) {
                // Update quantity if item already in cart
                return prevItems.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // Add new item to cart
                return [...prevItems, { product, quantity }];
            }
        });
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setItems(prevItems =>
            prevItems.map(item =>
                item.product.id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const isInCart = useCallback((productId: string) => {
        return items.some(item => item.product.id === productId);
    }, [items]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const value: CartContextType = {
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
