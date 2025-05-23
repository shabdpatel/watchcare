import React from 'react';
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

import {
    FaFacebook,
    FaInstagram,
    FaTwitter,
    FaShoePrints
} from 'react-icons/fa';

const Homepage = () => {
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

    const featuredProducts = [
        {
            name: 'Premium Chronograph',
            price: '₹49,999',
            tag: 'Bestseller',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
        },
        {
            name: 'Smart Watch Pro',
            price: '₹29,999',
            tag: 'New Arrival',
            image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12'
        },
        {
            name: 'Limited Edition Watch',
            price: '₹89,999',
            tag: 'Exclusive',
            image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6'
        }
    ];

    const trendingProducts = [
        {
            name: 'Smart Watch Pro',
            price: '₹29,999',
            tag: 'New Arrival',
            image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12'
        },
        {
            name: 'Designer Clutch',
            price: '₹8,999',
            tag: 'Bestseller',
            image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c'
        },
        {
            name: 'Premium Earbuds',
            price: '₹14,999',
            tag: 'Limited Edition',
            image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df'
        }
    ];

    const blogPosts = [
        {
            title: 'How to Choose the Perfect Watch',
            category: 'Style Guide',
            image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e',
            date: 'May 15, 2024'
        },
        {
            title: 'Summer Fashion Trends 2024',
            category: 'Fashion',
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
            date: 'May 18, 2024'
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

    const newArrivals = [
        {
            name: 'Luxury Chronograph',
            price: '₹79,999',
            image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9',
            brand: 'Swiss Elite'
        },
        {
            name: 'Smart Fashion Watch',
            price: '₹34,999',
            image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a',
            brand: 'TechStyle'
        }
    ];

    // Update collections with routes
    const collections = [
        {
            name: 'Summer Collection',
            description: 'Light and stylish pieces for the season',
            image: 'https://images.unsplash.com/photo-1549972574-8e3e1ed6a347',
            route: '/fashion'
        },
        {
            name: 'Luxury Edition',
            description: 'Premium timepieces for connoisseurs',
            image: 'https://images.unsplash.com/photo-1606604830262-2e0732b12acc',
            route: '/all_watches'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Hero Section */}
            <div className="relative h-[90vh] bg-black">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30"
                        alt="Hero"
                        className="w-full h-full object-cover opacity-60"
                    />
                </div>
                <div className="relative h-full flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                        <h1 className="text-5xl md:text-7xl font-light text-white uppercase tracking-wider">
                            Timeless Elegance
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl tracking-wide">
                            Discover our curated collection of premium watches and lifestyle accessories
                        </p>
                        <Link
                            to="/all_watches"
                            className="bg-white text-gray-900 px-8 py-4 text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors inline-block"
                        >
                            Explore Collection
                        </Link>
                    </div>
                </div>
            </div>

            {/* New Flash Sale Banner */}
            <div className="bg-red-600 text-white py-3">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-lg font-semibold">Flash Sale - Up to 50% Off!</span>
                        <span className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-bold">24:00:00</span>
                        <Link
                            to="/all_watches"
                            className="text-sm underline hover:text-gray-200 transition-colors"
                        >
                            Shop Now
                        </Link>
                    </div>
                </div>
            </div>

            {/* Value Propositions */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-light uppercase tracking-wider text-gray-900">
                        Featured Collection
                    </h2>
                    <Link
                        to="/all-watches"
                        className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-600 hover:text-gray-900"
                    >
                        View All <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredProducts.map((product) => (
                        <div key={product.name} className="group">
                            <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/80 backdrop-blur-sm px-4 py-1 text-xs uppercase tracking-wider">
                                        {product.tag}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white">
                                        <HeartIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 space-y-1">
                                <h3 className="text-lg font-medium">{product.name}</h3>
                                <p className="text-gray-600">{product.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* New Trending Products Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Trending Now</h2>
                            <p className="text-gray-600">Discover what's hot this season</p>
                        </div>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            View All <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {trendingProducts.map((product) => (
                            <div key={product.name} className="group relative">
                                <div className="relative overflow-hidden rounded-lg aspect-square">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white px-3 py-1 rounded-full text-sm font-medium">
                                            {product.tag}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium">{product.name}</h3>
                                    <p className="text-gray-600">{product.price}</p>
                                </div>
                            </div>
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

            {/* New Blog Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">From Our Blog</h2>
                    <p className="text-gray-600">Latest updates from the world of fashion and lifestyle</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {blogPosts.map((post) => (
                        <div key={post.title} className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-lg aspect-[16/9]">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="mt-4">
                                <span className="text-sm text-gray-500">{post.category} • {post.date}</span>
                                <h3 className="text-xl font-semibold mt-2 group-hover:text-gray-600">{post.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Brand Showcase */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h3 className="text-center text-gray-500 text-sm font-semibold mb-8">TRUSTED BY LEADING BRANDS</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {newArrivals.map((item) => (
                            <div key={item.name} className="group cursor-pointer">
                                <div className="relative aspect-square overflow-hidden rounded-lg">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <p className="text-gray-300 text-sm mb-2">{item.brand}</p>
                                        <h3 className="text-white text-xl font-medium mb-2">{item.name}</h3>
                                        <p className="text-white font-light">{item.price}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Collection Showcase */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {collections.map((collection) => (
                            <div key={collection.name} className="group relative overflow-hidden rounded-lg">
                                <div className="aspect-[16/9]">
                                    <img
                                        src={collection.image}
                                        alt={collection.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-light text-white uppercase tracking-wider mb-2">
                                            {collection.name}
                                        </h3>
                                        <p className="text-gray-200 mb-4">{collection.description}</p>
                                        <Link
                                            to={collection.route}
                                            className="bg-white text-gray-900 px-6 py-2 text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors"
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

            {/* Newsletter Section */}
            <div className="bg-gray-100 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl font-light uppercase tracking-wider text-gray-900 mb-4">
                            Stay Updated
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Subscribe to our newsletter for exclusive offers, new arrivals, and insider news
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 flex-1 max-w-md"
                            />
                            <button className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shopping Benefits */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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


            {/* Footer */}
            <footer className="bg-gray-900 text-white pt-16">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 pb-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Luxury Store</h3>
                        <p className="text-gray-400">Curating premium lifestyle products since 2018</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Customer Service</h4>
                        <ul className="space-y-2">
                            <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
                            <li><Link to="/shipping" className="text-gray-400 hover:text-white">Shipping Policy</Link></li>
                            <li><Link to="/returns" className="text-gray-400 hover:text-white">Return Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                            <li><Link to="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
                            <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Connect</h4>
                        <div className="flex gap-4">
                            <FaFacebook className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                            <FaInstagram className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                            <FaTwitter className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 py-8 text-center">
                    <p className="text-gray-400">&copy; 2024 Luxury Store. All rights reserved</p>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;