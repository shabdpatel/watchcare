import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Form from "./form";
import { Link } from "react-router-dom";
import FiltersSidebar from "../components/FiltersSidebar";

const Men = () => {
    // State variables (same as AllWatches)
    const [sortOption, setSortOption] = useState('bestsellers');
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedDialColors, setSelectedDialColors] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 10000000]);
    const [selectedDialShapes, setSelectedDialShapes] = useState([]);
    const [selectedStrapColors, setSelectedStrapColors] = useState([]);
    const [selectedStrapMaterials, setSelectedStrapMaterials] = useState([]);
    const [selectedDialThicknesses, setSelectedDialThicknesses] = useState([]);
    const [trendingWatches, setTrendingWatches] = useState([]);
    const [exclusiveWatches, setExclusiveWatches] = useState([]);
    const [smartWatches, setSmartWatches] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [selectedWatch, setSelectedWatch] = useState(null);
    const [cart, setCart] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedService, setSelectedService] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        const fetchCollection = async (collectionName, setter) => {
            try {
                const querySnapshot = await getDocs(collection(db, collectionName));
                const watches = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    collectionName: collectionName,
                    ...doc.data(),
                }));
                setter(watches);
            } catch (error) {
                console.error(`Error fetching ${collectionName}:`, error);
            }
        };

        fetchCollection("Trending watches", setTrendingWatches);
        fetchCollection("Exclusive Watches", setExclusiveWatches);
        fetchCollection("Smart Watches", setSmartWatches);
    }, []);

    // Add gender filter to the existing filter function
    const filterWatches = (watches) => {
        return watches.filter(watch => {
            // New gender filter
            if (watch.Gender !== 'Men') return false;

            // Existing filters from AllWatches
            if (selectedBrands.length > 0 && !selectedBrands.includes(watch.Company)) return false;
            const watchPrice = Number(watch.Price) || 0;
            if (watchPrice < priceRange[0] || watchPrice > priceRange[1]) return false;
            if (selectedDialColors.length > 0 && watch.DialColor &&
                !selectedDialColors.includes(watch.DialColor)) return false;
            if (selectedDialShapes.length > 0 && watch.DialShape &&
                !selectedDialShapes.includes(watch.DialShape)) return false;
            if (selectedStrapColors.length > 0 && watch.StrapColor &&
                !selectedStrapColors.includes(watch.StrapColor)) return false;
            if (selectedStrapMaterials.length > 0 && watch.StrapMaterial &&
                !selectedStrapMaterials.includes(watch.StrapMaterial)) return false;
            if (selectedDialThicknesses.length > 0 && watch.Thickness) {
                const thickness = Number(watch.Thickness);
                let thicknessCategory = '';
                // ... existing thickness calculations ...
                if (!selectedDialThicknesses.includes(thicknessCategory)) return false;
            }
            return true;
        });
    };

    // Rest of the component remains the same as AllWatches except for text changes
    const toggleWishlist = (watchId) => {
        setWishlist(prev =>
            prev.includes(watchId)
                ? prev.filter(id => id !== watchId)
                : [...prev, watchId]
        );
    };

    const addToCart = (watch) => {
        setCart(prev => [...prev, { ...watch, quantity: 1 }]);
    };

    const renderRating = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`text-${i < rating ? 'yellow-400' : 'gray-500'}`}>&#9733;</span>
        ));
    };

    const handleServiceClick = (service) => {
        setSelectedService(service);
        setIsFormOpen(true);
    };

    const renderServiceSection = () => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
                <h2 className="text-3xl font-light uppercase tracking-widest text-gray-700">
                    Our Services
                </h2>
                <hr className="border-gray-400 mt-3 mx-auto w-1/2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {[
                    {
                        title: "Watch Preparation",
                        description: "We ensure your smartwatch is fully charged, updated, and ready to use upon delivery."
                    },
                    {
                        title: "Personal Modification",
                        description: "Customize your smartwatch with personalized settings, watch faces, and more."
                    },
                    {
                        title: "Extended Warranty",
                        description: "Get extended warranty coverage for your smartwatch for added peace of mind."
                    },
                    {
                        title: "Repair & Maintenance",
                        description: "Professional repair and maintenance services to keep your smartwatch in top condition."
                    },
                    {
                        title: "Software Updates",
                        description: "Regular software updates to ensure your smartwatch has the latest features and security patches."
                    },
                    {
                        title: "Data Migration",
                        description: "Seamless data migration from your old smartwatch to your new one."
                    }
                ].map((service, index) => (
                    <div
                        key={index}
                        className="bg-gray-100 p-6 rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-300 cursor-pointer"
                        onClick={() => handleServiceClick(service.title)}
                    >
                        <div className="text-center">
                            <h3 className="text-xl font-medium uppercase tracking-wide text-gray-700">
                                {service.title}
                            </h3>
                            <p className="text-gray-600 mt-2">
                                {service.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const sortWatches = (watches) => {
        switch (sortOption) {
            case 'price-low-high':
                return [...watches].sort((a, b) => (Number(a.Price) - Number(b.Price)));
            case 'price-high-low':
                return [...watches].sort((a, b) => (Number(b.Price) - Number(a.Price)));
            case 'newest':
                return [...watches].sort((a, b) => new Date(b.DateAdded) - new Date(a.DateAdded));
            case 'rating':
                return [...watches].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'bestsellers':
            default:
                // Assuming you have a salesCount property
                return [...watches].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        }
    };

    const allWatches = [...trendingWatches, ...exclusiveWatches, ...smartWatches];


    const filteredWatches = sortWatches(filterWatches(allWatches));


    // Updated BreadcrumbAndSort component
    const BreadcrumbAndSort = () => (
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-12 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-sm text-gray-600">
                    <Link to="/" className="hover:text-gray-900">HOME</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">MEN'S WATCHES</span>
                </div>
                {/* ... rest of sort component ... */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
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
            {/* Updated page title */}
            <div className="text-center py-8">
                <div className="inline-block">
                    <h2 className="text-3xl font-light uppercase tracking-widest text-gray-700">
                        Men's Watches
                    </h2>
                    <hr className="border-gray-400 mt-3 mx-auto w-1/2" />
                </div>
            </div>

            {/* Rest of the component remains the same as AllWatches */}
            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-12 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
                    <FiltersSidebar
                        selectedBrands={selectedBrands}
                        setSelectedBrands={setSelectedBrands}
                        selectedDialColors={selectedDialColors}
                        setSelectedDialColors={setSelectedDialColors}
                        selectedDialShapes={selectedDialShapes}
                        setSelectedDialShapes={setSelectedDialShapes}
                        selectedStrapColors={selectedStrapColors}
                        setSelectedStrapColors={setSelectedStrapColors}
                        selectedStrapMaterials={selectedStrapMaterials}
                        setSelectedStrapMaterials={setSelectedStrapMaterials}
                        selectedDialThicknesses={selectedDialThicknesses}
                        setSelectedDialThicknesses={setSelectedDialThicknesses}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                    />
                    <div className="flex-1">
                        <BreadcrumbAndSort />
                        {/* ... same grid layout as AllWatches ... */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredWatches.map((watch) => (

                                <Link
                                    to={`/details/${watch.collectionName}/${watch.id}`}
                                    key={`${watch.collectionName}-${watch.id}`}
                                >
                                    <div className="group relative bg-gray-100 rounded-lg overflow-hidden border border-gray-300 hover:border-gray-400 transition-all duration-300">
                                        {watch.tags && (
                                            <div className="absolute top-2 left-2 flex gap-2 z-10">
                                                {watch.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 text-xs uppercase rounded-full bg-opacity-90"
                                                        style={{ backgroundColor: tag.color }}
                                                    >
                                                        {tag.label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleWishlist(watch.id);
                                                }}
                                                className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 backdrop-blur-sm"
                                            >
                                                {wishlist.includes(watch.id) ? (
                                                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                                                ) : (
                                                    <HeartIcon className="w-5 h-5 text-gray-800" />
                                                )}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addToCart(watch);
                                                }}
                                                className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 backdrop-blur-sm"
                                            >
                                                <ShoppingBagIcon className="w-5 h-5 text-gray-800" />
                                            </button>
                                        </div>

                                        <div className="aspect-square overflow-hidden relative">
                                            <img
                                                src={watch.Image}
                                                alt={watch.Company}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>

                                        <div className="p-4 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-medium uppercase tracking-wide text-gray-900">
                                                    {watch.Company}
                                                </h3>
                                                <div className="flex items-center gap-1">
                                                    {renderRating(watch.rating || 0)}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-lg font-light">Rs. {watch.Price}</p>
                                            <p className="text-gray-500 text-sm line-clamp-2">{watch.Description}</p>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        addToCart(watch);
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
                    </div>
                </div>
            </div>

            {/* ... rest of the component (services section, modals, etc.) ... */}
            {renderServiceSection()}

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
                                onClick={() => addToCart(selectedWatch)}
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

export default Men;