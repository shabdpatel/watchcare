import React, { useState } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed w-full backdrop-blur-sm bg-black/5 border-b border-white/10 z-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Desktop Menu */}
                    <div className="flex-shrink-0">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                        />
                    </div>

                    {/* Desktop Menu Items */}
                    <div className="hidden sm:flex sm:items-center sm:space-x-6">
                        <ul className="flex space-x-6 uppercase text-sm text-white/90">
                            <li className="hover:text-white transition-colors border-b-1 border-transparent hover:border-white">
                                <a href="/" className="px-2 py-4">Home</a>
                            </li>
                            <li className="hover:text-white transition-colors border-b-1 border-transparent hover:border-white">
                                <a href="#" className="px-2 py-4">Trendings</a>
                            </li>
                            <li className="hover:text-white transition-colors border-b-1 border-transparent hover:border-white">
                                <a href="#" className="px-2 py-4">Exclusive Watches</a>
                            </li>
                            <li className="hover:text-white transition-colors border-b-1 border-transparent hover:border-white">
                                <a href="#" className="px-2 py-4">Smart Watches</a>
                            </li>
                            <li className="hover:text-white transition-colors border-b-1 border-transparent hover:border-white">
                                <a href="/input" className="px-2 py-4">Become a Seller</a>
                            </li>
                            <li className="hover:text-white transition-colors border-b-1 border-transparent hover:border-white">
                                <a href="#" className="px-2 py-4">Contact Us</a>
                            </li>
                        </ul>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center space-x-4 sm:space-x-6">
                        <div className="hidden sm:flex space-x-4">
                            <Search className="w-5 h-5 text-white/90 hover:text-white cursor-pointer transition-colors" />
                            <User className="w-5 h-5 text-white/90 hover:text-white cursor-pointer transition-colors" />
                            <ShoppingBag className="w-5 h-5 text-white/90 hover:text-white cursor-pointer transition-colors" />
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="sm:hidden text-white/90 hover:text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="sm:hidden absolute w-full bg-black/95 backdrop-blur-xl left-0 px-4 pb-4">
                        <ul className="space-y-4 py-4 border-t border-white/10">
                            <li>
                                <a href="/" className="block text-white/90 hover:text-white py-2">Home</a>
                            </li>
                            <li>
                                <a href="#" className="block text-white/90 hover:text-white py-2">Trendings</a>
                            </li>
                            <li>
                                <a href="#" className="block text-white/90 hover:text-white py-2">Exclusive Watches</a>
                            </li>
                            <li>
                                <a href="#" className="block text-white/90 hover:text-white py-2">Smart Watches</a>
                            </li>
                            <li>
                                <a href="/input" className="block text-white/90 hover:text-white py-2">Become Seller</a>
                            </li>
                            <li>
                                <a href="#" className="block text-white/90 hover:text-white py-2">Contact Us</a>
                            </li>
                        </ul>

                        <div className="flex space-x-6 pt-4 border-t border-white/10">
                            <Search className="w-5 h-5 text-white/90 hover:text-white cursor-pointer" />
                            <User className="w-5 h-5 text-white/90 hover:text-white cursor-pointer" />
                            <ShoppingBag className="w-5 h-5 text-white/90 hover:text-white cursor-pointer" />
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;