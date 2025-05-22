import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CiHeart, CiSearch } from "react-icons/ci";
import { RiAccountCircleLine, RiMenuLine, RiCloseLine } from "react-icons/ri";
import { HiShoppingBag } from "react-icons/hi2";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);  // Add this state

    // Add scroll event listener
    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'WATCHES', path: '/all_watches' },
        { name: 'SHOES', path: '/shoes' },
        { name: 'FASHION', path: '/fashion' },
        { name: 'ELECTRONICS', path: '/electronics' },
        { name: 'BAGS', path: '/bags' },
        { name: 'ACCESSORIES', path: '/accessories' },
        { name: 'BECOME SELLER', path: '/input' }
    ];

    return (
        <nav className={`fixed w-full bg-white z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
            {/* Top Banner */}
            <div className="bg-black text-white text-center py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium">
                40+ INTERNATIONAL BRANDS
            </div>

            {/* Main Nav */}
            <div className="mx-auto px-3 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-xl sm:text-2xl font-bold uppercase tracking-tight">Unboxing</Link>
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

                        {/* Icons - Visible on all screens */}
                        <div className="flex items-center space-x-4 lg:space-x-6">
                            <Link to="/login" className="text-gray-700 hover:text-black transition-colors">
                                <RiAccountCircleLine className="w-6 h-6 cursor-pointer" />
                            </Link>
                            <Link to="/cart" className="text-gray-700 hover:text-black transition-colors">
                                <HiShoppingBag className="w-6 h-6 cursor-pointer" />
                            </Link>
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
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="sm:hidden fixed w-full bg-white left-0 top-[60px] sm:top-[68px] px-4 pb-4 shadow-lg animate-slideDown overflow-y-auto max-h-[calc(100vh-60px)]">
                        {/* Mobile Search */}
                        <div className="pt-4">
                            <div className="flex items-center space-x-2 border border-black/20 rounded-full px-4 py-2">
                                <CiSearch className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search entire site"
                                    className="bg-transparent w-full focus:outline-none placeholder:text-gray-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Mobile Navigation Links */}
                        <ul className="space-y-1 py-4 border-t border-gray-200 mt-4">
                            {navItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className="block text-gray-700 hover:text-black py-2.5 px-4 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Mobile Icons */}
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-around px-4">
                                <Link to="/login" className="flex flex-col items-center text-gray-700 hover:text-black transition-colors">
                                    <RiAccountCircleLine className="w-6 h-6" />
                                    <span className="text-xs mt-1">Account</span>
                                </Link>
                                <Link to="/wishlist" className="flex flex-col items-center text-gray-700 hover:text-black transition-colors">
                                    <CiHeart className="w-6 h-6" />
                                    <span className="text-xs mt-1">Wishlist</span>
                                </Link>
                                <Link to="/cart" className="flex flex-col items-center text-gray-700 hover:text-black transition-colors">
                                    <HiShoppingBag className="w-6 h-6" />
                                    <span className="text-xs mt-1">Cart</span>
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
