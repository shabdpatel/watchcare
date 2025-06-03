import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    CheckCircleIcon,
    ShoppingBagIcon,
    HomeIcon,
    ArrowLeftIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';

const OrderSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Trigger confetti animation on component mount
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    {/* Success Icon and Message */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                            <CheckCircleIcon className="w-12 h-12 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Thank You for Your Order!
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Your order has been placed successfully.
                        </p>
                    </div>

                    {/* Order Info */}
                    <div className="max-w-lg mx-auto mb-8">
                        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                            <div className="flex items-center gap-2 text-gray-600">
                                <TruckIcon className="w-5 h-5" />
                                <span>Estimated delivery: 7-10 business days</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <ShoppingBagIcon className="w-5 h-5" />
                                <span>Order confirmation sent to your email</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link
                            to="/orders"
                            className="flex items-center justify-center gap-2 bg-rose-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-rose-700 transition-colors"
                        >
                            <ShoppingBagIcon className="w-5 h-5" />
                            View Order
                        </Link>
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            <HomeIcon className="w-5 h-5" />
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 mx-auto"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;