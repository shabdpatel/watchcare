import { useRef, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import image from "../assets/main.jpg";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Form from "./form";
import { Link } from "react-router-dom";

const Homepage = () => {
    const trendingRef = useRef(null);
    const [trendingWatches, setTrendingWatches] = useState([]);
    const [exclusiveWatches, setExclusiveWatches] = useState([]);
    const [smartWatches, setSmartWatches] = useState([]);
    const [trendingVisible, setTrendingVisible] = useState(8);
    const [exclusiveVisible, setExclusiveVisible] = useState(8);
    const [smartVisible, setSmartVisible] = useState(8);
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
                    collectionName: collectionName, // Add collection name to each watch object
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

    const renderCollectionSection = (watches, visible, setVisible, title) => (
        <>
            <div className="text-center py-8">
                <div className="inline-block">
                    <h2 className="text-3xl font-light uppercase tracking-widest text-gray-300">
                        {title}
                    </h2>
                    <hr className="border-gray-600 mt-3 mx-auto w-1/2" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {watches.slice(0, visible).map((watch) => (
                        <Link to={`/details/${watch.collectionName}/${watch.id}`} key={watch.id}>
                            <div
                                key={watch.id}
                                className="group relative bg-black rounded-lg overflow-hidden border border-gray-800 hover:border-gray-500 transition-all duration-300"
                            >
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
                                        onClick={() => toggleWishlist(watch.id)}
                                        className="p-2 rounded-full bg-gray-900/50 hover:bg-gray-800/70 backdrop-blur-sm"
                                    >
                                        {wishlist.includes(watch.id) ? (
                                            <HeartSolidIcon className="w-5 h-5 text-red-500" />
                                        ) : (
                                            <HeartIcon className="w-5 h-5 text-white" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => addToCart(watch)}
                                        className="p-2 rounded-full bg-gray-900/50 hover:bg-gray-800/70 backdrop-blur-sm"
                                    >
                                        <ShoppingBagIcon className="w-5 h-5 text-white" />
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
                                        <h3 className="text-xl font-medium uppercase tracking-wide">
                                            {watch.Company}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            {renderRating(watch.rating || 0)}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-lg font-light">Rs. {watch.Price}</p>
                                    <p className="text-gray-500 text-sm line-clamp-2">{watch.Description}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => addToCart(watch)}
                                            className="flex-1 py-2 text-sm uppercase tracking-wide border border-gray-700 rounded-md hover:bg-gray-800/30 transition-colors duration-300 flex items-center justify-center gap-2"
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {visible < watches.length && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => setVisible(prev => prev + 8)}
                            className="px-8 py-2 border border-gray-600 rounded-full hover:bg-gray-800/30 transition-colors duration-300 uppercase text-sm tracking-widest"
                        >
                            See More
                        </button>
                    </div>
                )}
            </div>
        </>
    );

    const renderServiceSection = () => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
                <h2 className="text-3xl font-light uppercase tracking-widest text-gray-300">
                    Our Services
                </h2>
                <hr className="border-gray-600 mt-3 mx-auto w-1/2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                <div
                    className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-gray-500 transition-all duration-300 cursor-pointer"
                    onClick={() => handleServiceClick("Watch Preparation")}
                >
                    <div className="text-center">
                        <h3 className="text-xl font-medium uppercase tracking-wide text-gray-300">
                            Watch Preparation
                        </h3>
                        <p className="text-gray-400 mt-2">
                            We ensure your smartwatch is fully charged, updated, and ready to use upon delivery.
                        </p>
                    </div>
                </div>

                <div
                    className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-gray-500 transition-all duration-300 cursor-pointer"
                    onClick={() => handleServiceClick("Personal Modification")}
                >
                    <div className="text-center">
                        <h3 className="text-xl font-medium uppercase tracking-wide text-gray-300">
                            Personal Modification
                        </h3>
                        <p className="text-gray-400 mt-2">
                            Customize your smartwatch with personalized settings, watch faces, and more.
                        </p>
                    </div>
                </div>

                <div
                    className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-gray-500 transition-all duration-300 cursor-pointer"
                    onClick={() => handleServiceClick("Extended Warranty")}
                >
                    <div className="text-center">
                        <h3 className="text-xl font-medium uppercase tracking-wide text-gray-300">
                            Extended Warranty
                        </h3>
                        <p className="text-gray-400 mt-2">
                            Get extended warranty coverage for your smartwatch for added peace of mind.
                        </p>
                    </div>
                </div>

                <div
                    className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-gray-500 transition-all duration-300 cursor-pointer"
                    onClick={() => handleServiceClick("Repair & Maintenance")}
                >
                    <div className="text-center">
                        <h3 className="text-xl font-medium uppercase tracking-wide text-gray-300">
                            Repair & Maintenance
                        </h3>
                        <p className="text-gray-400 mt-2">
                            Professional repair and maintenance services to keep your smartwatch in top condition.
                        </p>
                    </div>
                </div>

                <div
                    className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-gray-500 transition-all duration-300 cursor-pointer"
                    onClick={() => handleServiceClick("Software Updates")}
                >
                    <div className="text-center">
                        <h3 className="text-xl font-medium uppercase tracking-wide text-gray-300">
                            Software Updates
                        </h3>
                        <p className="text-gray-400 mt-2">
                            Regular software updates to ensure your smartwatch has the latest features and security patches.
                        </p>
                    </div>
                </div>

                <div
                    className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-gray-500 transition-all duration-300 cursor-pointer"
                    onClick={() => handleServiceClick("Data Migration")}
                >
                    <div className="text-center">
                        <h3 className="text-xl font-medium uppercase tracking-wide text-gray-300">
                            Data Migration
                        </h3>
                        <p className="text-gray-400 mt-2">
                            Seamless data migration from your old smartwatch to your new one.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-black min-h-screen text-white">
            <div className="relative h-screen min-h-[500px] overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src={image}
                        alt="Luxury Watches"
                        className="w-full h-full object-cover object-center animate-kenburns"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent" />
                </div>

                <div className="relative h-full flex items-center">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="max-w-2xl space-y-6 animate-slide-up">
                            <div className="overflow-hidden">
                                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
                                    <span className="inline-block bg-gradient-to-r from-amber-300 to-rose-500 bg-clip-text text-transparent">
                                        Luxury
                                    </span>
                                    <span className="text-white ml-4">Redefined</span>
                                </h1>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 sm:w-16 h-px bg-rose-500" />
                                <p className="text-lg sm:text-xl md:text-2xl font-light text-gray-300 tracking-wide">
                                    Where Precision Meets Elegance
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                <button
                                    className="px-6 sm:px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 uppercase tracking-widest text-sm font-medium"
                                    onClick={() => window.scrollTo({ top: trendingRef.current.offsetTop, behavior: "smooth" })}
                                >
                                    Explore Collection
                                </button>
                                <button className="px-6 sm:px-8 py-3 border border-gray-600 hover:border-rose-500 text-gray-300 hover:text-rose-400 rounded-full transition-all duration-300 uppercase tracking-widest text-sm font-medium">
                                    Custom Designs
                                </button>
                            </div>

                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
                                <div className="animate-bounce w-6 h-6 border-2 border-rose-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 sm:w-1/3 max-w-[400px] md:max-w-[600px] hidden lg:block animate-float">
                    <img
                        src={image}
                        alt="Premium Watch"
                        className="w-full h-auto object-contain"
                    />
                </div>
            </div>

            {renderCollectionSection(trendingWatches, trendingVisible, setTrendingVisible, "Trending Collection")}
            {renderCollectionSection(exclusiveWatches, exclusiveVisible, setExclusiveVisible, "Exclusive Collection")}
            {renderCollectionSection(smartWatches, smartVisible, setSmartVisible, "Smart Watches")}

            {renderServiceSection()}

            {isFormOpen && (
                <Form
                    selectedService={selectedService}
                    onClose={() => setIsFormOpen(false)}
                />
            )}

            {selectedWatch && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-lg max-w-3xl w-full p-6 flex gap-6">
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
                                            ? 'border-gray-300'
                                            : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-1/2 space-y-4">
                            <h3 className="text-2xl font-bold">{selectedWatch.Company}</h3>
                            <p className="text-gray-400 text-xl">Rs. {selectedWatch.Price}</p>
                            <div className="flex items-center gap-1">
                                {renderRating(selectedWatch.rating || 0)}
                                <span className="text-gray-500 text-sm ml-2">({selectedWatch.reviews} reviews)</span>
                            </div>
                            <p className="text-gray-300">{selectedWatch.Description}</p>
                            <button
                                onClick={() => addToCart(selectedWatch)}
                                className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                            >
                                <ShoppingBagIcon className="w-5 h-5" />
                                Buy Now
                            </button>
                            <button
                                onClick={() => setSelectedWatch(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700"
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

export default Homepage;