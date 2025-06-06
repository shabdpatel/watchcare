import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../pages/firebase';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import {
    UsersIcon, ShoppingBagIcon, CurrencyRupeeIcon,
    ExclamationCircleIcon, TruckIcon, ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
    AreaChart, Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalIssues: 0,
        activeSellers: 0
    });
    const [issues, setIssues] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [analytics, setAnalytics] = useState({
        revenueByMonth: [],
        categoryDistribution: [],
        sellerPerformance: [],
        userGrowth: [],
        topProducts: [],
        orderTrends: []
    });
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        productId: '',
        productName: '',
        collection: ''
    });
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const ADMIN_EMAILS = ['shabdpatel0@gmail.com', '22bph028@nith.ac.in'];

    useEffect(() => {
        if (!ADMIN_EMAILS.includes(currentUser?.email || '')) {
            navigate('/');
            return;
        }
        if (activeTab === 'overview') {
            fetchStats();
        } else {
            fetchData();
        }
    }, [currentUser, activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            switch (activeTab) {
                case 'users':
                    const usersSnapshot = await getDocs(collection(db, 'users'));
                    setUsers(usersSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })));
                    break;
                case 'products':
                    let allProducts = [];
                    const collections = ['Watches', 'Fashion', 'Electronics', 'Accessories', 'Bags', 'Shoes'];
                    for (const col of collections) {
                        const snapshot = await getDocs(collection(db, col));
                        const products = snapshot.docs.map(doc => ({
                            id: doc.id,
                            collection: col,
                            stock: doc.data().Stock || doc.data().stock || 0, // Add this line to handle different field names
                            ...doc.data()
                        }));
                        allProducts = [...allProducts, ...products];
                    }
                    setProducts(allProducts);
                    break;
                case 'orders':
                    const ordersSnapshot = await getDocs(collection(db, 'orders'));
                    setOrders(ordersSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })));
                    break;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            let totalProducts = 0;
            const collections = ['Watches', 'Fashion', 'Electronics', 'Accessories', 'Bags', 'Shoes'];
            const productPromises = collections.map(col => getDocs(collection(db, col)));
            const [usersSnap, ordersSnap, issuesSnap, sellersSnap, ...productSnaps] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'orders')),
                getDocs(collection(db, 'issues')),
                getDocs(query(collection(db, 'users'), where('isSeller', '==', true))),
                ...productPromises
            ]);

            // Calculate total products
            productSnaps.forEach(snap => {
                totalProducts += snap.size;
            });

            let totalRevenue = 0;
            const monthlyRevenue = {};
            const categoryStats = {};
            const sellerStats = {};
            const userGrowthData = [];
            const orderTrendsData = [];

            // Process orders
            ordersSnap.docs.forEach(doc => {
                const order = doc.data();

                // Calculate total revenue from order total or items
                if (order.total) {
                    totalRevenue += order.total;
                } else if (order.amount) {
                    totalRevenue += order.amount;
                } else if (order.items && Array.isArray(order.items)) {
                    // If no total/amount, calculate from items
                    const orderTotal = order.items.reduce((sum, item) => {
                        return sum + (item.price || item.Price || 0) * (item.quantity || 1);
                    }, 0);
                    totalRevenue += orderTotal;
                }

                // Monthly revenue with better date handling
                if (order.orderDate || order.createdAt) {
                    const date = (order.orderDate || order.createdAt).toDate();
                    const month = date.toLocaleString('default', { month: 'short' });
                    const amount = order.total || order.amount || 0;
                    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + amount;
                }

                // Category stats with better item handling
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        const collection = item.collection || item.category || 'Other';
                        categoryStats[collection] = (categoryStats[collection] || 0) + 1;
                    });
                }

                // Order trends with better date handling
                if (order.orderDate || order.createdAt) {
                    const date = (order.orderDate || order.createdAt).toDate();
                    const month = date.toLocaleString('default', { month: 'short' });
                    const existingTrend = orderTrendsData.find(t => t.month === month);
                    if (existingTrend) {
                        existingTrend.orders += 1;
                        existingTrend.revenue = (existingTrend.revenue || 0) + (order.total || order.amount || 0);
                    } else {
                        orderTrendsData.push({
                            month,
                            orders: 1,
                            revenue: order.total || order.amount || 0
                        });
                    }
                }
            });

            // Process users for growth data
            usersSnap.docs.forEach(doc => {
                const user = doc.data();
                if (user.createdAt && typeof user.createdAt.toDate === 'function') {
                    const date = user.createdAt.toDate();
                    const month = date.toLocaleString('default', { month: 'short' });
                    const existingMonth = userGrowthData.find(d => d.month === month);
                    if (existingMonth) {
                        existingMonth.users += 1;
                    } else {
                        userGrowthData.push({ month, users: 1 });
                    }
                }
            });

            // Process sellers
            const sellerPerformanceData = await Promise.all(
                sellersSnap.docs.map(async doc => {
                    const seller = doc.data();
                    const sellerOrders = await getDocs(
                        query(collection(db, 'orders'), where('sellerId', '==', doc.id))
                    );
                    const revenue = sellerOrders.docs.reduce((sum, order) => sum + (order.data().total || 0), 0);
                    return {
                        name: seller.personalInfo?.firstName || seller.email,
                        revenue,
                        products: totalProducts, // You might want to filter by seller
                    };
                })
            );

            setStats({
                totalUsers: usersSnap.size,
                totalProducts,
                totalOrders: ordersSnap.size,
                totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
                totalIssues: issuesSnap.size,
                activeSellers: sellersSnap.size
            });

            setAnalytics({
                revenueByMonth: Object.entries(monthlyRevenue)
                    .map(([month, amount]) => ({
                        month,
                        amount,
                        formatted: `₹${amount.toLocaleString()}`
                    }))
                    .sort((a, b) => {
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return months.indexOf(a.month) - months.indexOf(b.month);
                    }),
                categoryDistribution: Object.entries(categoryStats)
                    .map(([name, value]) => ({ name, value })),
                sellerPerformance: sellerPerformanceData,
                userGrowth: userGrowthData.sort((a, b) => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return months.indexOf(a.month) - months.indexOf(b.month);
                }),
                orderTrends: orderTrendsData.sort((a, b) => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return months.indexOf(a.month) - months.indexOf(b.month);
                }),
                topProducts: [] // This will be populated from the fetchData function
            });

        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to fetch analytics');
        }
    };

    const handleDeleteProduct = async (productId, collection, productName) => {
        setDeleteConfirmation({
            isOpen: true,
            productId,
            productName: productName || 'this product',
            collection
        });
    };

    const confirmDelete = async () => {
        try {
            await deleteDoc(doc(db, deleteConfirmation.collection, deleteConfirmation.productId));
            toast.success('Product deleted successfully');
            fetchData();
            setDeleteConfirmation({ isOpen: false, productId: '', productName: '', collection: '' });
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const handleProductClick = (product) => {
        const route = product.collection === 'Watches'
            ? '/all_watches'
            : `/details/${product.collection.toLowerCase()}/${product.id}`;
        navigate(route);
    };

    const handleUpdateStatus = async (orderId) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            // Update status based on current status
            const order = orders.find(o => o.id === orderId);
            let newStatus = 'pending';

            switch (order?.status?.toLowerCase()) {
                case 'pending':
                    newStatus = 'processing';
                    break;
                case 'processing':
                    newStatus = 'shipped';
                    break;
                case 'shipped':
                    newStatus = 'delivered';
                    break;
                case 'delivered':
                    return; // No further status update needed
                default:
                    newStatus = 'pending';
            }

            await updateDoc(orderRef, {
                status: newStatus
            });
            toast.success(`Order status updated to ${newStatus}`);
            fetchData();
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        }
    };

    // Add new state variables for search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        products: {
            category: 'all',
            priceRange: 'all',
            stock: 'all'
        },
        orders: {
            status: 'all',
            dateRange: 'all'
        },
        users: {
            type: 'all',
            status: 'all'
        }
    });

    // Filter functions
    const filterProducts = (products) => {
        return products.filter(product => {
            const matchesSearch = (
                (product.name || product.Brand || product.Company || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                product.Description?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            const matchesCategory = filters.products.category === 'all' ||
                product.collection === filters.products.category;

            const matchesStock = filters.products.stock === 'all' || (
                filters.products.stock === 'inStock' ? (product.Stock > 0) :
                    filters.products.stock === 'lowStock' ? (product.Stock <= 10 && product.Stock > 0) :
                        product.Stock === 0
            );

            const matchesPriceRange = filters.products.priceRange === 'all' || (
                filters.products.priceRange === 'under1000' ? product.Price < 1000 :
                    filters.products.priceRange === '1000to5000' ? (product.Price >= 1000 && product.Price <= 5000) :
                        product.Price > 5000
            );

            return matchesSearch && matchesCategory && matchesStock && matchesPriceRange;
        });
    };

    const filterOrders = (orders) => {
        return orders.filter(order => {
            const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.shippingAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filters.orders.status === 'all' ||
                order.status === filters.orders.status;

            const matchesDate = filters.orders.dateRange === 'all' || (
                filters.orders.dateRange === 'today' ?
                    isToday(order.orderDate?.toDate()) :
                    filters.orders.dateRange === 'week' ?
                        isThisWeek(order.orderDate?.toDate()) :
                        isThisMonth(order.orderDate?.toDate())
            );

            return matchesSearch && matchesStatus && matchesDate;
        });
    };

    const filterUsers = (users) => {
        return users.filter(user => {
            const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

            // Determine if user is active based on last login
            const isUserActive = user.lastLogin &&
                typeof user.lastLogin.toDate === 'function' &&
                (new Date().getTime() - user.lastLogin.toDate().getTime()) < (24 * 60 * 60 * 1000); // Active if logged in within last 24 hours

            const matchesType = filters.users.type === 'all' || (
                filters.users.type === 'seller' ? user.isSeller :
                    filters.users.type === 'customer' ? !user.isSeller : true
            );

            const matchesStatus = filters.users.status === 'all' ||
                String(isUserActive) === filters.users.status;

            return matchesSearch && matchesType && matchesStatus;
        });
    };

    // Helper functions for date filtering
    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isThisWeek = (date) => {
        if (!date) return false;
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
    };

    const isThisMonth = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Add search and filter UI components right after the tab navigation
    const renderSearchAndFilters = () => (
        <div className="mb-6">
            {/* Search and Filter Container */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                {/* Search Bar */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                    />
                    <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                            <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Filters Section */}
                <div className="flex flex-wrap gap-3">
                    {activeTab === 'products' && (
                        <>
                            <select
                                value={filters.products.category}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    products: { ...prev.products, category: e.target.value }
                                }))}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                            >
                                <option value="all">All Categories</option>
                                <option value="Watches">Watches</option>
                                <option value="Fashion">Fashion</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Accessories">Accessories</option>
                            </select>

                            <select
                                value={filters.products.stock}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    products: { ...prev.products, stock: e.target.value }
                                }))}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                            >
                                <option value="all">All Stock</option>
                                <option value="inStock">In Stock</option>
                                <option value="lowStock">Low Stock</option>
                                <option value="outOfStock">Out of Stock</option>
                            </select>

                            <select
                                value={filters.products.priceRange}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    products: { ...prev.products, priceRange: e.target.value }
                                }))}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                            >
                                <option value="all">All Prices</option>
                                <option value="under1000">Under ₹1000</option>
                                <option value="1000to5000">₹1000 - ₹5000</option>
                                <option value="over5000">Over ₹5000</option>
                            </select>
                        </>
                    )}

                    {activeTab === 'orders' && (
                        <>
                            <select
                                value={filters.orders.status}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    orders: { ...prev.orders, status: e.target.value }
                                }))}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <select
                                value={filters.orders.dateRange}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    orders: { ...prev.orders, dateRange: e.target.value }
                                }))}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </>
                    )}

                    {activeTab === 'users' && (
                        <>
                            <select
                                value={filters.users.type}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    users: { ...prev.users, type: e.target.value }
                                }))}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                            >
                                <option value="all">All Users</option>
                                <option value="customer">Customers</option>
                                <option value="seller">Sellers</option>
                            </select>

                            <select
                                value={filters.users.status}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    users: { ...prev.users, status: e.target.value }
                                }))}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                            >
                                <option value="all">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </>
                    )}
                </div>

                {/* Active Filters Display */}
                {(searchTerm || Object.values(filters[activeTab]).some(value => value !== 'all')) && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-gray-500">Active filters:</span>
                        {searchTerm && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                Search: {searchTerm}
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {Object.entries(filters[activeTab]).map(([key, value]) => (
                            value !== 'all' && (
                                <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                                    {key}: {value}
                                    <button
                                        onClick={() => setFilters(prev => ({
                                            ...prev,
                                            [activeTab]: { ...prev[activeTab], [key]: 'all' }
                                        }))}
                                        className="ml-2 text-gray-600 hover:text-gray-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderDashboard = () => (
        // Update grid classes for better responsiveness
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-medium">Quick Stats</h3>
                    <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </div>
                <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base text-gray-600">Total Users</span>
                        <span className="text-xl sm:text-2xl font-semibold">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base text-gray-600">Total Orders</span>
                        <span className="text-xl sm:text-2xl font-semibold">{stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base text-gray-600">Revenue</span>
                        <span className="text-xl sm:text-2xl font-semibold">
                            ₹{stats.totalRevenue.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Seller Stats Card */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-medium">Seller Stats</h3>
                    <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </div>
                <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base text-gray-600">Active Sellers</span>
                        <span className="text-xl sm:text-2xl font-semibold">{stats.activeSellers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base text-gray-600">Products Listed</span>
                        <span className="text-xl sm:text-2xl font-semibold">{stats.totalProducts}</span>
                    </div>
                </div>
            </div>

            {/* Issues & Support Card */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-medium">Issues & Support</h3>
                    <ExclamationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </div>
                <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base text-gray-600">Open Issues</span>
                        <span className="text-xl sm:text-2xl font-semibold">{stats.totalIssues}</span>
                    </div>
                    {/* Add responsive notification badge if needed */}
                    {stats.totalIssues > 0 && (
                        <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
                                Requires Attention
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto">
                {/* Responsive header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                            Last updated: {new Date().toLocaleString()}
                        </span>
                        <button
                            onClick={fetchData}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Refresh Data
                        </button>
                    </div>
                </div>

                {/* Responsive tab navigation - scrollable on mobile */}
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 mb-6">
                    <div className="flex flex-nowrap sm:flex-wrap gap-2 min-w-max sm:min-w-0">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex items-center px-4 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <ChartBarIcon className="w-5 h-5 mr-2" />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center px-4 py-2 rounded-lg ${activeTab === 'users'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <UsersIcon className="w-5 h-5 mr-2" />
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`flex items-center px-4 py-2 rounded-lg ${activeTab === 'products'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <ShoppingBagIcon className="w-5 h-5 mr-2" />
                            Products
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`flex items-center px-4 py-2 rounded-lg ${activeTab === 'orders'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <CurrencyRupeeIcon className="w-5 h-5 mr-2" />
                            Orders
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-lg shadow-lg">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            {/* Overview Section */}
                            {activeTab === 'overview' && (
                                <>
                                    {renderDashboard()}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                        {/* Revenue Chart */}
                                        <div className="bg-white rounded-lg shadow p-4">
                                            <h3 className="text-lg font-medium mb-4">Revenue Trends</h3>
                                            <div className="h-80">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={analytics.revenueByMonth}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis />
                                                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                                        <Area type="monotone" dataKey="amount" stroke="#3B82F6" fill="#93C5FD" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Order Trends */}
                                        <div className="bg-white rounded-lg shadow p-4">
                                            <h3 className="text-lg font-medium mb-4">Order Trends</h3>
                                            <div className="h-80">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={analytics.orderTrends}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Line type="monotone" dataKey="orders" stroke="#10B981" />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Category Distribution */}
                                        <div className="bg-white rounded-lg shadow p-4">
                                            <h3 className="text-lg font-medium mb-4">Category Distribution</h3>
                                            <div className="h-80">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={analytics.categoryDistribution}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={80}
                                                            label
                                                        >
                                                            {analytics.categoryDistribution.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'][index % 6]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* User Growth */}
                                        <div className="bg-white rounded-lg shadow p-4">
                                            <h3 className="text-lg font-medium mb-4">User Growth</h3>
                                            <div className="h-80">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={analytics.userGrowth}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Bar dataKey="users" fill="#6366F1" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Products Section */}
                            {activeTab === 'products' && (
                                <div className="overflow-x-auto">
                                    {renderSearchAndFilters()}
                                    <div className="inline-block min-w-full">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {/* Responsive table headers */}
                                                    <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                                                        <span className="lg:hidden">Product Info</span>
                                                        <span className="hidden lg:inline">Product Details</span>
                                                    </th>
                                                    <th className="hidden sm:table-cell px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                                                        Category & Stock
                                                    </th>
                                                    <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                                                        Pricing
                                                    </th>
                                                    <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                                                        Seller Info
                                                    </th>
                                                    <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                                                        Specifications
                                                    </th>
                                                    <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                                                        Warranty
                                                    </th>
                                                    <th className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filterProducts(products).map(product => (
                                                    <tr
                                                        key={product.id}
                                                        className="hover:bg-gray-50 cursor-pointer transition-all duration-200"
                                                        onClick={() => handleProductClick(product)}
                                                    >
                                                        <td className="py-4 pl-4 pr-3 sm:pl-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                    <img
                                                                        src={product.Image || product.images?.[0]}
                                                                        alt=""
                                                                        className="h-full w-full object-cover object-center"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-base font-medium text-gray-900 mb-1">
                                                                        {product.name || product.Brand || product.Company}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-500 line-clamp-2 max-w-md">
                                                                        {product.Description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-4">
                                                            <div className="space-y-2">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {product.collection}
                                                                </span>
                                                                <p className={`text-sm ${(product.Stock || product.stock) > 10
                                                                    ? 'text-green-600'
                                                                    : (product.Stock || product.stock) > 0
                                                                        ? 'text-yellow-600'
                                                                        : 'text-red-600'
                                                                    }`}>
                                                                    {product.Stock || product.stock || 0} in stock
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-4">
                                                            <div className="text-sm">
                                                                <p className="font-medium text-gray-900">₹{product.Price?.toLocaleString()}</p>
                                                                {product.originalPrice && (
                                                                    <p className="text-xs text-gray-500 line-through">
                                                                        ₹{product.originalPrice?.toLocaleString()}
                                                                    </p>
                                                                )}
                                                                {product.featured && (
                                                                    <span className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                        Featured
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-4">
                                                            <div className="text-sm">
                                                                <p className="text-gray-900">{product.Seller?.Name}</p>
                                                                <p className="text-xs text-gray-500">{product.Seller?.Email}</p>
                                                                <p className="text-xs text-gray-500">{product.Seller?.Phone}</p>
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {product.Seller?.City}, {product.Seller?.State}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-4">
                                                            <div className="text-sm space-y-1">
                                                                {product.Movement && <p>Movement: {product.Movement}</p>}
                                                                {product.Material && <p>Material: {product.Material}</p>}
                                                                {product.Glass && <p>Glass: {product.Glass}</p>}
                                                                {product.WaterResistance && <p>Water Resistance: {product.WaterResistance}</p>}
                                                                {product.shoeType && <p>Type: {product.shoeType}</p>}
                                                                {product.bagType && <p>Type: {product.bagType}</p>}
                                                                {product.clothingType && <p>Type: {product.clothingType}</p>}
                                                                {product.electronicType && <p>Type: {product.electronicType}</p>}
                                                                <p className="text-xs text-gray-500">
                                                                    Origin: {product.CountryOfOrigin}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Year: {product.CollectionYear}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-4">
                                                            <div className="text-sm space-y-1">
                                                                <p>Duration: {product.Warranty?.Duration || product.warranty}</p>
                                                                {product.Warranty?.Provider && (
                                                                    <p className="text-xs text-gray-500">
                                                                        Provider: {product.Warranty.Provider}
                                                                    </p>
                                                                )}
                                                                {product.Warranty?.Type && (
                                                                    <p className="text-xs text-gray-500">
                                                                        Type: {product.Warranty.Type}
                                                                    </p>
                                                                )}
                                                                {product.Warranty?.Status && (
                                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.Warranty.Status === 'Active'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-yellow-100 text-yellow-800'
                                                                        }`}>
                                                                        {product.Warranty.Status}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-4 text-right text-sm font-medium">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteProduct(
                                                                        product.id,
                                                                        product.collection,
                                                                        product.name || product.Brand
                                                                    );
                                                                }}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Orders Section */}
                            {activeTab === 'orders' && (
                                <div className="overflow-x-auto">
                                    {renderSearchAndFilters()}
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Order Details
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Customer Info
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Product
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Payment & Delivery
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filterOrders(orders).map(order => (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                Order #{order.id.slice(-8)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Placed: {order.orderDate?.toDate().toLocaleString()}
                                                            </p>
                                                            <p className="text-sm font-medium text-rose-600">
                                                                ₹{order.amount?.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="space-y-2">
                                                            <div className="text-sm">
                                                                <p className="font-medium">{order.shippingAddress?.name}</p>
                                                                <p className="text-gray-500">{order.userId}</p>
                                                            </div>
                                                            <div className="text-xs text-gray-500 space-y-1">
                                                                <p>{order.shippingAddress?.address}</p>
                                                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                                                                <p>{order.shippingAddress?.pincode}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        {order.product ? (
                                                            <div className="flex items-center space-x-3">
                                                                <div className="h-16 w-16 flex-shrink-0">
                                                                    <img
                                                                        src={order.product.Image}
                                                                        alt={order.product.Company}
                                                                        className="h-16 w-16 object-cover rounded-md"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium">
                                                                        {order.product.Company}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {order.product.Model}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Qty: 1
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">
                                                                Product details not available
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="space-y-2">
                                                            <div className="text-sm">
                                                                <p className="font-medium">Payment Method</p>
                                                                <p className="text-gray-500 capitalize">
                                                                    {order.paymentMethod}
                                                                    {order.paymentId && (
                                                                        <span className="text-xs ml-1">
                                                                            (ID: {order.paymentId.slice(-6)})
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="text-sm">
                                                                <p className="font-medium">Delivery</p>
                                                                <p className="text-gray-500">
                                                                    Expected: {order.expectedDelivery}
                                                                </p>
                                                            </div>
                                                            <div className="text-xs">
                                                                <p className="text-gray-500">
                                                                    Shipping: ₹{order.shippingFee || 2}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="space-y-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                                ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                                'bg-gray-100 text-gray-800'}`}>
                                                                {order.status}
                                                            </span>
                                                            <Menu as="div" className="relative inline-block text-left">
                                                                <Menu.Button className="text-xs text-blue-600 hover:text-blue-800">
                                                                    Update Status
                                                                </Menu.Button>
                                                                <Transition
                                                                    enter="transition ease-out duration-100"
                                                                    enterFrom="transform opacity-0 scale-95"
                                                                    enterTo="transform opacity-100 scale-100"
                                                                    leave="transition ease-in duration-75"
                                                                    leaveFrom="transform opacity-100 scale-100"
                                                                    leaveTo="transform opacity-0 scale-95"
                                                                >
                                                                    <Menu.Items className="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                        <div className="py-1">
                                                                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                                                                <Menu.Item key={status}>
                                                                                    {({ active }) => (
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                const orderRef = doc(db, 'orders', order.id);
                                                                                                updateDoc(orderRef, { status })
                                                                                                    .then(() => {
                                                                                                        toast.success(`Order status updated to ${status}`);
                                                                                                        fetchData();
                                                                                                    })
                                                                                                    .catch((error) => {
                                                                                                        console.error('Error updating status:', error);
                                                                                                        toast.error('Failed to update status');
                                                                                                    });
                                                                                            }}
                                                                                            className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                                                                } block px-4 py-2 text-xs w-full text-left capitalize`}
                                                                                        >
                                                                                            {status}
                                                                                        </button>
                                                                                    )}
                                                                                </Menu.Item>
                                                                            ))}
                                                                        </div>
                                                                    </Menu.Items>
                                                                </Transition>
                                                            </Menu>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Users Section */}
                            {activeTab === 'users' && (
                                <div className="overflow-x-auto">
                                    {renderSearchAndFilters()}
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Contact
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Shipping Address
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Billing Address
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Preferences
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Social Media
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {filterUsers(users).map(user => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="flex items-start sm:items-center gap-3">
                                                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                {user.personalInfo?.firstName?.[0] || user.email[0].toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                                                    {user.personalInfo?.firstName} {user.personalInfo?.lastName}
                                                                </div>
                                                                <div className="text-xs sm:text-sm text-gray-500">{user.email}</div>
                                                                {/* Show on mobile only */}
                                                                <div className="sm:hidden text-xs text-gray-500 mt-1">
                                                                    {user.contact?.phoneNumber}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                                                        {user.contact?.phoneNumber}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="text-sm space-y-1">
                                                            {user.addresses?.shipping ? (
                                                                <>
                                                                    <div>{user.addresses.shipping.street}</div>
                                                                    {user.addresses.shipping.apartment && (
                                                                        <div>{user.addresses.shipping.apartment}</div>
                                                                    )}
                                                                    <div>
                                                                        {user.addresses.shipping.city}, {user.addresses.shipping.state}
                                                                    </div>
                                                                    <div>{user.addresses.shipping.postalCode}</div>
                                                                    <div className="text-gray-500">{user.addresses.shipping.country}</div>
                                                                </>
                                                            ) : (
                                                                <span className="text-gray-500">Not provided</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="text-sm space-y-1">
                                                            {user.addresses?.billing?.sameAsShipping ? (
                                                                <span className="text-gray-500">Same as shipping</span>
                                                            ) : user.addresses?.billing ? (
                                                                <>
                                                                    <div>{user.addresses.billing.street}</div>
                                                                    {user.addresses.billing.apartment && (
                                                                        <div>{user.addresses.billing.apartment}</div>
                                                                    )}
                                                                    <div>
                                                                        {user.addresses.billing.city}, {user.addresses.billing.state}
                                                                    </div>
                                                                    <div>{user.addresses.billing.postalCode}</div>
                                                                    <div className="text-gray-500">{user.addresses.billing.country}</div>
                                                                </>
                                                            ) : (
                                                                <span className="text-gray-500">Not provided</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="text-sm space-y-2">
                                                            <div className="flex flex-wrap gap-1">
                                                                {user.preferences?.newsletter && (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        Newsletter
                                                                    </span>
                                                                )}
                                                                {user.preferences?.smsNotifications && (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                        SMS
                                                                    </span>
                                                                )}
                                                                {user.preferences?.emailNotifications && (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                        Email
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-gray-500">
                                                                {user.preferences?.language}, {user.preferences?.currency}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            {user.socialMedia?.facebook && (
                                                                <a href={user.socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 text-sm">Facebook</a>
                                                            )}
                                                            {user.socialMedia?.twitter && (
                                                                <a href={user.socialMedia.twitter} target="_blank" rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 text-sm">Twitter</a>
                                                            )}
                                                            {user.socialMedia?.instagram && (
                                                                <a href={user.socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 text-sm">Instagram</a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="flex flex-col gap-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                                ${user.lastLogin &&
                                                                    typeof user.lastLogin.toDate === 'function' &&
                                                                    (new Date().getTime() - user.lastLogin.toDate().getTime()) < (24 * 60 * 60 * 1000)
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'}`}>
                                                                {user.lastLogin &&
                                                                    typeof user.lastLogin.toDate === 'function' &&
                                                                    (new Date().getTime() - user.lastLogin.toDate().getTime()) < (24 * 60 * 60 * 1000)
                                                                    ? 'Active'
                                                                    : 'Inactive'}
                                                            </span>
                                                            <div className="flex flex-col text-xs text-gray-500">
                                                                <span>
                                                                    Joined: {user.createdAt && typeof user.createdAt.toDate === 'function'
                                                                        ? user.createdAt.toDate().toLocaleDateString()
                                                                        : 'N/A'}
                                                                </span>
                                                                <span>
                                                                    Last login: {user.lastLogin && typeof user.lastLogin.toDate === 'function'
                                                                        ? user.lastLogin.toDate().toLocaleString()
                                                                        : 'Never'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Responsive Delete Confirmation Modal */}
            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
                    <div className="relative top-20 mx-auto max-w-sm">
                        <div className="bg-white rounded-lg shadow-xl p-6">
                            <div className="mt-3 text-center">
                                <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                                    Delete Product
                                </h3>
                                <div className="mt-2 px-7 py-3">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to delete {deleteConfirmation.productName}?
                                        This action cannot be undone.
                                    </p>
                                </div>
                                <div className="flex justify-center gap-4 mt-4">
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirmation({
                                            isOpen: false,
                                            productId: '',
                                            productName: '',
                                            collection: ''
                                        })}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;