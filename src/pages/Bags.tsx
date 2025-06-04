import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Link } from "react-router-dom";
import FiltersSidebar from "../components/FiltersSidebar";
import {
    HeartIcon,
    ShoppingBagIcon,
    XMarkIcon,
    FunnelIcon,
    ArrowsUpDownIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

export const electronicsFilters = {
    types: ['Mobile', 'Headphones', 'Chargers', 'Accessories'],
    brands: ['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Lenovo'],
    features: ['Wireless', 'Bluetooth', 'Touch Screen', 'Water Resistant', '5G'],
    storage: ['64GB', '128GB', '256GB', '512GB', '1TB'],
    priceRanges: [
        { min: 0, max: 10000 },
        { min: 10000, max: 30000 },
        { min: 30000, max: 50000 },
        { min: 50000, max: 100000 }
    ]
};

// Update the filters object for bags
export const bagsFilters = {
    types: ['Backpack', 'Handbag', 'Tote', 'Messenger', 'Duffel', 'Clutch'],
    brands: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'The North Face', 'Samsonite'],
    colors: ['Black', 'Brown', 'Blue', 'Grey', 'Red', 'Green'],
    materials: ['Leather', 'Canvas', 'Nylon', 'Polyester', 'Cotton'],
    priceRanges: [
        { min: 0, max: 1000 },
        { min: 1000, max: 3000 },
        { min: 3000, max: 5000 },
        { min: 5000, max: 10000 }
    ]
};

