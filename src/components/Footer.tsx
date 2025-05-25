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
        <footer className="bg-gray-50 text-gray-600 py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Newsletter Subscription Section */}
                <div className="pb-8 mb-8 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Subscription Text */}
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Stay Updated
                            </h3>
                            <p className="text-gray-600">
                                Subscribe for exclusive offers and style inspiration
                            </p>
                        </div>

                        {/* Subscription Form */}
                        <form
                            onSubmit={handleSubscribe}
                            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
                        >
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>

                        {/* Subscription Success Message */}
                        {isSubscribed && (
                            <div className="mt-4 md:mt-0 text-sm text-green-600">
                                Thank you for subscribing! Please check your email for confirmation.
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Footer Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-sm">
                    {/* Customer Service Section */}
                    <div>
                        <h3 className="text-gray-900 uppercase font-semibold mb-3">
                            Customer Service
                        </h3>
                        <ul className="space-y-2">
                            <li><Link to="/profile" className="hover:text-gray-900 transition">Order Tracking</Link></li>
                            <li><Link to="/accessories" className="hover:text-gray-900 transition">FAQs</Link></li>
                            <li><Link to="/all_watches" className="hover:text-gray-900 transition">Returns & Exchanges</Link></li>
                            <li><Link to="/accessories" className="hover:text-gray-900 transition">Shipping Information</Link></li>
                            <li><Link to="/profile" className="hover:text-gray-900 transition">Contact Support</Link></li>
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

                    {/* Social Media and App Section */}
                    <div>
                        <h3 className="text-gray-900 uppercase font-semibold mb-3">
                            Connect With Us
                        </h3>
                        <div className="flex space-x-4 mb-4">
                            <Link to="/" className="text-gray-600 hover:text-gray-900 transition text-lg">
                                <FaTwitter />
                            </Link>
                            <Link to="/" className="text-gray-600 hover:text-gray-900 transition text-lg">
                                <FaFacebookF />
                            </Link>
                            <Link to="/" className="text-gray-600 hover:text-gray-900 transition text-lg">
                                <FaInstagram />
                            </Link>
                        </div>
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Download Our App
                            </h4>
                            <div className="flex gap-2">
                                <Link to="/">
                                    <img src="/app-store.svg" alt="App Store" className="h-10" />
                                </Link>
                                <Link to="/">
                                    <img src="/google-play.svg" alt="Google Play" className="h-10" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods and Copyright Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-4 flex-wrap">
                            <img src="/visa.svg" alt="Visa" className="h-8" />
                            <img src="/mastercard.svg" alt="Mastercard" className="h-8" />
                            <img src="/paypal.svg" alt="PayPal" className="h-8" />
                            <img src="/amex.svg" alt="American Express" className="h-8" />
                        </div>
                        <div className="text-gray-600 text-sm text-center md:text-right">
                            <p>&copy; {new Date().getFullYear()} Unbox. All rights reserved.</p>
                            <p className="mt-1">Premium Watch Retailer</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;