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

    useEffect(() => {
        if (currentUser?.email !== 'shabdpatel0@gmail.com') {
            return;
        }
        fetchData();
        fetchStats();
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
            // Fetch and calculate statistics
            const [usersSnap, ordersSnap, issuesSnap, sellersSnap] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'orders')),
                getDocs(collection(db, 'issues')),
                getDocs(query(collection(db, 'users'), where('isSeller', '==', true)))
            ]);

            let totalRevenue = 0;
            ordersSnap.docs.forEach(doc => {
                totalRevenue += doc.data().total || 0;
            });

            setStats({
                totalUsers: usersSnap.size,
                totalOrders: ordersSnap.size,
                totalIssues: issuesSnap.size,
                totalRevenue,
                activeSellers: sellersSnap.size
            });

            // Calculate analytics
            const monthlyRevenue = {};
            const categoryStats = {};
            const sellerStats = {};
            const topProductsList = [];

            // Process orders for revenue and trends
            ordersSnap.docs.forEach(doc => {
                const order = doc.data();
                const date = new Date(order.createdAt.toDate());
                const month = date.toLocaleString('default', { month: 'short' });

                monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (order.total || 0);

                // Track products sold
                order.items?.forEach(item => {
                    categoryStats[item.collection] = (categoryStats[item.collection] || 0) + 1;

                    const existingProduct = topProductsList.find(p => p.id === item.id);
                    if (existingProduct) {
                        existingProduct.sales += 1;
                        existingProduct.revenue += item.price;
                    } else {
                        topProductsList.push({
                            id: item.id,
                            name: item.name,
                            sales: 1,
                            revenue: item.price
                        });
                    }
                });
            });

            // Process sellers
            sellersSnap.docs.forEach(doc => {
                const seller = doc.data();
                sellerStats[seller.email] = {
                    name: seller.personalInfo?.firstName || seller.email,
                    products: products.filter(p => p.Seller?.Email === seller.email).length,
                    revenue: 0 // Calculate from orders
                };
            });

            setAnalytics({
                revenueByMonth: Object.entries(monthlyRevenue).map(([month, amount]) => ({
                    month,
                    amount
                })),
                categoryDistribution: Object.entries(categoryStats).map(([name, value]) => ({
                    name,
                    value
                })),
                sellerPerformance: Object.values(sellerStats),
                topProducts: topProductsList.sort((a, b) => b.revenue - a.revenue).slice(0, 5)
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

    const renderDashboard = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Quick Stats</h3>
                    <ChartBarIcon className="w-6 h-6 text-gray-400" />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Users</span>
                        <span className="text-2xl font-semibold">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Orders</span>
                        <span className="text-2xl font-semibold">{stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Revenue</span>
                        <span className="text-2xl font-semibold">₹{stats.totalRevenue.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Seller Stats</h3>
                    <UsersIcon className="w-6 h-6 text-gray-400" />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Sellers</span>
                        <span className="text-2xl font-semibold">{stats.activeSellers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Products Listed</span>
                        <span className="text-2xl font-semibold">{stats.totalProducts}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Issues & Support</h3>
                    <ExclamationCircleIcon className="w-6 h-6 text-gray-400" />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Open Issues</span>
                        <span className="text-2xl font-semibold">{stats.totalIssues}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</span>
                        <button
                            onClick={fetchData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Refresh Data
                        </button>
                    </div>
                </div>

                {/* Dashboard Overview */}
                {renderDashboard()}

                {/* Enhanced Tab Navigation */}
                <div className="flex flex-wrap gap-4 mb-6">
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

                {/* Content Area */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Update product table styles */}
                            {activeTab === 'products' && (
                                <div className="-mx-6">
                                    <div className="inline-block min-w-full align-middle">
                                        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                                            <table className="min-w-full divide-y divide-gray-300">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                            Product Details
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Category & Stock
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Pricing
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Seller Info
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Specifications
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Warranty
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {products.map(product => (
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
                                </div>
                            )}

                            {/* Update orders table with similar styling */}
                            {activeTab === 'orders' && (
                                <div className="-mx-6">
                                    <div className="inline-block min-w-full align-middle">
                                        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Order ID
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Customer
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Total
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {orders.map(order => (
                                                        <tr key={order.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{order.customerEmail}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                ₹{order.total?.toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'completed'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Add users table */}
                            {activeTab === 'users' && (
                                <div className="-mx-6">
                                    <div className="inline-block min-w-full align-middle">
                                        <div className="overflow-x-auto shadow-sm ring-1 ring-black ring-opacity-5">
                                            <table className="min-w-full divide-y divide-gray-300">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                            User Details
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Contact Info
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Shipping Address
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Billing Address
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Preferences
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Social Media
                                                        </th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {users.map(user => (
                                                        <tr key={user.id} className="hover:bg-gray-50">
                                                            <td className="py-4 pl-4 pr-3 sm:pl-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                                                                        {user.personalInfo?.firstName?.[0] || user.email[0].toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-gray-900">
                                                                            {user.personalInfo?.firstName} {user.personalInfo?.lastName}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {user.personalInfo?.gender && `${user.personalInfo.gender} • `}
                                                                            {user.personalInfo?.occupation}
                                                                        </div>
                                                                        <div className="flex gap-1 mt-1">
                                                                            {user.isSeller && (
                                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                                    Seller
                                                                                </span>
                                                                            )}
                                                                            {user.email === 'shabdpatel0@gmail.com' && (
                                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                                    Admin
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-4">
                                                                <div className="text-sm space-y-1">
                                                                    <div>{user.contact?.phoneNumber}</div>
                                                                    {user.contact?.alternatePhone && (
                                                                        <div className="text-gray-500">Alt: {user.contact.alternatePhone}</div>
                                                                    )}
                                                                    <div className="text-gray-500">{user.email}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-4">
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
                                                            <td className="px-3 py-4">
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
                                                            <td className="px-3 py-4">
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
                                                            <td className="px-3 py-4">
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
                                                            <td className="px-3 py-4">
                                                                <div className="flex flex-col gap-2">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                                        ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        Joined: {user.createdAt?.toDate().toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
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
            )}

            {/* Analytics Overview - New Section */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* Revenue Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium mb-6">Revenue Trends</h3>
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

                        {/* Category Distribution */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium mb-6">Sales by Category</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analytics.categoryDistribution}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {analytics.categoryDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={[
                                                    '#3B82F6', '#10B981', '#F59E0B',
                                                    '#6366F1', '#EC4899', '#8B5CF6'
                                                ][index % 6]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Top Products and Sellers */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium mb-4">Top Performing Products</h3>
                            <div className="space-y-4">
                                {analytics.topProducts.map((product, index) => (
                                    <div key={product.id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-lg font-bold text-gray-400 w-8">{index + 1}</span>
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-sm text-gray-500">{product.sales} units sold</p>
                                            </div>
                                        </div>
                                        <span className="font-medium text-green-600">
                                            ₹{product.revenue.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium mb-4">Seller Performance</h3>
                            <div className="space-y-4">
                                {analytics.sellerPerformance.map((seller) => (
                                    <div key={seller.name} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{seller.name}</p>
                                            <p className="text-sm text-gray-500">{seller.products} products listed</p>
                                        </div>
                                        <span className="font-medium text-blue-600">
                                            ₹{seller.revenue.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500">Conversion Rate</h3>
                                <span className="text-green-600 text-sm">↑ 12%</span>
                            </div>
                            <div className="text-2xl font-semibold">
                                {((stats.totalOrders / stats.totalUsers) * 100).toFixed(1)}%
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500">Avg. Order Value</h3>
                                <span className="text-green-600 text-sm">↑ 8%</span>
                            </div>
                            <div className="text-2xl font-semibold">
                                ₹{stats.totalOrders ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : 0}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500">Active Sellers</h3>
                                <span className="text-blue-600 text-sm">↑ 5%</span>
                            </div>
                            <div className="text-2xl font-semibold">{stats.activeSellers}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500">Customer Satisfaction</h3>
                                <span className="text-green-600 text-sm">↑ 15%</span>
                            </div>
                            <div className="text-2xl font-semibold">4.8/5.0</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;