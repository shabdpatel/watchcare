import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../pages/firebase';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const ProductCard = ({ sell }) => (
    <Link
        to={`/details/${sell.category}/${sell.id}`}
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full"
    >
        {/* Image Container */}
        <div className="relative pt-[100%]">
            <img
                src={sell.images?.[0] || sell.Image}
                alt={sell.Company || sell.Name}
                className="absolute top-0 left-0 w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
            />
        </div>

        {/* Content Container */}
        <div className="p-4 flex flex-col flex-grow">
            {/* Brand/Company */}
            <h3 className="text-sm font-medium text-gray-900 mb-1">
                {sell.Company || sell.Name}
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-sm mb-2 line-clamp-2 flex-grow">
                {sell.Description}
            </p>

            {/* Price and Rating Row */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900">
                    ₹{sell.Price}
                </span>
                <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                        <span
                            key={i}
                            className={`text-sm ${i < sell.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                            ★
                        </span>
                    ))}
                </div>
            </div>

            {/* Stock Status Row */}
            <div className="flex items-center justify-between text-sm">
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
                        ${sell.Stock
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                >
                    {sell.Stock ? 'In Stock' : 'Out of Stock'}
                </span>
                <span className="text-gray-500">
                    Qty: {sell.Stock_Number || 0}
                </span>
            </div>
        </div>
    </Link>
);

const Sells = () => {
    const [sells, setSells] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { currentUser } = useAuth();
    const categories = ['Watches', 'Shoes', 'Bags', 'Fashion', 'Electronics', 'Accessories'];

    useEffect(() => {
        const fetchSells = async () => {
            if (!currentUser) return;

            try {
                let allSells = [];

                for (const category of categories) {
                    const q = query(
                        collection(db, category),
                        where('Seller.Email', '==', currentUser.email)
                    );

                    const querySnapshot = await getDocs(q);
                    const categorySells = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        category,
                        ...doc.data(),
                        rating: Math.floor(Math.random() * 5) + 1,
                        reviews: Math.floor(Math.random() * 100),
                    }));

                    allSells = [...allSells, ...categorySells];
                }

                setSells(allSells);
            } catch (error) {
                console.error('Error fetching sells:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSells();
    }, [currentUser]);

    const filteredSells = selectedCategory === 'all'
        ? sells
        : sells.filter(sell => sell.category === selectedCategory);

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Please login to view your sells</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 sm:py-8 lg:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Category Selection */}
                <div className="mb-8 sm:mb-10">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
                        Our Sells
                    </h1>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm transition-colors
                                ${selectedCategory === 'all'
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm transition-colors
                                    ${selectedCategory === category
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredSells.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-gray-500">No products found in this category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {filteredSells.map((sell) => (
                            <ProductCard key={`${sell.category}-${sell.id}`} sell={sell} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sells;