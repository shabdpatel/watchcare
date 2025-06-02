import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const OrderSuccess = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">Thank you for your purchase. We'll send you an email with your order details.</p>
            <Link
                to="/orders"
                className="block w-full bg-rose-600 text-white py-3 rounded-lg font-medium hover:bg-rose-700"
            >
                View Order
            </Link>
        </div>
    </div>
);

export default OrderSuccess;