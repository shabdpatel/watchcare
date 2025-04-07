import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CiHeart, CiSearch } from "react-icons/ci";
import { RiAccountCircleLine, RiMenuLine, RiCloseLine } from "react-icons/ri";
import { HiShoppingBag } from "react-icons/hi2";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { name: 'ALL WATCHES', path: '/all_watches' },
        { name: 'MEN', path: '/men' },
        { name: 'WOMEN', path: '/women' },
        { name: 'SMART', path: '/smart' },
        { name: 'BRANDS', path: '/brands' },
        { name: 'BECOME SELLER', path: '/input' },
        { name: 'OFFERS', path: '/offers' }
    ];

    return (
        <nav className="fixed w-full bg-white z-50 shadow-sm">
            {/* Top Banner */}
            <div className="bg-black text-white text-center py-2 text-xs font-medium">
                40+ INTERNATIONAL BRANDS
            </div>

            {/* Main Nav */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold uppercase tracking-tight">HECLOS</Link>
                    </div>

                    {/* Desktop Menu Items */}
                    <div className="hidden sm:flex sm:items-center sm:space-x-4 lg:space-x-8">
                        <ul className="flex space-x-4 lg:space-x-8 text-[15px] font-normal text-gray-700">
                            {navItems.map((item) => (
                                <li key={item.path} className="hover:text-black transition-colors">
                                    <Link to={item.path} className="px-2 py-4 whitespace-nowrap">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4 lg:space-x-6">
                        {/* Search Bar */}
                        <div className="hidden sm:flex items-center space-x-2 border-b border-black/20 lg:border-b-0 pb-1 lg:pb-0 w-32 lg:w-40 transition-all">
                            <CiSearch className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search entire site"
                                className="bg-transparent w-full focus:outline-none placeholder:text-gray-500 text-sm"
                            />
                        </div>

                        {/* Icons */}
                        <div className="hidden sm:flex space-x-4 lg:space-x-6">
                            <Link to="/account" className="text-gray-700 hover:text-black transition-colors">
                                <RiAccountCircleLine className="w-6 h-6 cursor-pointer" />
                            </Link>
                            <Link to="/wishlist" className="text-gray-700 hover:text-black transition-colors">
                                <CiHeart className="w-6 h-6 cursor-pointer" />
                            </Link>
                            <Link to="/cart" className="text-gray-700 hover:text-black transition-colors">
                                <HiShoppingBag className="w-6 h-6 cursor-pointer" />
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="sm:hidden text-gray-700 p-1 hover:bg-gray-100 rounded-md transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <RiCloseLine className="w-6 h-6" />
                            ) : (
                                <RiMenuLine className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="sm:hidden fixed w-full bg-white left-0 top-[68px] px-4 pb-4 shadow-lg animate-slideDown">
                        <ul className="space-y-2 py-4 border-t border-gray-200">
                            {navItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className="block text-gray-700 hover:text-black py-3 px-4 rounded-md hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-2 border border-black/20 rounded-full px-4 py-2">
                                <CiSearch className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search entire site"
                                    className="bg-transparent w-full focus:outline-none placeholder:text-gray-500 text-sm"
                                />
                            </div>
                            <div className="flex space-x-6 mt-4 px-4">
                                <Link to="/account" className="text-gray-700 hover:text-black transition-colors">
                                    <RiAccountCircleLine className="w-6 h-6 cursor-pointer" />
                                </Link>
                                <Link to="/wishlist" className="text-gray-700 hover:text-black transition-colors">
                                    <CiHeart className="w-6 h-6 cursor-pointer" />
                                </Link>
                                <Link to="/cart" className="text-gray-700 hover:text-black transition-colors">
                                    <HiShoppingBag className="w-6 h-6 cursor-pointer" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
