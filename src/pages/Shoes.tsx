import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Form from "./form";
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
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export const shoeFilters = {
    shoeTypes: ['Casual', 'Formal', 'Sports', 'Sneakers', 'Boots', 'Sandals'],
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'Brown', 'White', 'Blue', 'Red', 'Grey'],
    materials: ['Leather', 'Canvas', 'Suede', 'Synthetic', 'Mesh'],
    brands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Converse'],
    priceRanges: [
        { min: 0, max: 2000 },
        { min: 2000, max: 5000 },
        { min: 5000, max: 10000 },
        { min: 10000, max: 100000 }
    ]
};

const Shoes = () => {
    const { addToCart } = useCart();
    const [sortOption, setSortOption] = useState('bestsellers');
    const [filters, setFilters] = useState({
        shoeTypes: [],
        brands: [],
        sizes: [],
        colors: [],
        materials: []
    });
    const [wishlist, setWishlist] = useState([]);
    const [selectedShoe, setSelectedShoe] = useState(null);
    const [cart, setCart] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [allShoes, setAllShoes] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 100000]);

    useEffect(() => {
        const fetchShoes = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "Shoes"));
                const shoes = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    collectionName: "Shoes",
                    rating: Math.floor(Math.random() * 5) + 1,
                    reviews: Math.floor(Math.random() * 100),
                    ...doc.data(),
                    Image: doc.data().images?.[0] || '',
                }));
                setAllShoes(shoes);
            } catch (error) {
                console.error("Error fetching shoes:", error);
                setAllShoes([]);
            }
        };

        fetchShoes();
    }, []);

    useEffect(() => {
        if (isFiltersOpen || isSortOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isFiltersOpen, isSortOpen]);

    const toggleWishlist = (shoeId) => {
        setWishlist(prev =>
            prev.includes(shoeId)
                ? prev.filter(id => id !== shoeId)
                : [...prev, shoeId]
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
            category: 'Shoes',
            size: item.Size,
            color: item.Color
        });
    };

    const renderRating = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`text-${i < rating ? 'yellow-400' : 'gray-500'}`}>&#9733;</span>
        ));
    };

    const filterShoes = (shoes) => {
        return shoes.filter(shoe => {
            // Category filtering
            if (selectedCategory !== 'all') {
                switch (selectedCategory) {
                    case 'men':
                        if (shoe.Gender !== 'Male') return false;
                        break;
                    case 'women':
                        if (shoe.Gender !== 'Female') return false;
                        break;
                    case 'casual':
                        if (shoe.ShoeType !== 'Casual') return false;
                        break;
                    case 'formal':
                        if (shoe.ShoeType !== 'Formal') return false;
                        break;
                    case 'sports':
                        if (shoe.ShoeType !== 'Sports') return false;
                        break;
                }
            }

            // Brand filtering
            if (filters.brands.length > 0 && !filters.brands.includes(shoe.Company)) {
                return false;
            }

            // Price range filtering
            const shoePrice = Number(shoe.Price) || 0;
            if (shoePrice < priceRange[0] || shoePrice > priceRange[1]) {
                return false;
            }

            // Size filtering
            if (filters.sizes.length > 0 && !filters.sizes.includes(shoe.ShoeSize)) {
                return false;
            }

            // Color filtering
            if (filters.colors.length > 0 && !filters.colors.includes(shoe.Color)) {
                return false;
            }

            return true;
        });
    };

    const sortShoes = (shoes) => {
        switch (sortOption) {
            case 'price-low-high':
                return [...shoes].sort((a, b) => (Number(a.Price) - Number(b.Price)));
            case 'price-high-low':
                return [...shoes].sort((a, b) => (Number(b.Price) - Number(a.Price)));
            case 'newest':
                return [...shoes].sort((a, b) => new Date(b.DateAdded) - new Date(a.DateAdded));
            case 'rating':
                return [...shoes].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            default:
                return [...shoes];
        }
    };

    const filteredShoes = sortShoes(filterShoes(allShoes));

    const BreadcrumbAndSort = () => (
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-12 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-sm text-gray-600">
                    <Link to="/" className="hover:text-gray-900">HOME</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">ALL SHOES</span>
                </div>

                <div className="hidden lg:flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                    <div className="text-sm text-gray-600">
                        ITEMS {filteredShoes.length} OF {allShoes.length}
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
                        All Shoes
                    </h2>
                    <div className="flex justify-center gap-6 mt-4 flex-wrap">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === 'all' ? 'font-medium border-b-2 border-gray-700' : 'text-gray-600'
                                }`}
                        >
                            ALL SHOES
                        </button>
                        <button
                            onClick={() => setSelectedCategory('men')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === 'men' ? 'font-medium border-b-2 border-gray-700' : 'text-gray-600'
                                }`}
                        >
                            MEN
                        </button>
                        <button
                            onClick={() => setSelectedCategory('women')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === 'women' ? 'font-medium border-b-2 border-gray-700' : 'text-gray-600'
                                }`}
                        >
                            WOMEN
                        </button>
                        <button
                            onClick={() => setSelectedCategory('casual')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === 'casual' ? 'font-medium border-b-2 border-gray-700' : 'text-gray-600'
                                }`}
                        >
                            CASUAL
                        </button>
                        <button
                            onClick={() => setSelectedCategory('formal')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === 'formal' ? 'font-medium border-b-2 border-gray-700' : 'text-gray-600'
                                }`}
                        >
                            FORMAL
                        </button>
                        <button
                            onClick={() => setSelectedCategory('sports')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === 'sports' ? 'font-medium border-b-2 border-gray-700' : 'text-gray-600'
                                }`}
                        >
                            SPORTS
                        </button>
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
                            category="shoes"
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
                            {filteredShoes.map((shoe) => (
                                <ProductCard
                                    key={`${shoe.collectionName}-${shoe.id}`}
                                    item={shoe}
                                    isWishlisted={wishlist.includes(shoe.id)}
                                    onToggleWishlist={toggleWishlist}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                        {filteredShoes.length === 0 && (
                            <div className="col-span-full text-center py-12 flex flex-col items-center justify-center">
                                <h3 className="text-lg font-medium text-gray-700">No shoes match your filters</h3>
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
                            <h2 className="text-xl font-semibold text-gray-800">Shoe Filters</h2>
                            <button
                                onClick={() => setIsFiltersOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <FiltersSidebar
                                category="shoes"
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

export default Shoes;
