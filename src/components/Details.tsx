import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../pages/firebase";
import { useEffect, useState } from "react";
import { HeartIcon, ShoppingBagIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

// Define specifications for each product type
const productSpecs = {
    Watches: {
        technical: [
            { label: 'Watch Glass/Crystal', key: 'Glass' },
            { label: 'Movement', key: 'Movement' },
            { label: 'Warranty', key: 'Warranty' },
            { label: 'Water Resistance', key: 'WaterResistance' },
            { label: 'Hand Type', key: 'HandType' },
            { label: 'Style', key: 'Style' },
            { label: 'Occasion', key: 'Occasion' },
            { label: 'Band Style', key: 'BandStyle' },
            { label: 'Case Material', key: 'CaseMaterial' }
        ],
        brand: [
            { label: 'Brand', key: 'Brand' },
            { label: 'Collection', key: 'Collection' },
            { label: 'Country of Origin', key: 'CountryOfOrigin' },
            { label: 'Manufacturer', key: 'ManufacturedBy' },
            { label: 'Imported By', key: 'ImportedBy' },
            { label: 'Global Identifier', key: 'GlobalIdentifier' }
        ],
        dial: [
            { label: 'Dial Shape', key: 'DialShape' },
            { label: 'Dial Color', key: 'DialColor' },
            { label: 'Secondary Dial Color', key: 'SecondaryDialColor' },
            { label: 'Dial Type', key: 'DialType' },
            { label: 'Dial Diameter', key: 'DialDiameter' },
            { label: 'Dial Thickness', key: 'DialThickness' }
        ],
        strap: [
            { label: 'Strap Color', key: 'StrapColor' },
            { label: 'Secondary Strap Color', key: 'SecondaryStrapColor' },
            { label: 'Strap Material', key: 'StrapMaterial' },
            { label: 'Strap Width', key: 'StrapWidth' }
        ]
    },
    Shoes: {
        technical: [
            { label: 'Style', key: 'Style' },
            { label: 'Closure Type', key: 'ClosureType' },
            { label: 'Sole Material', key: 'SoleMaterial' },
            { label: 'Heel Height', key: 'HeelHeight' },
            { label: 'Shoe Type', key: 'ShoeType' },
            { label: 'Occasion', key: 'Occasion' }
        ],
        brand: [
            { label: 'Brand', key: 'Brand' },
            { label: 'Collection', key: 'Collection' },
            { label: 'Country of Origin', key: 'CountryOfOrigin' },
            { label: 'Manufacturer', key: 'Manufacturer' }
        ],
        material: [
            { label: 'Upper Material', key: 'UpperMaterial' },
            { label: 'Inner Material', key: 'InnerMaterial' },
            { label: 'Sole Material', key: 'SoleMaterial' }
        ],
        fit: [
            { label: 'Size', key: 'Size' },
            { label: 'Width', key: 'Width' },
            { label: 'Arch Type', key: 'ArchType' },
            { label: 'Gender', key: 'Gender' }
        ]
    },
    Bags: {
        technical: [
            { label: 'Style', key: 'Style' },
            { label: 'Closure Type', key: 'ClosureType' },
            { label: 'Capacity', key: 'Capacity' },
            { label: 'Number of Compartments', key: 'Compartments' },
            { label: 'Water Resistant', key: 'WaterResistant' }
        ],
        brand: [
            { label: 'Brand', key: 'Brand' },
            { label: 'Collection', key: 'Collection' },
            { label: 'Country of Origin', key: 'CountryOfOrigin' },
            { label: 'Manufacturer', key: 'Manufacturer' }
        ],
        material: [
            { label: 'Material', key: 'Material' },
            { label: 'Lining Material', key: 'LiningMaterial' },
            { label: 'Hardware Material', key: 'HardwareMaterial' }
        ],
        dimensions: [
            { label: 'Length', key: 'Length' },
            { label: 'Width', key: 'Width' },
            { label: 'Height', key: 'Height' },
            { label: 'Handle Drop', key: 'HandleDrop' }
        ]
    },
    Fashion: {
        technical: [
            { label: 'Style', key: 'Style' },
            { label: 'Fit Type', key: 'FitType' },
            { label: 'Sleeve Length', key: 'SleeveLength' },
            { label: 'Neck Type', key: 'NeckType' },
            { label: 'Pattern', key: 'Pattern' }
        ],
        brand: [
            { label: 'Brand', key: 'Brand' },
            { label: 'Collection', key: 'Collection' },
            { label: 'Country of Origin', key: 'CountryOfOrigin' },
            { label: 'Manufacturer', key: 'Manufacturer' }
        ],
        material: [
            { label: 'Material', key: 'Material' },
            { label: 'Fabric Type', key: 'FabricType' },
            { label: 'Care Instructions', key: 'CareInstructions' }
        ],
        size: [
            { label: 'Size', key: 'Size' },
            { label: 'Fit', key: 'Fit' },
            { label: 'Gender', key: 'Gender' }
        ]
    },
    Electronics: {
        technical: [
            { label: 'Type', key: 'Type' },
            { label: 'Model', key: 'Model' },
            { label: 'Connectivity', key: 'Connectivity' },
            { label: 'Battery Life', key: 'BatteryLife' },
            { label: 'Features', key: 'Features' }
        ],
        brand: [
            { label: 'Brand', key: 'Brand' },
            { label: 'Series', key: 'Series' },
            { label: 'Country of Origin', key: 'CountryOfOrigin' },
            { label: 'Warranty', key: 'Warranty' }
        ],
        specs: [
            { label: 'Power Output', key: 'PowerOutput' },
            { label: 'Frequency Response', key: 'FrequencyResponse' },
            { label: 'Driver Size', key: 'DriverSize' }
        ]
    },
    Accessories: {
        technical: [
            { label: 'Type', key: 'Type' },
            { label: 'Style', key: 'Style' },
            { label: 'Closure Type', key: 'ClosureType' },
            { label: 'Occasion', key: 'Occasion' }
        ],
        brand: [
            { label: 'Brand', key: 'Brand' },
            { label: 'Collection', key: 'Collection' },
            { label: 'Country of Origin', key: 'CountryOfOrigin' },
            { label: 'Manufacturer', key: 'Manufacturer' }
        ],
        material: [
            { label: 'Material', key: 'Material' },
            { label: 'Finish', key: 'Finish' },
            { label: 'Hardware Material', key: 'HardwareMaterial' }
        ],
        dimensions: [
            { label: 'Size', key: 'Size' },
            { label: 'Length', key: 'Length' },
            { label: 'Width', key: 'Width' }
        ]
    }
};

const Detail = () => {
    const { collectionName, id } = useParams();
    const [watch, setWatch] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [wishlist, setWishlist] = useState([]);
    const [cart, setCart] = useState([]);
    const [relatedWatches, setRelatedWatches] = useState([]);

    useEffect(() => {
        const fetchWatch = async () => {
            try {
                const docRef = doc(db, collectionName, id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setWatch({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching watch:", error);
            }
        };
        fetchWatch();
    }, [id, collectionName]);
    useEffect(() => {
        const fetchRelatedWatches = async () => {
            if (!watch) return;

            try {
                const q = query(
                    collection(db, collectionName),
                    where("Company", "==", watch.Company),
                    where("__name__", "!=", id)
                );
                const querySnapshot = await getDocs(q);
                const watches = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRelatedWatches(watches);
            } catch (error) {
                console.error("Error fetching related watches:", error);
            }
        };

        fetchRelatedWatches();
    }, [watch, collectionName, id]);


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

    const renderSpecifications = (product, category) => {
        const specs = productSpecs[category];
        if (!specs) return null;

        return (
            <div className="space-y-8 pt-8">
                <h2 className="text-2xl font-bold border-b pb-2">MORE INFORMATION</h2>

                {Object.entries(specs).map(([sectionName, fields]) => (
                    <div key={sectionName} className="space-y-4">
                        <h3 className="text-xl font-semibold uppercase">{sectionName}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {fields.map(({ label, key }) => (
                                product[key] && (
                                    <div key={key}>
                                        <p className="text-sm text-gray-500">{label}</p>
                                        <p className="font-medium">{product[key]}</p>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Add this helper function for truncating description
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    if (!watch) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
                {/* Main Product Section */}
                <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Image Gallery Section */}
                        <div className="space-y-4">
                            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border hover:border-gray-400 transition-all">
                                <img
                                    src={watch?.images?.[currentImageIndex] || watch?.Image}
                                    alt={watch?.Company}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                {watch?.images?.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all
                                            ${index === currentImageIndex
                                                ? 'border-rose-500 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <img
                                            src={img}
                                            alt={`View ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Info Section */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                                    {watch?.Company} {watch?.Model}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="text-3xl font-bold text-rose-600">
                                        ₹{watch?.Price?.toLocaleString()}
                                    </span>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>SKU:</span>
                                        <span className="font-medium">{watch?.SKU}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Section */}
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => addToCart(watch)}
                                    className="flex-1 min-w-[200px] py-3 px-6 bg-rose-600 hover:bg-rose-700 
                                        text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShoppingBagIcon className="w-5 h-5" />
                                    Add to Cart
                                </button>

                                <button
                                    onClick={() => toggleWishlist(watch?.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-colors
                                        ${wishlist.includes(watch?.id)
                                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                                            : 'border-gray-300 hover:border-gray-400'}`}
                                >
                                    {wishlist.includes(watch?.id)
                                        ? <HeartSolidIcon className="w-5 h-5 text-rose-600" />
                                        : <HeartIcon className="w-5 h-5" />
                                    }
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                                    <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-blue-900">Genuine Product</p>
                                        <p className="text-sm text-blue-700">100% Authenticity Guaranteed</p>
                                    </div>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
                                    <LockClosedIcon className="w-8 h-8 text-green-600" />
                                    <div>
                                        <p className="font-medium text-green-900">Secure Payment</p>
                                        <p className="text-sm text-green-700">Multiple Payment Options</p>
                                    </div>
                                </div>
                            </div>

                            {/* Add Description Section - after Trust Badges and before Specifications */}
                            <div className="mt-8 space-y-6">
                                <div className="prose max-w-none">
                                    <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                                    <div className="text-gray-600 space-y-4">
                                        <p>{watch?.Description}</p>
                                        {watch?.Features && (
                                            <div>
                                                <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">Key Features:</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {watch.Features.map((feature, index) => (
                                                        <li key={index}>{feature}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Specifications Section with improved layout */}
                            {renderSpecifications(watch, collectionName)}
                        </div>
                    </div>
                </div>

                {/* Enhanced Related Products Section */}
                {relatedWatches.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6">More from {watch?.Company}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {relatedWatches.map((relatedWatch) => (
                                <div
                                    key={relatedWatch.id}
                                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                                >
                                    <Link
                                        to={`/${collectionName}/${relatedWatch.id}`}
                                        className="block group"
                                    >
                                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                                            <img
                                                src={relatedWatch.Image || relatedWatch.images?.[0]}
                                                alt={relatedWatch.Model}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-medium text-gray-900 group-hover:text-rose-600 transition-colors">
                                                {relatedWatch.Company} {relatedWatch.Model}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {truncateText(relatedWatch.Description, 100)}
                                            </p>
                                            <p className="text-lg font-bold text-rose-600">
                                                ₹{relatedWatch.Price?.toLocaleString()}
                                            </p>
                                        </div>
                                    </Link>
                                    <div className="mt-4 flex justify-between items-center">
                                        <button
                                            onClick={() => addToCart(relatedWatch)}
                                            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 
                                                text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <ShoppingBagIcon className="w-4 h-4" />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => toggleWishlist(relatedWatch.id)}
                                            className={`p-2 rounded-full transition-colors
                                                ${wishlist.includes(relatedWatch.id)
                                                    ? 'text-rose-600 bg-rose-50'
                                                    : 'text-gray-400 hover:text-rose-600'}`}
                                        >
                                            {wishlist.includes(relatedWatch.id)
                                                ? <HeartSolidIcon className="w-5 h-5" />
                                                : <HeartIcon className="w-5 h-5" />
                                            }
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Detail;