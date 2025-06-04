import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../pages/firebase';
import { useAuth } from '../components/AuthContext';
import {
    TruckIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentArrowDownIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    ArrowLeftIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Menu, Transition } from '@headlessui/react';

interface Product {
    id: string;
    Company: string;
    Model: string;
    Image: string;
    Price: number;
    Description?: string;
}

interface Order {
    id: string;
    userId: string;
    productId: string;
    product: Product;
    amount: number;
    status: string;
    orderDate: string; // Changed to string
    expectedDelivery: string;
    paymentMethod: string;
    paymentId?: string;
    shippingAddress: {
        name: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
        phone: string;
    };
}

const OrderTrackingSteps = ({ status }: { status: string }) => {
    const steps = [
        { title: 'Order Placed', icon: ClockIcon },
        { title: 'Processing', icon: TruckIcon },
        { title: 'Shipped', icon: TruckIcon },
        { title: 'Delivered', icon: CheckCircleIcon },
    ];

    const getStepStatus = (index: number) => {
        const statusIndex = {
            'pending': 0,
            'processing': 1,
            'shipped': 2,
            'delivered': 3,
            'cancelled': -1,
        }[status.toLowerCase()] || 0;

        return index <= statusIndex ? 'complete' : 'pending';
    };

    return (
        <div className="flex justify-between items-center w-full mt-4">
            {steps.map((step, index) => (
                <div key={step.title} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStatus(index) === 'complete'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                        }`}>
                        <step.icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs mt-1">{step.title}</p>
                </div>
            ))}
        </div>
    );
};

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
];

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!currentUser?.email) {
                navigate('/login');
                return;
            }

            setLoading(true);
            try {
                const emailQuery = query(
                    collection(db, 'orders'),
                    where('userId', '==', currentUser.email)
                );

                const emailSnapshot = await getDocs(emailQuery);

                if (emailSnapshot.empty) {
                    setOrders([]);
                    setLoading(false);
                    return;
                }

                const ordersData: Order[] = [];
                emailSnapshot.forEach((doc) => {
                    const orderData = doc.data();
                    ordersData.push({
                        id: doc.id,
                        userId: orderData.userId,
                        productId: orderData.productId,
                        product: orderData.product,
                        amount: orderData.amount || 0,
                        status: orderData.status || 'pending',
                        orderDate: orderData.orderDate, // Keep as string
                        expectedDelivery: orderData.expectedDelivery,
                        paymentMethod: orderData.paymentMethod,
                        paymentId: orderData.paymentId,
                        shippingAddress: orderData.shippingAddress || {}
                    });
                });

                setOrders(ordersData);
            } catch (error) {
                console.error('Error fetching orders:', error);
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentUser, navigate]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'text-green-600 bg-green-50';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'cancelled':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return <CheckCircleIcon className="w-5 h-5" />;
            case 'pending':
                return <ClockIcon className="w-5 h-5" />;
            case 'cancelled':
                return <XCircleIcon className="w-5 h-5" />;
            default:
                return null;
        }
    };

    // Parse date string to format it properly
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString; // Return raw string if parsing fails
        }
    };

    const filteredOrders = orders
        .filter(order => {
            const matchesSearch =
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.product?.Company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.product?.Model || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            // Parse dates for comparison
            const dateA = new Date(a.orderDate).getTime();
            const dateB = new Date(b.orderDate).getTime();

            if (sortBy === 'newest') {
                return dateB - dateA;
            } else if (sortBy === 'oldest') {
                return dateA - dateB;
            } else if (sortBy === 'amount-high') {
                return b.amount - a.amount;
            } else {
                return a.amount - b.amount;
            }
        });

    const handleCancelOrder = async (orderId: string) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                status: 'cancelled'
            });
            toast.success('Order cancelled successfully');
            // Refresh orders
            window.location.reload();
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Failed to cancel order');
        }
    };

    const handleDownloadInvoice = (order: Order) => {
        // This is a simple example - you might want to create a proper PDF invoice
        const invoiceContent = `
Order Invoice
------------
Order ID: ${order.id}
Date: ${formatDate(order.orderDate)}
Product: ${order.product.Company} ${order.product.Model}
Amount: ₹${order.amount}
Status: ${order.status}
        `;

        const blob = new Blob([invoiceContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order.id}.txt`;
        a.click();
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: newStatus.toLowerCase()
            });
            toast.success('Order status updated successfully');
            // Update the local state to reflect the change
            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, status: newStatus.toLowerCase() }
                    : order
            ));
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Your Orders</h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-rose-500 focus:border-rose-500"
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-rose-500 focus:border-rose-500"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="amount-high">Amount: High to Low</option>
                                <option value="amount-low">Amount: Low to High</option>
                            </select>
                        </div>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-4">
                            <ShoppingBagIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No Orders Found</h2>
                        <p className="text-gray-500 mb-4 sm:mb-6">You haven't placed any orders yet.</p>
                        <Link
                            to="/"
                            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="border-b border-gray-200 p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                                        <div className="space-y-1 sm:space-y-2">
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Order ID: {order.id}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Placed on {formatDate(order.orderDate)}
                                            </p>
                                        </div>
                                        <div className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6 space-y-4">
                                    {order.product ? (
                                        <div className="flex gap-3 sm:gap-4">
                                            <img
                                                src={order.product.Image || ''}
                                                alt={order.product.Company}
                                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-image.png';
                                                    e.currentTarget.classList.add('object-contain', 'p-2');
                                                }}
                                            />
                                            <div>
                                                <h3 className="text-sm sm:text-base font-medium">{order.product.Company}</h3>
                                                <p className="text-xs sm:text-sm text-gray-600">{order.product.Model || 'No model specified'}</p>
                                                <p className="text-xs sm:text-sm text-gray-500">₹{order.product.Price?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs sm:text-sm text-gray-500">Product details not available</p>
                                    )}

                                    <OrderTrackingSteps status={order.status} />

                                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-6">
                                        <div className="w-full lg:w-1/2">
                                            <p className="text-sm sm:text-base font-medium">Delivery Address:</p>
                                            <div className="text-xs sm:text-sm text-gray-600 mt-1">
                                                <p>{order.shippingAddress?.name || 'No name provided'}</p>
                                                <p>{order.shippingAddress?.address || 'No address provided'}</p>
                                                <p>
                                                    {order.shippingAddress?.city || ''},
                                                    {order.shippingAddress?.state || ''}
                                                    {order.shippingAddress?.pincode ? ` ${order.shippingAddress.pincode}` : ''}
                                                </p>
                                                <p className="mt-1">
                                                    Phone: {order.shippingAddress?.phone || 'Not provided'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full lg:w-1/2 lg:text-right">
                                            <p className="text-sm sm:text-base font-medium">Order Total:</p>
                                            <p className="text-2xl font-bold text-rose-600 mt-1">
                                                ₹{order.amount.toLocaleString()}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                                Paid via {order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                                            </p>
                                            {order.paymentId && (
                                                <p className="text-xs sm:text-sm text-gray-500">
                                                    Transaction ID: {order.paymentId}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t pt-4">
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                            <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span>Expected Delivery: {order.expectedDelivery}</span>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}
                                            {order.status === 'paid' && (
                                                <button
                                                    onClick={() => handleDownloadInvoice(order)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                >
                                                    <DocumentArrowDownIcon className="w-4 h-4" />
                                                    Download Invoice
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;