const Electronics = () => {
    const [sortOption, setSortOption] = useState('bestsellers');
    const [filters, setFilters] = useState({
        types: [],
        brands: [],
        sizes: [],
        colors: [],
        materials: []
    });
    const [wishlist, setWishlist] = useState([]);
    const [selectedFashion, setSelectedFashion] = useState(null);
    const [cart, setCart] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [allFashion, setAllFashion] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 100000]);

    useEffect(() => {
        const fetchElectronics = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "Electronics"));
                const electronicsItems = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    collectionName: "Electronics",
                    rating: Math.floor(Math.random() * 5) + 1,
                    reviews: Math.floor(Math.random() * 100),
                    ...doc.data(),
                    Image: doc.data().images?.[0] || '',
                }));
                setAllFashion(electronicsItems); // Keep the state variable name for consistency
            } catch (error) {
                console.error("Error fetching electronics items:", error);
                setAllFashion([]);
            }
        };

        fetchElectronics();
    }, []);

    useEffect(() => {
        if (isFiltersOpen || isSortOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isFiltersOpen, isSortOpen]);

    const toggleWishlist = (fashionId) => {
        setWishlist(prev =>
            prev.includes(fashionId)
                ? prev.filter(id => id !== fashionId)
                : [...prev, fashionId]
        );
    };

    const addToCart = (fashion) => {
        setCart(prev => [...prev, { ...fashion, quantity: 1 }]);
    };

    const renderRating = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`text-${i < rating ? 'yellow-400' : 'gray-500'}`}>&#9733;</span>
        ));
    };

    const filterElectronics = (items) => {
        return items.filter(item => {
            // Category filtering
            if (selectedCategory !== 'all') {
                switch (selectedCategory) {
                    case 'mobile':
                        if (item.Type !== 'Mobile') return false;
                        break;
                    case 'headphones':
                        if (item.Type !== 'Headphone') return false;
                        break;
                    case 'chargers':
                        if (item.Type !== 'Charger') return false;
                        break;
                    case 'accessories':
                        if (item.Type !== 'Accessory') return false;
                        break;
                }
            }

            // Brand filtering
            if (filters.brands.length > 0 && !filters.brands.includes(item.Brand)) {
                return false;
            }

            // Price filtering
            const itemPrice = Number(item.Price) || 0;
            if (itemPrice < priceRange[0] || itemPrice > priceRange[1]) {
                return false;
            }

            // Size filtering
            if (filters.sizes.length > 0 && !filters.sizes.includes(item.Size)) {
                return false;
            }

            // Color filtering
            if (filters.colors.length > 0 && !filters.colors.includes(item.Color)) {
                return false;
            }

            return true;
        });
    };

    const sortFashion = (items) => {
        switch (sortOption) {
            case 'price-low-high':
                return [...items].sort((a, b) => (Number(a.Price) - Number(b.Price)));
            case 'price-high-low':
                return [...items].sort((a, b) => (Number(b.Price) - Number(a.Price)));
            case 'newest':
                return [...items].sort((a, b) => new Date(b.DateAdded) - new Date(a.DateAdded));
            case 'rating':
                return [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            default:
                return [...items];
        }
    };

    const filteredFashion = sortFashion(filterElectronics(allFashion));

    const BreadcrumbAndSort = () => (
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-12 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-sm text-gray-600">
                    <Link to="/" className="hover:text-gray-900">HOME</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">ALL ELECTRONICS</span>
                </div>

                <div className="hidden lg:flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                    <div className="text-sm text-gray-600">
                        ITEMS {filteredFashion.length} OF {allFashion.length}
                    </div>

                    <div className="relative">
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="bestsellers">SORT BY BESTSELLERS</option>
                            <option value="price-low-high">Price: Low to High</option>
                            <option value="price-high-low">Price: High to Low</option>
                            <option value="newest">Newest Arrivals</option>
                            <option value="rating">Customer Rating</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen text-gray-900">
            {/* Add this mobile filter/sort bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
                <div className="flex justify-between p-4 gap-2">
                    <button
                        onClick={() => setIsFiltersOpen(true)}
                        className="flex-1 py-3 px-4 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                        <FunnelIcon className="w-5 h-5 text-gray-700" />
                        <span className="text-gray-700 font-medium">Filters</span>
                    </button>
                    <button
                        onClick={() => setIsSortOpen(true)}
                        className="flex-1 py-3 px-4 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                        <ArrowsUpDownIcon className="w-5 h-5 text-gray-700" />
                        <span className="text-gray-700 font-medium">Sort</span>
                    </button>
                </div>
            </div>

            {/* Category Selection */}
            <div className="text-center py-8">
                <div className="inline-block">
                    <h2 className="text-3xl font-light uppercase tracking-widest text-gray-700">
                        Electronics Collection
                    </h2>
                    <div className="flex justify-center gap-6 mt-4 flex-wrap">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === 'all' ? 'font-medium border-b-2 border-gray-700' : 'text-gray-600'
                                }`}
                        >
                            ALL ELECTRONICS
                        </button>
                        {['mobile', 'headphones', 'chargers', 'accessories'].map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === category ? 'font-medium border-b-2 border-gray-700' : 'text-gray-600'
                                    }`}
                            >
                                {category.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <hr className="border-gray-400 mt-3 mx-auto w-1/2" />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-12 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
                    {/* Filters */}
                    <div className="hidden lg:block">
                        <FiltersSidebar
                            category="electronics"
                            selectedFilters={filters}
                            setSelectedFilters={setFilters}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <BreadcrumbAndSort />
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredFashion.map((item) => (
                                <Link
                                    to={`/details/${item.collectionName}/${item.id}`}
                                    key={`${item.collectionName}-${item.id}`}
                                >
                                    <div className="group relative bg-gray-100 rounded-lg overflow-hidden border border-gray-300 hover:border-gray-400 transition-all duration-300 h-full flex flex-col">
                                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleWishlist(item.id);
                                                }}
                                                className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 backdrop-blur-sm"
                                            >
                                                {wishlist.includes(item.id) ? (
                                                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                                                ) : (
                                                    <HeartIcon className="w-5 h-5 text-gray-800" />
                                                )}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addToCart(item);
                                                }}
                                                className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 backdrop-blur-sm"
                                            >
                                                <ShoppingBagIcon className="w-5 h-5 text-gray-800" />
                                            </button>
                                        </div>

                                        <div className="aspect-square overflow-hidden relative">
                                            <img
                                                src={item.Image || item.images?.[0]}
                                                alt={item.Brand}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>

                                        <div className="p-4 space-y-2 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start flex-wrap gap-2">
                                                <h3 className="text-xl font-medium uppercase tracking-wide text-gray-900 line-clamp-2 min-h-[3.5rem]">
                                                    {item.Brand}
                                                </h3>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    {renderRating(item.rating || 0)}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-lg font-light">Rs. {item.Price}</p>
                                            <p className="text-gray-500 text-sm line-clamp-2 flex-1 min-h-[2.5rem]">{item.Description}</p>
                                            <div className="flex gap-2 mt-auto pt-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        addToCart(item);
                                                    }}
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
                        {filteredFashion.length === 0 && (
                            <div className="col-span-full text-center py-12 flex flex-col items-center justify-center">
                                <h3 className="text-lg font-medium text-gray-700">No fashion items match your filters</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your filter criteria</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isFiltersOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-white">
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Fashion Filters</h2>
                            <button
                                onClick={() => setIsFiltersOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <FiltersSidebar
                                category="electronics"
                                selectedFilters={filters}
                                setSelectedFilters={setFilters}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                isMobile={true}
                            />
                        </div>
                    </div>
                </div>
            )}
            {/* Mobile Sort Overlay */}
            {isSortOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-white">
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Sort By</h2>
                            <button
                                onClick={() => setIsSortOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                {[
                                    { value: 'bestsellers', label: 'Bestsellers' },
                                    { value: 'price-low-high', label: 'Price: Low to High' },
                                    { value: 'price-high-low', label: 'Price: High to Low' },
                                    { value: 'newest', label: 'Newest Arrivals' },
                                    { value: 'rating', label: 'Customer Rating' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSortOption(option.value);
                                            setIsSortOpen(false);
                                        }}
                                        className={`w-full text-left p-3 rounded-lg ${sortOption === option.value
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <button
                                onClick={() => setIsSortOpen(false)}
                                className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Apply Sorting
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

import { useCart } from '../context/CartContext';

const Bags = () => {
    const { addToCart } = useCart();
    const [sortOption, setSortOption] = useState('bestsellers');
    const [filters, setFilters] = useState({
        types: [],
        brands: [],
        sizes: [],
        colors: [],
        materials: []
    });
    const [wishlist, setWishlist] = useState([]);
    const [selectedFashion, setSelectedFashion] = useState(null);
    const [cart, setCart] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [allFashion, setAllFashion] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 10000]);

    useEffect(() => {
        const fetchBags = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "Bags"));
                const bagsItems = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    collectionName: "Bags",
                    rating: Math.floor(Math.random() * 5) + 1,
                    reviews: Math.floor(Math.random() * 100),
                    ...doc.data(),
                    Image: doc.data().images?.[0] || '',
                }));
                setAllFashion(bagsItems);
            } catch (error) {
                console.error("Error fetching bags:", error);
                setAllFashion([]);
            }
        };

        fetchBags();
    }, []);

    useEffect(() => {
        if (isFiltersOpen || isSortOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isFiltersOpen, isSortOpen]);

    const toggleWishlist = (fashionId) => {
        setWishlist(prev =>
            prev.includes(fashionId)
                ? prev.filter(id => id !== fashionId)
                : [...prev, fashionId]
        );
    };

    const handleAddToCart = (e, item) => {
        if (e) e.preventDefault();
        addToCart({
            id: item.id,
            name: item.Brand || item.Name,
            price: parseFloat(item.Price),
            image: item.Image || item.images?.[0],
            quantity: 1,
            category: 'Bags',
            color: item.Color,
            material: item.Material
        });
    };

    const renderRating = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`text-${i < rating ? 'yellow-400' : 'gray-500'}`}>&#9733;</span>
        ));
    };

    const filterBags = (items) => {
        return items.filter(item => {
            // Category filtering
            if (selectedCategory !== 'all') {
                switch (selectedCategory) {
                    case 'backpack':
                        if (item.Type !== 'Backpack') return false;
                        break;
                    case 'handbag':
                        if (item.Type !== 'Handbag') return false;
                        break;
                    case 'tote-travel':
                        if (!['Tote', 'Travel'].includes(item.Type)) return false;
                        break;
                }
            }

            // Brand filtering
            if (filters.brands.length > 0 && !filters.brands.includes(item.Brand)) {
                return false;
            }

            // Price filtering
            const itemPrice = Number(item.Price) || 0;
            if (itemPrice < priceRange[0] || itemPrice > priceRange[1]) {
                return false;
            }

            // Color filtering
            if (filters.colors.length > 0 && !filters.colors.includes(item.Color)) {
                return false;
            }

            // Material filtering
            if (filters.materials.length > 0 && !filters.materials.includes(item.Material)) {
                return false;
            }

            return true;
        });
    };

    const sortFashion = (items) => {
        switch (sortOption) {
            case 'price-low-high':
                return [...items].sort((a, b) => (Number(a.Price) - Number(b.Price)));
            case 'price-high-low':
                return [...items].sort((a, b) => (Number(b.Price) - Number(a.Price)));
            case 'newest':
                return [...items].sort((a, b) => new Date(b.DateAdded) - new Date(a.DateAdded));
            case 'rating':
                return [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            default:
                return [...items];
        }
    };

    const filteredFashion = sortFashion(filterBags(allFashion));

    const BreadcrumbAndSort = () => (
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-12 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-sm text-gray-600">
                    <Link to="/" className="hover:text-gray-900">HOME</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">ALL BAGS</span>
                </div>

                <div className="hidden lg:flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                    <div className="text-sm text-gray-600">
                        ITEMS {filteredFashion.length} OF {allFashion.length}
                    </div>

                    <div className="relative">
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="bestsellers">SORT BY BESTSELLERS</option>
                            <option value="price-low-high">Price: Low to High</option>
                            <option value="price-high-low">Price: High to Low</option>
                            <option value="newest">Newest Arrivals</option>
                            <option value="rating">Customer Rating</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen text-gray-900">
            {/* Add this mobile filter/sort bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
                <div className="flex justify-between p-4 gap-2">
                    <button
                        onClick={() => setIsFiltersOpen(true)}
                        className="flex-1 py-3 px-4 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                        <FunnelIcon className="w-5 h-5 text-gray-700" />
                        <span className="text-gray-700 font-medium">Filters</span>
                    </button>
                    <button
                        onClick={() => setIsSortOpen(true)}
                        className="flex-1 py-3 px-4 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                        <ArrowsUpDownIcon className="w-5 h-5 text-gray-700" />
                        <span className="text-gray-700 font-medium">Sort</span>
                    </button>
                </div>
            </div>

            {/* Category Selection */}
            <div className="text-center py-8">
                <div className="inline-block">
                    <h2 className="text-3xl font-light uppercase tracking-widest text-gray-700">
                        Bags Collection
                    </h2>
                    <div className="flex justify-center gap-6 mt-4 flex-wrap">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors 
                    ${selectedCategory === 'all' ? 'font-medium border-b-2 border-gray-700' : 'text-gray-600'}`}
                        >
                            ALL BAGS
                        </button>
                        {[
                            { id: 'backpack', label: 'BACKPACK' },
                            { id: 'handbag', label: 'HANDBAG' },
                            { id: 'tote-travel', label: 'TOTE AND TRAVEL' }
                        ].map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`text-sm uppercase hover:text-gray-900 transition-colors 
                        ${selectedCategory === category.id ? 'font-medium border-b-2 border-gray-700' : 'text-gray-600'}`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                    <hr className="border-gray-400 mt-3 mx-auto w-1/2" />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-12 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
                    {/* Filters */}
                    <div className="hidden lg:block">
                        <FiltersSidebar
                            category="bags"
                            selectedFilters={filters}
                            setSelectedFilters={setFilters}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <BreadcrumbAndSort />
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredFashion.map((item) => (
                                <Link
                                    to={`/details/${item.collectionName}/${item.id}`}
                                    key={`${item.collectionName}-${item.id}`}
                                    className="block h-full"
                                >
                                    <div className="group relative bg-gray-100 rounded-lg overflow-hidden border border-gray-300 hover:border-gray-400 transition-all duration-300 h-full flex flex-col">
                                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleWishlist(item.id);
                                                }}
                                                className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 backdrop-blur-sm"
                                            >
                                                {wishlist.includes(item.id) ? (
                                                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                                                ) : (
                                                    <HeartIcon className="w-5 h-5 text-gray-800" />
                                                )}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleAddToCart(e, item);
                                                }}
                                                className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 backdrop-blur-sm"
                                            >
                                                <ShoppingBagIcon className="w-5 h-5 text-gray-800" />
                                            </button>
                                        </div>

                                        <div className="aspect-square overflow-hidden relative">
                                            <img
                                                src={item.Image || item.images?.[0]}
                                                alt={item.Company || item.Brand}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>

                                        <div className="p-4 space-y-2 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start flex-wrap gap-2">
                                                <h3 className="text-xl font-medium uppercase tracking-wide text-gray-900 line-clamp-2 min-h-[3.5rem]">
                                                    {item.Company || item.Brand}
                                                </h3>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    {renderRating(item.rating || 0)}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-lg font-light">Rs. {item.Price}</p>
                                            <p className="text-gray-500 text-sm line-clamp-2 flex-1 min-h-[2.5rem]">{item.Description}</p>
                                            <div className="flex gap-2 mt-auto pt-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleAddToCart(e, item);
                                                    }}
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
                        {filteredFashion.length === 0 && (
                            <div className="col-span-full text-center py-12 flex flex-col items-center justify-center">
                                <h3 className="text-lg font-medium text-gray-700">No fashion items match your filters</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your filter criteria</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isFiltersOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-white">
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Fashion Filters</h2>
                            <button
                                onClick={() => setIsFiltersOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <FiltersSidebar
                                category="bags"
                                selectedFilters={filters}
                                setSelectedFilters={setFilters}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                isMobile={true}
                            />
                        </div>
                    </div>
                </div>
            )}
            {/* Mobile Sort Overlay */}
            {isSortOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-white">
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Sort By</h2>
                            <button
                                onClick={() => setIsSortOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                {[
                                    { value: 'bestsellers', label: 'Bestsellers' },
                                    { value: 'price-low-high', label: 'Price: Low to High' },
                                    { value: 'price-high-low', label: 'Price: High to Low' },
                                    { value: 'newest', label: 'Newest Arrivals' },
                                    { value: 'rating', label: 'Customer Rating' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSortOption(option.value);
                                            setIsSortOpen(false);
                                        }}
                                        className={`w-full text-left p-3 rounded-lg ${sortOption === option.value
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <button
                                onClick={() => setIsSortOpen(false)}
                                className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Apply Sorting
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bags;
