import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Form from "./form";
import { Link, useLocation } from "react-router-dom";
import FiltersSidebar from "../components/FiltersSidebar";
import ProductCard from "../components/ProductCard";
import {
    XMarkIcon,
    FunnelIcon,
    ArrowsUpDownIcon,
    ShoppingBagIcon
} from "@heroicons/react/24/outline";
import { useCart } from '../context/CartContext';

// Types for stronger safety without changing behavior
interface Watch {
    id: string;
    collectionName: string;
    Price: number; // normalized to number when fetched
    Company?: string;
    DateAdded?: string;
    rating?: number;
    reviews?: number;
    images?: string[];
    Image?: string;
    salesCount?: number;
    Description?: string;
    Warranty?: { Status?: string; Type?: string; Duration?: string };
    Gender?: string;
    email?: string;
    Seller?: { Email?: string };
    CollectionType?: string;
    DialColor?: string;
    DialShape?: string;
    StrapColor?: string;
    StrapMaterial?: string;
    Movement?: string;
    Features?: string[];
    Collection?: string;
    Size?: string;
    Color?: string;
    Brand?: string;
    Name?: string;
}

type FiltersState = {
    [key: string]: string[];
    brands: string[];
    dialColors: string[];
    dialShapes: string[];
    strapColors: string[];
    strapMaterials: string[];
    movements: string[];
    features: string[];
    collections: string[];
};

