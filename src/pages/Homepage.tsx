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
import ProductCard from "../components/ProductCard";

const Homepage = () => {
    const [allItems, setAllItems] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [vintageWatches, setVintageWatches] = useState([]);
    const [warrantyItems, setWarrantyItems] = useState([]); // Add this line

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
                            // Rating between 3.5 and 5.0 (rounded to one decimal)
                            rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
                            reviews: Math.floor(Math.random() * 100),
                            // Handle different date formats and provide a fallback
                            dateAdded: data.dateAdded ?
                                (data.dateAdded.toDate ? data.dateAdded.toDate().toISOString() : new Date(data.dateAdded).toISOString())
                                : new Date().toISOString(), // Use current date as fallback
                            Image: data.images?.[0] || data.Image || '',
                            name: data.name || data.Brand || 'Product Name',
                            Brand: data.Brand || data.name || '',
                            Price: parseFloat(data.Price) || 0,
                            ...data,
                        };
                    });
                    allProducts = [...allProducts, ...items];
                }

                // Filter vintage watches
                const vintage = allProducts
                    .filter(product => product.CollectionType === 'Vintage Collection')
                    .slice(0, 6);
                setVintageWatches(vintage);

                // Update the warranty items filter to check for the Warranty object structure
                const warranty = allProducts
                    .filter(product =>
                        product.Warranty?.Status === 'Active' ||
                        (typeof product.Warranty === 'boolean' && product.Warranty === true)
                    )
                    .slice(0, 6);
                setWarrantyItems(warranty);

                // Sort all products by dateAdded for new arrivals
                const newest = [...allProducts]
                    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
                    .slice(0, 6);
                setNewArrivals(newest);

                // Sort by rating for featured products
                const featured = [...allProducts]
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 6);
                setFeaturedProducts(featured);

                // Update trending selection to exactly 6 items
                const trending = [...allProducts]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 6);
                setTrendingProducts(trending);

                setAllItems(allProducts);
            } catch (error) {
                console.error("Error fetching items:", error);
            }
        };

        fetchAllItems();
    }, []);

    // Dummy handlers for wishlist/cart
    const handleToggleWishlist = () => { };
    const handleAddToCart = (e: React.MouseEvent, item: any) => {
        e.preventDefault();
    };

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
            image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
            route: '/fashion'
        },
        {
            name: 'Luxury Edition',
            description: 'Premium timepieces for connoisseurs',
            image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3',
            route: '/all_watches'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Hero Section */}
            <div className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[90vh] bg-gradient-to-br from-white via-gray-100 to-gray-300">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-400/30 via-transparent to-white/20">
                </div>
                <div className="relative h-full flex items-center py-8 sm:py-12 lg:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        {/* Header Text */}
                        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-light text-gray-800 uppercase tracking-wider mb-4">
                                Discover Excellence
                            </h1>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                                Explore our curated collections of premium timepieces
                            </p>
                        </div>

                        {/* Category Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
                            <Link
                                to="/all_watches?category=project"
                                className="group relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-lg shadow-2xl transform transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&h=800&fit=crop&crop=center"
                                    alt="Project Watches"
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col items-center justify-end p-4 sm:p-6">
                                    <div className="text-center transform transition-transform duration-300 group-hover:-translate-y-2">
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-light text-white uppercase tracking-wider mb-2">
                                            Project Watches
                                        </h3>
                                        <p className="text-gray-200 text-xs sm:text-sm text-center leading-relaxed">
                                            Luxury timepieces from leading brands
                                        </p>
                                        <div className="mt-3 sm:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="inline-block bg-white/10 backdrop-blur-sm text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-white/20">
                                                Explore Collection
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                to="/all_watches?category=vintage"
                                className="group relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-lg shadow-2xl transform transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl"
                            >
                                <img
                                    src="https://res.cloudinary.com/dyq1mioyr/image/upload/v1756229850/close-up-pocket-watches-table_1048944-10499918_tkgfmg.webp"
                                    alt="Vintage Watches"
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col items-center justify-end p-4 sm:p-6">
                                    <div className="text-center transform transition-transform duration-300 group-hover:-translate-y-2">
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-light text-white uppercase tracking-wider mb-2">
                                            Vintage
                                        </h3>
                                        <p className="text-gray-200 text-xs sm:text-sm text-center leading-relaxed">
                                            Premium vintage collection
                                        </p>
                                        <div className="mt-3 sm:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="inline-block bg-white/10 backdrop-blur-sm text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-white/20">
                                                Explore Collection
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                to="/all_watches?category=warranty"
                                className="group relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-lg shadow-2xl transform transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl sm:col-span-2 lg:col-span-1"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=1000&q=80"
                                    alt="Under Warranty - Premium Protection"
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col items-center justify-end p-4 sm:p-6">
                                    <div className="text-center transform transition-transform duration-300 group-hover:-translate-y-2">
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-light text-white uppercase tracking-wider mb-2">
                                            Under Warranty
                                        </h3>
                                        <p className="text-gray-200 text-xs sm:text-sm text-center leading-relaxed">
                                            High-end protected accessories
                                        </p>
                                        <div className="mt-3 sm:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="inline-block bg-white/10 backdrop-blur-sm text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-white/20">
                                                Explore Collection
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
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
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-wider text-gray-900 mb-2">
                            Featured Collection
                        </h2>
                        <p className="text-gray-600">Handpicked selection of premium timepieces</p>
                    </div>
                    <Link
                        to="/all_watches"
                        className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900"
                    >
                        View All <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                    {featuredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            item={product}
                            isWishlisted={false}
                            onToggleWishlist={handleToggleWishlist}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>
            </div>

            {/* Trending Now Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-wider text-gray-900 mb-2">
                                Trending Now
                            </h2>
                            <p className="text-gray-600">Most popular styles of the season</p>
                        </div>
                        <Link
                            to="/all_watches"
                            className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900"
                        >
                            View All <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                        {trendingProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                item={product}
                                isWishlisted={false}
                                onToggleWishlist={handleToggleWishlist}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Vintage Collection Section */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-wider text-gray-900 mb-2">
                                Vintage Collection
                            </h2>
                            <p className="text-gray-600">Timeless classics from renowned watchmakers</p>
                        </div>
                        <Link
                            to="/all_watches?category=vintage"
                            className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900"
                        >
                            View All <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                        {vintageWatches.map((product) => (
                            <ProductCard
                                key={product.id}
                                item={product}
                                isWishlisted={false}
                                onToggleWishlist={handleToggleWishlist}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                    {vintageWatches.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No vintage watches available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Warranty Items Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-wider text-gray-900 mb-2">
                                Under Warranty
                            </h2>
                            <p className="text-gray-600">Products with extended warranty coverage</p>
                        </div>
                        <Link
                            to="/all_watches?category=warranty"
                            className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900"
                        >
                            View All <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                        {warrantyItems.map((product) => (
                            <ProductCard
                                key={product.id}
                                item={product}
                                isWishlisted={false}
                                onToggleWishlist={handleToggleWishlist}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                    {warrantyItems.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No warranty items available</p>
                        </div>
                    )}
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

            {/* New Arrivals Section */}
            <div className="bg-white py-16 sm:py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-wider text-gray-900 mb-2">
                                New Arrivals
                            </h2>
                            <p className="text-gray-600">Latest additions to our exclusive collection</p>
                        </div>
                        <Link
                            to="/all_watches"
                            className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900"
                        >
                            View All <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                        {newArrivals.map((product) => (
                            <ProductCard
                                key={product.id}
                                item={product}
                                isWishlisted={false}
                                onToggleWishlist={handleToggleWishlist}
                                onAddToCart={handleAddToCart}
                            />
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

            {/* Instagram Feed Section */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-wider text-gray-900 mb-2">
                            Follow Us on Instagram
                        </h2>
                        <p className="text-gray-600">@projectwatches3</p>
                    </div>
                    <div className="max-w-2xl mx-auto">
                        <div className="h-[600px] w-full overflow-hidden rounded-lg">
                            <iframe
                                src="https://www.instagram.com/projectwatches3/embed"
                                className="w-full h-full"
                                frameBorder="0"
                                scrolling="no"
                                allowTransparency={true}
                                title="Instagram Feed"
                            ></iframe>
                        </div>
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

            {/* Store Location Map */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Text Content */}
                        <div className="flex flex-col justify-center lg:pr-8 order-2 lg:order-1">
                            <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-wider text-gray-900 mb-4">
                                Visit Our Store
                            </h2>
                            <div className="space-y-4">
                                <p className="text-gray-600">
                                    Experience our luxury timepieces in person at our flagship store in Pune.
                                </p>
                                <div className="space-y-2">
                                    <p className="text-gray-800 font-medium">Store Hours:</p>
                                    <p className="text-gray-600">Monday - Saturday: 10:00 AM - 9:00 PM</p>
                                    <p className="text-gray-600">Sunday: 11:00 AM - 7:00 PM</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-gray-800 font-medium">Address:</p>
                                    <p className="text-gray-600">
                                        123 MG Road, Camp<br />
                                        Pune, Maharashtra 411001
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-gray-800 font-medium">Contact:</p>
                                    <p className="text-gray-600">Phone: +91-9049408898</p>
                                    <p className="text-gray-600">Email: prameetsw@gmail.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Map Container */}
                        <div className="w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden rounded-lg shadow-lg order-1 lg:order-2">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d242118.17006357733!2d73.6981511798317!3d18.52454503738018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf2e67461101%3A0x828d43bf9d9ee343!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1750233952898!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Store Location"
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage;