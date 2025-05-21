import { useParams } from "react-router-dom";
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

    if (!watch) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-black pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4 lg:space-y-6">
                        <div className="aspect-square overflow-hidden rounded-2xl border-2 border-gray-300">
                            <img
                                src={watch.images?.[currentImageIndex] || watch.Image}
                                alt={watch.Company}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {watch.images?.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 ${index === currentImageIndex
                                        ? 'border-gray-400'
                                        : 'border-gray-300'
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6 lg:space-y-8">
                        <div className="space-y-4 border-b border-gray-300 pb-6">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {watch.Company} {watch.Model}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">SKU:</span>
                                <span className="font-medium">{watch.SKU}</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Price Section */}
                            <div className="space-y-2">
                                <p className="text-3xl font-bold text-rose-600">
                                    Rs.{watch.Price}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {watch.Description}
                                </p>
                                <button className="text-rose-600 underline text-sm">
                                    CHECK HELIOS SELLING PRICE
                                </button>
                            </div>

                            {/* Wishlist & Genuine Badge */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => toggleWishlist(watch.id)}
                                    className="flex items-center gap-1 text-rose-600"
                                >
                                    {wishlist.includes(watch.id) ? (
                                        <HeartSolidIcon className="w-5 h-5" />
                                    ) : (
                                        <HeartIcon className="w-5 h-5" />
                                    )}
                                    <span className="underline">
                                        {wishlist.includes(watch.id) ? 'REMOVE FROM WISHLIST' : 'ADD TO WISHLIST'}
                                    </span>
                                </button>
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                    1000 GENUINE PRODUCTS
                                </span>
                            </div>

                            {/* Trust & Security */}
                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-100 text-blue-800 rounded-lg font-medium">
                                    <ShieldCheckIcon className="w-6 h-6" />
                                    BUY WITH TITAN TRUST
                                </button>

                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        <LockClosedIcon className="w-6 h-6 text-green-600" />
                                        <span className="font-medium">SECURE PAYMENT</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Get Credit Card EMI on 19+ Banks
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Check Debit Card & Cardless EMI options
                                    </p>
                                    <button className="text-rose-600 text-sm mt-2">
                                        VIEW PLANS &gt;
                                    </button>
                                </div>
                            </div>

                            {/* Dynamic Specifications Section */}
                            {renderSpecifications(watch, collectionName)}

                            {/* Delivery Options */}
                            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                                <h3 className="text-xl font-semibold">DELIVERY OPTIONS</h3>
                                <div className="space-y-2">
                                    <p className="text-gray-600">Enter Pincode to unlock delivery options</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter Pincode"
                                            className="px-4 py-2 border rounded-lg w-48"
                                        />
                                        <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                                            CHECK
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Standard Delivery available at 25000+ Pincodes
                                    </p>
                                </div>
                            </div>

                            {/* Add to Cart */}
                            <button
                                onClick={() => addToCart(watch)}
                                className="w-full py-4 bg-rose-600 text-white rounded-xl uppercase tracking-widest font-medium hover:bg-rose-700 transition-colors"
                            >
                                ADD TO CART
                            </button>

                            {/* Enhanced Offers Section */}
                            <div className="bg-yellow-100 p-6 rounded-xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold">OFFERS</h3>
                                    <button className="text-rose-600 font-medium">
                                        SHOW OFFERS
                                    </button>
                                </div>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <span className="bg-rose-600 text-white px-2 py-1 rounded text-sm">40%</span>
                                        <span className="text-gray-700">Security IPID</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {relatedWatches.length > 0 && (
                <div className="bg-gray-50 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold mb-8">MORE FROM {watch.Company}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {relatedWatches.map((relatedWatch) => (
                                <div key={relatedWatch.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-4">
                                        <img
                                            src={relatedWatch.images?.[0] || relatedWatch.Image}
                                            alt={relatedWatch.Company}
                                            className="w-full h-48 object-contain mb-4"
                                        />
                                        <h3 className="font-semibold text-lg">{relatedWatch.Company}</h3>
                                        <p className="text-gray-600 text-sm mb-2">{relatedWatch.Model}</p>
                                        <p className="text-lg font-bold text-rose-600">Rs. {relatedWatch.Price}</p>
                                        <div className="mt-4 space-y-2">
                                            <button className="w-full border border-rose-600 text-rose-600 py-2 rounded-lg hover:bg-rose-50 transition-colors">
                                                BUY ONLINE
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Detail;