import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ClockIcon,
    ShoppingBagIcon,
    DevicePhoneMobileIcon,
    GiftIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    TruckIcon,
    CreditCardIcon,
    ArrowRightIcon,
    HeartIcon,
    SparklesIcon,
    FaceSmileIcon,
    AcademicCapIcon,
    BanknotesIcon,
    StarIcon,
    ChevronRightIcon,
    PlayCircleIcon,
    ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { FaFacebook, FaInstagram, FaTwitter, FaShoePrints } from 'react-icons/fa';
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const Homepage = () => {
    const [allItems, setAllItems] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);

    useEffect(() => {
        const fetchAllItems = async () => {
            try {
                const collections = ['Watches', 'Fashion', 'Electronics', 'Accessories', 'Bags', 'Shoes'];
                let allProducts = [];

                for (const collectionName of collections) {
                    const querySnapshot = await getDocs(collection(db, collectionName));
                    const items = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            collectionName,
                            rating: Math.floor(Math.random() * 5) + 1,
                            reviews: Math.floor(Math.random() * 100),
                            dateAdded: data.dateAdded || new Date().toISOString(),
                            Image: data.images?.[0] || data.Image || '',
                            name: data.name || data.Brand || 'Product Name',
                            Brand: data.Brand || data.name || '',
                            Price: parseFloat(data.Price) || 0,
                            ...data,
                        };
                    });
                    allProducts = [...allProducts, ...items];
                }

                // Sort by rating for featured products
                const featured = [...allProducts]
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 3);
                setFeaturedProducts(featured);

                // Sort by date for new arrivals (most recent first)
                const newest = [...allProducts]
                    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
                    .slice(0, 3);  // Change from 2 to 3 items
                setNewArrivals(newest);

                // Update trending selection to exactly 3 items
                const trending = [...allProducts]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3);  // Ensure exactly 3 items
                setTrendingProducts(trending);

                setAllItems(allProducts);
            } catch (error) {
                console.error("Error fetching items:", error);
            }
        };

        fetchAllItems();
    }, []);

    const categories = [
        {
            name: 'Watches',
            image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e',
            description: 'Luxury timepieces from leading brands',
            route: '/all_watches'
        },
        {
            name: 'Fashion',
            image: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
            description: 'Premium apparel collection',
            route: '/fashion'
        },
        {
            name: 'Electronics',
            image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece',
            description: 'High-end tech accessories',
            route: '/electronics'
        }
    ];

    const brands = [
        { name: 'Brand 1', logo: 'https://cdn-icons-png.flaticon.com/512/732/732084.png' },
        { name: 'Brand 2', logo: 'https://cdn-icons-png.flaticon.com/512/732/732083.png' },
        { name: 'Brand 3', logo: 'https://cdn-icons-png.flaticon.com/512/732/732087.png' },
        { name: 'Brand 4', logo: 'https://cdn-icons-png.flaticon.com/512/732/732085.png' }
    ];

    const testimonials = [
        {
            text: 'The quality exceeded my expectations! Fast shipping and excellent customer service.',
            author: 'Rahul Sharma',
            role: 'Premium Member'
        },
        {
            text: 'Best place to find luxury items at reasonable prices. Highly recommended!',
            author: 'Priya Patel',
            role: 'Fashion Blogger'
        }
    ];

    const collections = [
        {
            name: 'Summer Collection',
            description: 'Light and stylish pieces for the season',
            image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',  // Updated to clothes image
            route: '/fashion'
        },
        {
            name: 'Luxury Edition',
            description: 'Premium timepieces for connoisseurs',
            image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3',  // Updated to luxury watch image
            route: '/all_watches'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Hero Section */}
            <div className="relative h-[60vh] md:h-[90vh] bg-black">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30"
                        alt="Hero"
                        className="w-full h-full object-cover opacity-60"
                    />
                </div>
                <div className="relative h-full flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 md:space-y-8">
                        <h1 className="text-3xl sm:text-5xl md:text-7xl font-light text-white uppercase tracking-wider">
                            Timeless Elegance
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl tracking-wide">
                            Discover our curated collection
                        </p>
                    </div>
                </div>
            </div>

            {/* New Flash Sale Banner */}
            <div className="bg-red-600 text-white py-2 sm:py-3">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
                        <span className="text-base sm:text-lg font-semibold">Flash Sale - Up to 50% Off!</span>
                        <span className="bg-white text-red-600 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">24:00:00</span>
                    </div>
                </div>
            </div>

            {/* Value Propositions */}
            <div className="bg-white py-8 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
                    <div className="text-center">
                        <TruckIcon className="w-12 h-12 mx-auto text-gray-900 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
                        <p className="text-gray-600">On all orders over ₹15,000</p>
                    </div>
                    <div className="text-center">
                        <SparklesIcon className="w-12 h-12 mx-auto text-gray-900 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Authentic Products</h3>
                        <p className="text-gray-600">100% genuine items guaranteed</p>
                    </div>
                    <div className="text-center">
                        <BanknotesIcon className="w-12 h-12 mx-auto text-gray-900 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
                        <p className="text-gray-600">30-day return policy</p>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-light uppercase tracking-wider text-gray-900 text-center mb-12">
                        Shop By Category
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                to={category.route}
                                className="group relative aspect-[4/5] overflow-hidden rounded-lg"
                            >
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                                    <h3 className="text-2xl font-light text-white uppercase tracking-wider mb-2">
                                        {category.name}
                                    </h3>
                                    <p className="text-gray-200 text-sm text-center">
                                        {category.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-wider text-gray-900 mb-4 sm:mb-0">
                        Featured Collection
                    </h2>
                    <Link
                        to="/all_watches"
                        className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900"
                    >
                        View All <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                    {featuredProducts.map((product) => (
                        <Link
                            to={product.collectionName === 'Watches' ? '/all_watches' : `/${product.collectionName.toLowerCase()}`}
                            key={product.id}
                            className="group"
                        >
                            <div className="group relative bg-gray-100 rounded-lg overflow-hidden border border-gray-300 hover:border-gray-400 transition-all duration-300">
                                <div className="aspect-square overflow-hidden relative">
                                    <img
                                        src={product.Image || product.images?.[0]}
                                        alt={product.Company || product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-sm px-4 py-1 text-xs font-medium uppercase tracking-wider rounded-full">
                                            {product.collectionName}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors">
                                            <HeartIcon className="w-5 h-5 text-gray-900" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-3 sm:p-4 space-y-1">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                        <h3 className="text-lg sm:text-xl font-medium uppercase tracking-wide text-gray-900 truncate max-w-[70%]">
                                            {product.Company || product.name}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <StarIcon
                                                        key={i}
                                                        className={`w-4 h-4 ${i < (product.rating || 0) ? 'fill-current' : 'fill-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-lg font-light">
                                        ₹{product.Price?.toLocaleString() || 'N/A'}
                                    </p>
                                    <p className="text-gray-500 text-sm line-clamp-2">
                                        {product.Description || product.description}
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            className="flex-1 py-2 text-sm uppercase tracking-wide border border-gray-400 rounded-md hover:bg-gray-300/30 transition-colors duration-300 flex items-center justify-center gap-2"
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* New Trending Products Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-3xl font-light uppercase tracking-wider text-gray-900">
                            Trending Now
                        </h2>
                        <Link
                            to="/all_watches"
                            className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900"
                        >
                            View All <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                        {trendingProducts.map((product) => (
                            <Link
                                to={product.collectionName === 'Watches' ? '/all_watches' : `/${product.collectionName.toLowerCase()}`}
                                key={product.id}
                                className="group"
                            >
                                <div className="group relative bg-gray-100 rounded-lg overflow-hidden border border-gray-300 hover:border-gray-400 transition-all duration-300">
                                    <div className="aspect-square overflow-hidden relative">
                                        <img
                                            src={product.Image || product.images?.[0]}
                                            alt={product.Company || product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur-sm px-4 py-1 text-xs font-medium uppercase tracking-wider rounded-full">
                                                {product.collectionName}
                                            </span>
                                        </div>
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors">
                                                <HeartIcon className="w-5 h-5 text-gray-900" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-3 sm:p-4 space-y-1">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                            <h3 className="text-lg sm:text-xl font-medium uppercase tracking-wide text-gray-900 truncate max-w-[70%]">
                                                {product.Company || product.name}
                                            </h3>
                                            <div className="flex items-center gap-1">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarIcon
                                                            key={i}
                                                            className={`w-4 h-4 ${i < (product.rating || 0) ? 'fill-current' : 'fill-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-lg font-light">
                                            ₹{product.Price?.toLocaleString() || 'N/A'}
                                        </p>
                                        <p className="text-gray-500 text-sm line-clamp-2">
                                            {product.Description || product.description}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                className="flex-1 py-2 text-sm uppercase tracking-wide border border-gray-400 rounded-md hover:bg-gray-300/30 transition-colors duration-300 flex items-center justify-center gap-2"
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* New Video Section */}
            <div className="relative h-[60vh] bg-black">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30"
                        alt="Video Background"
                        className="w-full h-full object-cover opacity-50"
                    />
                </div>
                <div className="relative h-full flex items-center justify-center text-center">
                    <div className="space-y-6">
                        <PlayCircleIcon className="w-20 h-20 text-white mx-auto cursor-pointer hover:scale-110 transition-transform" />
                        <h2 className="text-4xl font-bold text-white">Discover Our Story</h2>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Experience luxury craftsmanship and timeless elegance
                        </p>
                    </div>
                </div>
            </div>

            {/* Brand Showcase */}
            <div className="py-8 sm:py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h3 className="text-center text-gray-500 text-sm font-semibold mb-6 sm:mb-8">TRUSTED BY LEADING BRANDS</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
                        {brands.map((brand) => (
                            <img
                                key={brand.name}
                                src={brand.logo}
                                alt={brand.name}
                                className="h-12 w-full object-contain opacity-50 hover:opacity-100 transition-opacity"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
                    <div className="text-center">
                        <ShieldCheckIcon className="w-10 h-10 mx-auto text-gray-700 mb-3" />
                        <h3 className="text-sm uppercase tracking-wider">Authentic Products</h3>
                    </div>
                    <div className="text-center">
                        <TruckIcon className="w-10 h-10 mx-auto text-gray-700 mb-3" />
                        <h3 className="text-sm uppercase tracking-wider">Free Shipping</h3>
                    </div>
                    <div className="text-center">
                        <CreditCardIcon className="w-10 h-10 mx-auto text-gray-700 mb-3" />
                        <h3 className="text-sm uppercase tracking-wider">Secure Payment</h3>
                    </div>
                    <div className="text-center">
                        <ShoppingBagIcon className="w-10 h-10 mx-auto text-gray-700 mb-3" />
                        <h3 className="text-sm uppercase tracking-wider">Easy Returns</h3>
                    </div>
                </div>
            </div>

            {/* New Arrivals Banner */}
            <div className="bg-gray-900 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-light text-white uppercase tracking-wider mb-4">
                            New Arrivals
                        </h2>
                        <p className="text-gray-400">Be the first to discover our latest additions</p>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                        {newArrivals.map((product) => (
                            <Link
                                to={product.collectionName === 'Watches' ? '/all_watches' : `/${product.collectionName.toLowerCase()}`}
                                key={product.id}
                                className="group"
                            >
                                <div className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-500 transition-all duration-300">
                                    <div className="aspect-square overflow-hidden relative">
                                        <img
                                            src={product.Image || product.images?.[0]}
                                            alt={product.Company || product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur-sm px-4 py-1 text-xs font-medium uppercase tracking-wider rounded-full">
                                                New
                                            </span>
                                        </div>
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors">
                                                <HeartIcon className="w-5 h-5 text-gray-900" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-3 sm:p-4 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-medium uppercase tracking-wide text-white truncate max-w-[70%]">
                                                {product.Company || product.name}
                                            </h3>
                                            <span className="text-gray-400 text-sm">
                                                {new Date(product.dateAdded).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-lg font-light">
                                            ₹{product.Price?.toLocaleString() || 'N/A'}
                                        </p>
                                        <p className="text-gray-400 text-sm line-clamp-2">
                                            {product.Description || product.description}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <button className="flex-1 py-2 text-sm uppercase tracking-wide border border-gray-500 text-white rounded-md hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2">
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Collection Showcase */}
            <div className="py-8 sm:py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                        {collections.map((collection) => (
                            <div key={collection.name} className="group relative overflow-hidden rounded-lg">
                                <div className="aspect-[16/9]">
                                    <img
                                        src={collection.image}
                                        alt={collection.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 text-center">
                                    <div className="max-w-xs sm:max-w-sm">
                                        <h3 className="text-xl sm:text-2xl font-light text-white uppercase tracking-wider mb-2">
                                            {collection.name}
                                        </h3>
                                        <p className="text-gray-200 text-sm sm:text-base mb-4">
                                            {collection.description}
                                        </p>
                                        <Link
                                            to={collection.route}
                                            className="inline-block bg-white text-gray-900 px-8 py-3 text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors"
                                        >
                                            Explore
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Shopping Benefits */}
            <div className="bg-white py-8 sm:py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheckIcon className="w-8 h-8 text-gray-900" />
                            </div>
                            <h3 className="text-sm font-medium uppercase tracking-wider">Secure Shopping</h3>
                            <p className="text-gray-600 text-sm mt-2">100% Protected Payments</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <SparklesIcon className="w-8 h-8 text-gray-900" />
                            </div>
                            <h3 className="text-sm font-medium uppercase tracking-wider">Premium Quality</h3>
                            <p className="text-gray-600 text-sm mt-2">Guaranteed Authenticity</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TruckIcon className="w-8 h-8 text-gray-900" />
                            </div>
                            <h3 className="text-sm font-medium uppercase tracking-wider">Fast Delivery</h3>
                            <p className="text-gray-600 text-sm mt-2">Express Shipping Options</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HeartIcon className="w-8 h-8 text-gray-900" />
                            </div>
                            <h3 className="text-sm font-medium uppercase tracking-wider">Customer Love</h3>
                            <p className="text-gray-600 text-sm mt-2">4.8/5 Average Rating</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage;