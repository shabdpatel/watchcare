import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { db } from '../pages/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    category: string;  // Add this
    size?: string;     // Add this
    color?: string;    // Add this
    material?: string; // Add this
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const { currentUser } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const fetchCart = async () => {
            if (!currentUser?.email) {
                setCartItems([]);
                return;
            }

            try {
                const cartDoc = await getDoc(doc(db, 'carts', currentUser.email));
                if (cartDoc.exists()) {
                    setCartItems(cartDoc.data().items || []);
                }
            } catch (error) {
                console.error('Error fetching cart:', error);
                toast.error('Failed to load cart');
            }
        };

        fetchCart();
    }, [currentUser]);

    useEffect(() => {
        setCartCount(cartItems.reduce((total, item) => total + item.quantity, 0));
    }, [cartItems]);

    const addToCart = async (newItem: CartItem) => {
        if (!currentUser?.email) {
            toast.error('Please login to add items to cart');
            return;
        }

        try {
            const updatedCart = [...cartItems];
            const existingItemIndex = updatedCart.findIndex(item => item.id === newItem.id);

            if (existingItemIndex >= 0) {
                updatedCart[existingItemIndex].quantity += 1;
            } else {
                // Ensure category is included
                updatedCart.push({
                    ...newItem,
                    quantity: 1,
                    category: newItem.category || 'Unknown' // Provide a fallback
                });
            }

            await setDoc(doc(db, 'carts', currentUser.email), {
                items: updatedCart
            }, { merge: true });

            setCartItems(updatedCart);
            toast.success('Added to cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
        }
    };

    const removeFromCart = async (itemId: string) => {
        if (!currentUser?.email) return;

        try {
            const updatedCart = cartItems.filter(item => item.id !== itemId);
            await updateDoc(doc(db, 'carts', currentUser.email), {
                items: updatedCart
            });

            setCartItems(updatedCart);
            toast.success('Removed from cart');
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error('Failed to remove item');
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (!currentUser?.email) return;

        try {
            const updatedCart = cartItems.map(item =>
                item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
            ).filter(item => item.quantity > 0);

            await updateDoc(doc(db, 'carts', currentUser.email), {
                items: updatedCart
            });

            setCartItems(updatedCart);
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Failed to update quantity');
        }
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}