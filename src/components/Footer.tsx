// Import required React and icon components
import { useState } from 'react';
import { FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Footer = () => {
    // State management for email input and subscription status
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Handle form submission
    const handleSubscribe = (e) => {
        e.preventDefault();
        // Add your email subscription API call or logic here
        setIsSubscribed(true);  // Show confirmation message
        setEmail('');  // Clear email input
    };

    return (
        <footer className="bg-gray-50 text-gray-600 py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Newsletter Subscription Section */}
                <div className="pb-6 sm:pb-8 mb-6 sm:mb-8 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                        {/* Subscription Text */}
                        <div className="w-full md:w-auto mb-4 md:mb-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Stay Updated
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Subscribe for exclusive offers and style inspiration
                            </p>
                        </div>

                        {/* Subscription Form */}
                        <form
                            onSubmit={handleSubscribe}
                            className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
                        >
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap w-full sm:w-auto"
                            >
                                Subscribe
                            </button>
                        </form>

                        {/* Subscription Success Message */}
                        {isSubscribed && (
                            <div className="mt-3 md:mt-0 text-sm text-green-600 w-full md:w-auto">
                                Thank you for subscribing!
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Footer Content Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 text-sm">
                    {/* Customer Service Section */}
                    <div>
                        <h3 className="text-gray-900 uppercase font-semibold mb-3">
                            Customer Service
                        </h3>
                        <ul className="space-y-2">
                            <li><Link to="/orders" className="hover:text-gray-900 transition">Order Tracking</Link></li>
                            <li><Link to="/cart" className="hover:text-gray-900 transition">Shopping Cart</Link></li>
                            <li><Link to="/checkout" className="hover:text-gray-900 transition">Checkout</Link></li>
                            <li><Link to="/profile" className="hover:text-gray-900 transition">My Account</Link></li>
                            <li><Link to="/sells" className="hover:text-gray-900 transition">Sell with Us</Link></li>
                        </ul>
                    </div>

                    {/* Shop Categories Section */}
                    <div>
                        <h3 className="text-gray-900 uppercase font-semibold mb-3">
                            Shop Categories
                        </h3>
                        <ul className="space-y-2">
                            <li><Link to="/all_watches" className="hover:text-gray-900 transition">Watches</Link></li>
                            <li><Link to="/shoes" className="hover:text-gray-900 transition">Shoes</Link></li>
                            <li><Link to="/fashion" className="hover:text-gray-900 transition">Fashion</Link></li>
                            <li><Link to="/bags" className="hover:text-gray-900 transition">Bags</Link></li>
                            <li><Link to="/electronics" className="hover:text-gray-900 transition">Electronics</Link></li>
                            <li><Link to="/accessories" className="hover:text-gray-900 transition">Accessories</Link></li>
                        </ul>
                    </div>

                    {/* Company Information Section */}
                    <div>
                        <h3 className="text-gray-900 uppercase font-semibold mb-3">
                            Know Unbox
                        </h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="hover:text-gray-900 transition">About Us</Link></li>
                            <li><Link to="/all_watches" className="hover:text-gray-900 transition">Corporate Information</Link></li>
                            <li><Link to="/cart" className="hover:text-gray-900 transition">Bulk Orders</Link></li>
                            <li><Link to="/profile" className="hover:text-gray-900 transition">Store Locator</Link></li>
                            <li><Link to="/register" className="hover:text-gray-900 transition">Careers</Link></li>
                        </ul>
                    </div>

                    {/* Legal Information Section */}
                    <div>
                        <h3 className="text-gray-900 uppercase font-semibold mb-3">
                            Legal
                        </h3>
                        <ul className="space-y-2">
                            <li><Link to="/accessories" className="hover:text-gray-900 transition">Privacy Policy</Link></li>
                            <li><Link to="/accessories" className="hover:text-gray-900 transition">Terms of Service</Link></li>
                            <li><Link to="/accessories" className="hover:text-gray-900 transition">Cookie Policy</Link></li>
                            <li><Link to="/accessories" className="hover:text-gray-900 transition">Accessibility</Link></li>
                        </ul>
                    </div>

                    {/* Contact Information Section */}
                    <div>
                        <h3 className="text-gray-900 uppercase font-semibold mb-3">
                            Contact Us
                        </h3>
                        <ul className="space-y-2">
                            <li className="text-gray-800">Unbox Customer Care</li>
                            <li>
                                <a href="tel:+919049408898" className="text-blue-600 hover:underline">
                                    +91-9049408898
                                </a>
                            </li>
                            <li>
                                <a href="mailto:prameetsw@gmail.com" className="text-blue-600 hover:underline">
                                    prameetsw@gmail.com
                                </a>
                            </li>
                            <li className="mt-4">
                                <p className="text-gray-600">Registered Office:</p>
                                <p className="text-gray-800">123 Unbox Plaza, Mumbai, India 400001</p>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media Section - Updated */}
                    <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                        <h3 className="text-gray-900 uppercase font-semibold mb-3">
                            Connect With Us
                        </h3>
                        <div className="flex space-x-6 mb-4">
                            <Link to="/" className="text-gray-600 hover:text-gray-900 transition text-xl sm:text-2xl p-1">
                                <FaTwitter />
                            </Link>
                            <Link to="/" className="text-gray-600 hover:text-gray-900 transition text-xl sm:text-2xl p-1">
                                <FaFacebookF />
                            </Link>
                            <Link to="/" className="text-gray-600 hover:text-gray-900 transition text-xl sm:text-2xl p-1">
                                <FaInstagram />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
                    <div className="text-gray-600 text-xs sm:text-sm text-center">
                        <p>&copy; {new Date().getFullYear()} Unbox. All rights reserved.</p>
                        <p className="mt-1">Premium Watch Retailer</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;