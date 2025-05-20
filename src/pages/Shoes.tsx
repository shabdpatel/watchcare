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

export const shoeFilters = {
    shoeTypes: ['Casual', 'Formal', 'Sports', 'Sneakers', 'Boots', 'Sandals'],
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'Brown', 'White', 'Blue', 'Red', 'Grey'],
    materials: ['Leather', 'Canvas', 'Suede', 'Synthetic', 'Mesh'],
    brands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Converse']
};

const Shoes = () => {
    const [sortOption, setSortOption] = useState('bestsellers');
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedShoeTypes, setSelectedShoeTypes] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [selectedShoe, setSelectedShoe] = useState(null);
    const [cart, setCart] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [allShoes, setAllShoes] = useState([]);

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

    const toggleWishlist = (shoeId) => {
        setWishlist(prev =>
            prev.includes(shoeId)
                ? prev.filter(id => id !== shoeId)
                : [...prev, shoeId]
        );
    };

    const addToCart = (shoe) => {
        setCart(prev => [...prev, { ...shoe, quantity: 1 }]);
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
            if (selectedBrands.length > 0 && !selectedBrands.includes(shoe.Company)) {
                return false;
            }

            // Price range filtering
            const shoePrice = Number(shoe.Price) || 0;
            if (shoePrice < priceRange[0] || shoePrice > priceRange[1]) {
                return false;
            }

            // Size filtering
            if (selectedSizes.length > 0 && !selectedSizes.includes(shoe.ShoeSize)) {
                return false;
            }

            // Color filtering
            if (selectedColors.length > 0 && !selectedColors.includes(shoe.Color)) {
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

    return (
        <div className="bg-gray-100 min-h-screen text-gray-900">
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
                            selectedBrands={selectedBrands}
                            setSelectedBrands={setSelectedBrands}
                            selectedShoeTypes={selectedShoeTypes}
                            setSelectedShoeTypes={setSelectedShoeTypes}
                            selectedSizes={selectedSizes}
                            setSelectedSizes={setSelectedSizes}
                            selectedColors={selectedColors}
                            setSelectedColors={setSelectedColors}
                            selectedMaterials={selectedMaterials}
                            setSelectedMaterials={setSelectedMaterials}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredShoes.map((shoe) => (
                                <Link
                                    to={`/details/${shoe.collectionName}/${shoe.id}`}
                                    key={shoe.id}
                                    className="group"
                                >
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <div className="relative aspect-square">
                                            <img
                                                src={shoe.Image}
                                                alt={shoe.Company}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleWishlist(shoe.id);
                                                    }}
                                                    className="p-2 rounded-full bg-white/80 hover:bg-white"
                                                >
                                                    {wishlist.includes(shoe.id) ? (
                                                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                                                    ) : (
                                                        <HeartIcon className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-medium">{shoe.Company}</h3>
                                            <p className="text-gray-600">₹{shoe.Price}</p>
                                            <div className="flex items-center mt-2">
                                                {renderRating(shoe.rating)}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addToCart(shoe);
                                                }}
                                                className="mt-3 w-full py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shoes;
