import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../pages/firebase';
import { useAuth } from '../components/AuthContext';
import {
    TruckIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    FunnelIcon, // Changed from FilterIcon
    MagnifyingGlassIcon, // Changed from SearchIcon
    ChevronDownIcon,
    ArrowLeftIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Update the Order interface
interface Order {
    id: string;
    userId: string;  // This should match the email used in the query
    productId: string;
    product?: {
        Company: string;
        Model: string;
        Image: string;
        Price: number;
    };
    amount: number;
    status: string;
    orderDate: any;
    expectedDelivery: string;
    paymentMethod: string;
    paymentId?: string;
    shippingAddress: {
        name: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
}

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Update the fetchOrders function in the useEffect hook
    useEffect(() => {
        const fetchOrders = async () => {
            if (!currentUser?.email) {
                navigate('/login');
                return;
            }

            setLoading(true);
            try {
                console.log('Current user email:', currentUser.email); // Debug log

                // Check all possible userId fields
                const emailQuery = query(
                    collection(db, 'orders'),
                    where('userId', '==', currentUser.email)
                );

                const emailSnapshot = await getDocs(emailQuery);
                console.log('Query result size:', emailSnapshot.size); // Debug log

                if (emailSnapshot.empty) {
                    console.log('No orders found with userId');
                    setOrders([]);
                    setLoading(false);
                    return;
                }

                const ordersData = await Promise.all(
                    emailSnapshot.docs.map(async (doc) => {
                        const orderData = doc.data();
                        console.log('Raw order data:', orderData); // Debug log

                        let productData = null;
                        if (orderData.productId) {
                            // Try different collections
                            const collections = ['watches', 'accessories', 'shoes', 'bags'];
                            for (const collectionName of collections) {
                                const productRef = doc(db, collectionName, orderData.productId);
                                const productSnap = await getDoc(productRef);
                                if (productSnap.exists()) {
                                    productData = productSnap.data();
                                    console.log('Found product in collection:', collectionName);
                                    break;
                                }
                            }
                        }

                        return {
                            id: doc.id,
                            userId: orderData.userId,
                            productId: orderData.productId,
                            product: productData,
                            amount: orderData.amount || 0,
                            status: orderData.status || 'pending',
                            orderDate: orderData.orderDate,
                            expectedDelivery: orderData.expectedDelivery,
                            paymentMethod: orderData.paymentMethod,
                            paymentId: orderData.paymentId,
                            shippingAddress: orderData.shippingAddress || {}
                        };
                    })
                );

                console.log('Processed orders:', ordersData); // Debug log
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

    // Add this right after your state declarations to debug the orders state
    useEffect(() => {
        console.log('Current orders state:', orders);
    }, [orders]);

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

    const formatDate = (date: any) => {
        return new Date(date.toMillis()).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Filter and sort functions
    const filteredOrders = orders
        .filter(order => {
            const matchesSearch =
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.product?.Company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.product?.Model.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') {
                return b.orderDate.toMillis() - a.orderDate.toMillis();
            } else if (sortBy === 'oldest') {
                return a.orderDate.toMillis() - b.orderDate.toMillis();
            } else if (sortBy === 'amount-high') {
                return b.amount - a.amount;
            } else {
                return a.amount - b.amount;
            }
        });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with back button */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500"
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="amount-high">Amount: High to Low</option>
                                <option value="amount-low">Amount: Low to High</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                            <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-medium text-gray-900 mb-2">No Orders Found</h2>
                        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                        <Link
                            to="/"
                            className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="border-b border-gray-200 p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-500">
                                                Order ID: {order.id}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Placed on {formatDate(order.orderDate)}
                                            </p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Product Details */}
                                    {order.product ? (
                                        <div className="flex gap-4">
                                            <img
                                                src={order.product.Image || order.product.images?.[0]}
                                                alt={order.product.Company}
                                                className="w-20 h-20 object-cover rounded-lg"
                                                onError={(e) => {
                                                    console.error('Image load error:', e);
                                                    e.currentTarget.src = '/placeholder-image.png';
                                                }}
                                            />
                                            <div>
                                                <h3 className="font-medium">{order.product.Company}</h3>
                                                <p className="text-sm text-gray-600">{order.product.Model}</p>
                                                <p className="text-sm text-gray-500">₹{order.product.Price?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Product details not available</p>
                                    )}

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">Delivery Address:</p>
                                            <div className="text-sm text-gray-600 mt-1">
                                                <p>{order.shippingAddress.name}</p>
                                                <p>{order.shippingAddress.address}</p>
                                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">Order Total:</p>
                                            <p className="text-2xl font-bold text-rose-600 mt-1">
                                                ₹{order.amount.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Paid via {order.paymentMethod}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <TruckIcon className="w-5 h-5" />
                                        <span>Expected Delivery: {order.expectedDelivery}</span>
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