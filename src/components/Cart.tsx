import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const [loading, setLoading] = useState(false);

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold">Shopping Cart ({totalItems} items)</h1>
                    <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm">
                        Continue Shopping
                    </Link>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow">
                        <img
                            src="/empty-cart.svg"
                            alt="Empty Cart"
                            className="w-48 h-48 mx-auto mb-6"
                        />
                        <h2 className="text-2xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet</p>
                        <Link
                            to="/all_watches"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
                                    <Link to={`/details/${item.category}/${item.id}`}>
                                        <div className="flex p-4 cursor-pointer">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-24 h-24 object-cover rounded-md"
                                            />
                                            <div className="ml-4 flex-1">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Category: {item.category}
                                                            {item.size && ` • Size: ${item.size}`}
                                                            {item.color && ` • Color: ${item.color}`}
                                                        </p>
                                                    </div>
                                                    <p className="text-lg font-medium text-gray-900">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 rounded-full hover:bg-gray-100"
                                                disabled={item.quantity <= 1}
                                            >
                                                <MinusIcon className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 rounded-full hover:bg-gray-100"
                                            >
                                                <PlusIcon className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
                                        >
                                            <XMarkIcon className="w-5 h-5 mr-1" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                                <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                                        <span>{formatPrice(total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping Estimate</span>
                                        <span>{formatPrice(0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax Estimate</span>
                                        <span>{formatPrice(total * 0.18)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                        <div className="flex justify-between font-medium">
                                            <span>Order Total</span>
                                            <span>{formatPrice(total + (total * 0.18))}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
                                    Proceed to Checkout
                                </button>
                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Shipping & taxes calculated at checkout
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;