const AllWatches = () => {
    const location = useLocation();

    // Update state declarations
    const [filters, setFilters] = useState<FiltersState>({
        brands: [],
        dialColors: [],
        dialShapes: [],
        strapColors: [],
        strapMaterials: [],
        movements: [],
        features: [],
        collections: []
    });
    const [sortOption, setSortOption] = useState<string>('bestsellers');
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [selectedService] = useState<string | null>(null);
    const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
    const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [allWatches, setAllWatches] = useState<Watch[]>([]);
    const [priceRange, setPriceRange] = useState<number[]>([0, 1000000]);
    const { addToCart } = useCart();

    // Check URL parameters on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam === 'vintage') {
            setSelectedCategory('vintage');
        } else if (categoryParam === 'warranty') {
            setSelectedCategory('warranty');
        } else if (categoryParam === 'project') {
            setSelectedCategory('project');
        }
    }, [location]);

    useEffect(() => {
        const fetchWatches = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "Watches"));
                const watches: Watch[] = querySnapshot.docs.map((doc) => {
                    const data = doc.data() as Record<string, unknown>;
                    const rawWarranty = (data as Record<string, unknown>)['Warranty'] as unknown;
                    const normalizedWarranty = typeof rawWarranty === 'boolean'
                        ? (rawWarranty ? { Status: 'Active' } : { Status: 'Inactive' })
                        : (rawWarranty as { Status?: string; Type?: string; Duration?: string } | undefined);

                    return {
                        id: doc.id,
                        collectionName: "Watches",
                        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
                        reviews: Math.floor(Math.random() * 100),
                        ...(data as object),
                        Price: Number((data as Record<string, unknown>)['Price'] as string | number) || 0,
                        Image: ((data as Record<string, unknown>)['images'] as string[] | undefined)?.[0]
                            || ((data as Record<string, unknown>)['Image'] as string | undefined)
                            || '',
                        Warranty: normalizedWarranty,
                    } as Watch;
                });
                setAllWatches(watches);
            } catch (error) {
                console.error("Error fetching watches:", error);
                setAllWatches([]);
            }
        };

        fetchWatches();
    }, []);

    useEffect(() => {
        if (isFiltersOpen || isSortOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isFiltersOpen, isSortOpen]);



    const toggleWishlist = (watchId: string) => {
        setWishlist(prev =>
            prev.includes(watchId)
                ? prev.filter(id => id !== watchId)
                : [...prev, watchId]
        );
    };

    const handleAddToCart = (e: React.MouseEvent | null, item: Watch) => {
        if (e) e.preventDefault();
        addToCart({
            id: item.id,
            name: (item.Brand || item.Name || 'Watch'),
            price: typeof item.Price === 'string' ? parseFloat(item.Price) : item.Price,
            image: item.Image || item.images?.[0] || '',
            quantity: 1,
            category: 'Watches',  // Explicitly set category
            size: item.Size,
            color: item.Color
        });
    };

    const renderRating = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`text-${i < rating ? 'yellow-400' : 'gray-500'}`}>&#9733;</span>
        ));
    };

    const sortWatches = (watches: Watch[]) => {
        switch (sortOption) {
            case 'price-low-high':
                return [...watches].sort((a, b) => (Number(a.Price) - Number(b.Price)));
            case 'price-high-low':
                return [...watches].sort((a, b) => (Number(b.Price) - Number(a.Price)));
            case 'newest':
                return [...watches].sort((a, b) => new Date(b.DateAdded || 0).getTime() - new Date(a.DateAdded || 0).getTime());
            case 'rating':
                return [...watches].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'bestsellers':
            default:
                // Assuming you have a salesCount property
                return [...watches].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        }
    };

    // Update the filter function
    const filterWatches = (watches: Watch[]) => {
        return watches.filter(watch => {
            // Collection Type filtering
            if (selectedCategory === 'vintage' && watch.CollectionType !== 'Vintage Collection') {
                return false;
            }

            // Warranty filtering
            if (selectedCategory === 'warranty') {
                const hasWarranty = watch.Warranty?.Status === 'Active';
                if (!hasWarranty) {
                    return false;
                }
            }

            // Project watches filtering (by specific email addresses)
            if (selectedCategory === 'project') {
                // Only show watches uploaded by this single project email
                const allowedEmail = 'prameetsw@gmail.com';
                // Support both top-level email and nested Seller.Email (legacy docs)
                const watchEmail = (watch.email || watch.Seller?.Email || '').toLowerCase();
                if (watchEmail !== allowedEmail.toLowerCase()) {
                    return false;
                }
            }

            // Gender filtering
            if (selectedCategory === 'men' && watch.Gender !== 'Men') {
                return false;
            }

            if (selectedCategory === 'women' && watch.Gender !== 'Women') {
                return false;
            }

            // Brand filtering
            if (filters.brands.length > 0 && !filters.brands.includes(watch.Company || '')) {
                return false;
            }

            // Price range filtering
            const watchPrice = Number(watch.Price) || 0;
            if (watchPrice < priceRange[0] || watchPrice > priceRange[1]) {
                return false;
            }

            // Dial Color filtering
            if (filters.dialColors.length > 0 && !filters.dialColors.includes(watch.DialColor || '')) {
                return false;
            }

            // Dial Shape filtering
            if (filters.dialShapes.length > 0 && !filters.dialShapes.includes(watch.DialShape || '')) {
                return false;
            }

            // Strap Color filtering
            if (filters.strapColors.length > 0 && !filters.strapColors.includes(watch.StrapColor || '')) {
                return false;
            }

            // Strap Material filtering
            if (filters.strapMaterials.length > 0 && !filters.strapMaterials.includes(watch.StrapMaterial || '')) {
                return false;
            }

            // Movement filtering
            if (filters.movements.length > 0 && !filters.movements.includes(watch.Movement || '')) {
                return false;
            }

            // Features filtering
            if (filters.features.length > 0 && !filters.features.some(feature => watch.Features?.includes(feature))) {
                return false;
            }

            // Collection filtering
            if (filters.collections.length > 0 && !filters.collections.includes(watch.Collection || '')) {
                return false;
            }

            return true;
        });
    };

    // Apply the filter to your watches
    const filteredWatches: Watch[] = sortWatches(filterWatches(allWatches));
    const BreadcrumbAndSort = () => (
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-12 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-sm text-gray-600">
                    <Link to="/" className="hover:text-gray-900">HOME</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">ALL WATCHES</span>
                </div>

                <div className="hidden lg:flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                    <div className="text-sm text-gray-600">
                        ITEMS {filteredWatches.length} OF {allWatches.length}
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



            {/* Updated Mobile Filters Overlay */}
            {isFiltersOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-white">
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Watch Filters</h2>
                            <button
                                onClick={() => setIsFiltersOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <FiltersSidebar
                                category="watches"
                                selectedFilters={filters}
                                setSelectedFilters={setFilters}
                                priceRange={priceRange}
                                setPriceRange={(range: number[]) => setPriceRange([range[0] ?? 0, range[1] ?? 0])}
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
                                className="w-full py-3 bg-gray-400 hover:bg-gray-300 rounded-lg transition-colors"
                            >
                                Apply Sorting
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* All Watches Section */}
            <div className="text-center py-8">
                <div className="inline-block">
                    <h2 className="text-3xl font-light uppercase tracking-widest text-gray-700">
                        All Watches
                    </h2>
                    <div className="flex justify-center gap-6 mt-4 flex-wrap">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === 'all'
                                ? 'font-medium border-b-1 border-gray-700 text-gray-900'
                                : 'text-gray-600'
                                }`}
                        >
                            ALL WATCHES
                        </button>
                        <button
                            onClick={() => setSelectedCategory('men')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === 'men'
                                ? 'font-medium border-b-1 border-gray-700 text-gray-900'
                                : 'text-gray-600'
                                }`}
                        >
                            MEN
                        </button>
                        <button
                            onClick={() => setSelectedCategory('women')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === 'women'
                                ? 'font-medium border-b-1 border-gray-700 text-gray-900'
                                : 'text-gray-600'
                                }`}
                        >
                            WOMEN
                        </button>
                        <button
                            onClick={() => setSelectedCategory('vintage')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === 'vintage'
                                ? 'font-medium border-b-1 border-gray-700 text-gray-900'
                                : 'text-gray-600'
                                }`}
                        >
                            VINTAGE COLLECTION
                        </button>
                        <button
                            onClick={() => setSelectedCategory('warranty')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === 'warranty'
                                ? 'font-medium border-b-1 border-gray-700 text-gray-900'
                                : 'text-gray-600'
                                }`}
                        >
                            UNDER WARRANTY
                        </button>
                        <button
                            onClick={() => setSelectedCategory('project')}
                            className={`text-sm uppercase hover:text-gray-900 transition-colors ${selectedCategory === 'project'
                                ? 'font-medium border-b-1 border-gray-700 text-gray-900'
                                : 'text-gray-600'
                                }`}
                        >
                            PROJECT WATCHES
                        </button>
                    </div>
                    <hr className="border-gray-400 mt-3 mx-auto w-1/2" />
                </div>

            </div>

            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-12 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
                    {/* Desktop Filters - Add hidden lg:block wrapper */}
                    <div className="hidden lg:block">
                        <FiltersSidebar
                            category="watches"
                            selectedFilters={filters}
                            setSelectedFilters={setFilters}
                            priceRange={priceRange}
                            setPriceRange={(range: number[]) => setPriceRange([range[0] ?? 0, range[1] ?? 0])}
                            isMobile={false}
                        />
                    </div>
                    <div className="flex-1">
                        <BreadcrumbAndSort />
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredWatches.map((watch) => (
                                <ProductCard
                                    key={`${watch.collectionName}-${watch.id}`}
                                    item={watch}
                                    isWishlisted={wishlist.includes(watch.id)}
                                    onToggleWishlist={toggleWishlist}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                        {filteredWatches.length === 0 && (
                            <div className="col-span-full text-center py-12 flex flex-col items-center justify-center">
                                <h3 className="text-lg font-medium text-gray-700">No watches match your filters</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your filter criteria</p>
                            </div>
                        )}
                    </div>

                    {/* {visibleWatches < allWatches.length && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => setVisibleWatches(prev => prev + 8)}
                            className="px-8 py-2 border border-gray-500 rounded-full hover:bg-gray-300/30 transition-colors duration-300 uppercase text-sm tracking-widest"
                        >
                            See More
                        </button>
                    </div>
                )} */}
                </div>
            </div>

            {isFormOpen && (
                <Form
                    selectedService={selectedService}
                    onClose={() => setIsFormOpen(false)}
                />
            )}

            {selectedWatch && (
                <div className="fixed inset-0 bg-gray-300/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-200 rounded-lg max-w-3xl w-full p-6 flex gap-6">
                        <div className="w-1/2 relative">
                            <div className="aspect-square overflow-hidden rounded-lg">
                                <img
                                    src={selectedWatch.images?.[currentImageIndex] || selectedWatch.Image}
                                    alt={selectedWatch.Company}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                {selectedWatch.images?.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-16 h-16 rounded border-2 ${index === currentImageIndex
                                            ? 'border-gray-700'
                                            : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-1/2 space-y-4">
                            <h3 className="text-2xl font-bold text-gray-900">{selectedWatch.Company}</h3>
                            <p className="text-gray-600 text-xl">Rs. {selectedWatch.Price}</p>
                            <div className="flex items-center gap-1">
                                {renderRating(selectedWatch.rating || 0)}
                                <span className="text-gray-500 text-sm ml-2">({selectedWatch.reviews} reviews)</span>
                            </div>
                            <p className="text-gray-700">{selectedWatch.Description}</p>
                            <button
                                onClick={() => handleAddToCart(null, selectedWatch)}
                                className="w-full py-3 bg-gray-400 hover:bg-gray-300 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                            >
                                <ShoppingBagIcon className="w-5 h-5" />
                                Buy Now
                            </button>
                            <button
                                onClick={() => setSelectedWatch(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-gray-400 hover:bg-gray-300"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllWatches;
