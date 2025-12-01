import { Link, useParams } from "react-router-dom";
import { doc, getDoc, query, collection, where, getDocs, limit, setDoc } from "firebase/firestore";
import { db } from "../pages/firebase";
import { useEffect, useRef, useState } from "react";
import {
    HeartIcon,
    ShoppingBagIcon,
    LockClosedIcon,
    ShieldCheckIcon,
    XMarkIcon, // Add this import
    ArrowLeftIcon // Add this import
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useCart } from '../context/CartContext'; // Add this import
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CheckoutFlow from './CheckoutFlow';
import { submitNegotiationRequest, listenNegotiation, getDisplayPrice } from '../utils/negotiation';
import { ensureRazorpayKey } from '../config/payments';

// Define interfaces
interface ProductData {
    id: string;
    Company: string;
    Model: string;
    Price: number;
    SKU: string;
    Description: string;
    Features?: string[];
    Image?: string;
    images?: string[];
    rating?: number;
    // Allow additional dynamic fields without using any
    [key: string]: unknown;
}

interface ShippingAddress {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
}

// Define specifications for each product type
const productSpecs = {
    Watches: {
        technical: [
            { label: 'Watch Glass/Crystal', key: 'Glass' },
            { label: 'Movement', key: 'Movement' },
            { label: 'Water Resistance', key: 'WaterResistance' },
            { label: 'Hand Type', key: 'HandType' },
            { label: 'Style', key: 'Style' },
            { label: 'Occasion', key: 'Occasion' },
            { label: 'Band Style', key: 'BandStyle' },
            { label: 'Case Material', key: 'CaseMaterial' }
        ],
        warranty: [  // Add this new section
            { label: 'Warranty Duration', key: 'Warranty.Duration' },
            { label: 'Warranty Expiry', key: 'Warranty.Expiry' },
            { label: 'Warranty Provider', key: 'Warranty.Provider' },
            { label: 'Warranty Type', key: 'Warranty.Type' },
            { label: 'Warranty Status', key: 'Warranty.Status' },
            { label: 'Extended Warranty', key: 'Warranty.ExtendedWarranty.Available' },
            { label: 'Extended Duration', key: 'Warranty.ExtendedWarranty.Duration' },
            { label: 'Registration Required', key: 'Warranty.Registration.Required' }
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
    const { collectionName = '', id = '' } = useParams<{ collectionName: string; id: string }>();
    const [watch, setWatch] = useState<ProductData | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [relatedWatches, setRelatedWatches] = useState<ProductData[]>([]);
    const [similarProducts, setSimilarProducts] = useState<ProductData[]>([]);
    const { addToCart } = useCart();
    const { currentUser } = useAuth() as { currentUser: { email: string } | null };
    const navigate = useNavigate();
    const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
    const [showNegotiateModal, setShowNegotiateModal] = useState<boolean>(false); // used in modal open/close
    const [proposedPrice, setProposedPrice] = useState<string>(''); // controlled input
    const [negStatus, setNegStatus] = useState<NegotiationStatus | 'none'>('none'); // negotiation status display
    const [approvedPrice, setApprovedPrice] = useState<number | undefined>(undefined); // approved price rendering
    const [submittingNeg, setSubmittingNeg] = useState<boolean>(false); // loading state for submit
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: ''
    });

    useEffect(() => {
        const fetchWatch = async () => {
            try {
                const docRef = doc(db, collectionName, id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setWatch({ id: docSnap.id, ...docSnap.data() } as ProductData);
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
                } as ProductData));
                setRelatedWatches(watches);
            } catch (error) {
                console.error("Error fetching related watches:", error);
            }
        };

        fetchRelatedWatches();
    }, [watch, collectionName, id]);
    useEffect(() => {
        const fetchSimilarProducts = async () => {
            if (!watch) return;

            try {
                // Query products with similar price range and different ID
                const priceRange = {
                    min: watch.Price * 0.7, // 70% of current price
                    max: watch.Price * 1.3  // 130% of current price
                };

                const q = query(
                    collection(db, collectionName),
                    where("Price", ">=", priceRange.min),
                    where("Price", "<=", priceRange.max),
                    where("__name__", "!=", id),
                    limit(8)
                );

                const querySnapshot = await getDocs(q);
                const products = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as ProductData));
                setSimilarProducts(products);
            } catch (error) {
                console.error("Error fetching similar products:", error);
            }
        };

        fetchSimilarProducts();
    }, [watch, collectionName, id]);

    // Listen for negotiation updates for this user and product
    const prevStatusRef = useRef<NegotiationStatus | 'none'>('none');
    useEffect(() => {
        if (!currentUser?.email || !watch?.id) return;
        const unsub = listenNegotiation(watch.id, currentUser.email, (neg) => {
            if (!neg) {
                setNegStatus('none');
                setApprovedPrice(undefined);
                return;
            }
            const newStatus = neg.status as NegotiationStatus;
            const prev = prevStatusRef.current;
            setNegStatus(newStatus);
            setApprovedPrice(neg.approvedPrice);
            if (prev === 'pending' && newStatus === 'approved') {
                toast.success('Your negotiated price was approved and applied!');
            }
            prevStatusRef.current = newStatus;
        });
        return () => unsub && unsub();
    }, [currentUser?.email, watch?.id]);


    const toggleWishlist = (watchId: string) => {
        setWishlist(prev =>
            prev.includes(watchId)
                ? prev.filter(id => id !== watchId)
                : [...prev, watchId]
        );
    };

    // Fix type for handleAddToCart
    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>, item: ProductData) => {
        e.preventDefault();
        const priceToUse = getDisplayPrice(item.Price, approvedPrice);
        addToCart({
            id: item.id,
            name: item.Company,
            price: priceToUse,
            image: item.Image || item.images?.[0] || '',
            quantity: 1,
            category: collectionName
        });
    };

    // Fix buttons accessibility
    const renderRating = (rating: number) => (
        [...Array(5)].map((_, i) => (
            <span key={i} className={`text-${i < rating ? 'yellow-400' : 'gray-500'}`} role="img" aria-label={`${i < rating ? 'filled' : 'empty'} star`}>
                ★
            </span>
        ))
    );

    // Update the renderSpecifications function to handle nested properties
    const renderSpecifications = (product: ProductData, category: string) => {
        const specs = productSpecs[category as keyof typeof productSpecs];
        if (!specs) return null;

        const getNestedValue = (obj: unknown, path: string) => {
            const parts = path.split('.');
            let acc: unknown = obj;
            for (const part of parts) {
                if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
                    acc = (acc as Record<string, unknown>)[part];
                } else {
                    return undefined;
                }
            }
            return acc;
        };

        return (
            <div className="space-y-8 pt-8">
                <h2 className="text-2xl font-bold border-b pb-2">MORE INFORMATION</h2>

                {Object.entries(specs).map(([sectionName, fields]) => (
                    <div key={sectionName} className="space-y-4">
                        <h3 className="text-xl font-semibold uppercase">{sectionName}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {fields.map(({ label, key }) => {
                                const value = getNestedValue(product, key);
                                if (value !== undefined && value !== null && value !== '') {
                                    return (
                                        <div key={key}>
                                            <p className="text-sm text-gray-500">{label}</p>
                                            <p className="font-medium">
                                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleBuyNow = async (product: ProductData | null) => {
        if (!product) return;
        if (!currentUser) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }

        try {
            // Load user's default shipping address if available
            const userDoc = await getDoc(doc(db, 'users', currentUser.email));
            const userData = userDoc.data();

            if (userData?.defaultAddress) {
                setShippingAddress(userData.defaultAddress);
            }

            // Initialize Razorpay order
            const displayPrice = getDisplayPrice(product.Price, approvedPrice);
            const options = {
                key: ensureRazorpayKey(),
                amount: displayPrice * 100, // Amount in paise
                currency: 'INR',
                name: 'Watch Store',
                description: `Purchase of ${product.Company} ${product.Model}`,
                image: product.Image || product.images?.[0],
                handler: async (response: { razorpay_payment_id: string }) => {
                    // Handle successful payment
                    const orderData = {
                        productId: product.id,
                        userId: currentUser.email,
                        amount: displayPrice,
                        paymentId: response.razorpay_payment_id,
                        shippingAddress,
                        status: 'paid',
                        createdAt: new Date()
                    };

                    // Save order to Firestore
                    await setDoc(doc(db, 'orders', response.razorpay_payment_id), orderData);

                    toast.success('Payment successful!');
                    navigate('/orders');
                },
                prefill: {
                    name: shippingAddress.name,
                    contact: shippingAddress.phone,
                    email: currentUser.email
                },
                theme: {
                    color: '#E11D48'
                }
            };

            type RazorpayInstance = { open: () => void };
            const RazorpayCtor: new (options: unknown) => RazorpayInstance = (window as unknown as { Razorpay: new (options: unknown) => RazorpayInstance }).Razorpay;
            const razorpayInstance = new RazorpayCtor(options);
            razorpayInstance.open();

        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Payment failed. Please try again.');
        }
    };

    // Add this effect to pre-fill address when modal opens
    useEffect(() => {
        const fetchUserAddress = async () => {
            if (currentUser?.email && showAddressModal) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.email));
                    const userData = userDoc.data();

                    if (userData) {
                        setShippingAddress({
                            name: `${userData.personalInfo?.firstName || ''} ${userData.personalInfo?.lastName || ''}`.trim(),
                            address: userData.addresses?.shipping?.street || '',
                            city: userData.addresses?.shipping?.city || '',
                            state: userData.addresses?.shipping?.state || '',
                            pincode: userData.addresses?.shipping?.postalCode || '',
                            phone: userData.contact?.phoneNumber || ''
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    toast.error('Error loading saved address');
                }
            }
        };

        fetchUserAddress();
    }, [currentUser, showAddressModal]);

    // Submit negotiation
    const submitNegotiation = async () => {
        if (!currentUser?.email || !watch) {
            toast.error('Please login to negotiate');
            navigate('/login');
            return;
        }
        const base = watch.Price;
        const value = Number(proposedPrice);
        if (!value || isNaN(value)) {
            toast.error('Enter a valid number');
            return;
        }
        if (value >= base) {
            toast.error('Proposed price must be less than the current price');
            return;
        }
        if (value <= 0) {
            toast.error('Proposed price must be positive');
            return;
        }
        try {
            setSubmittingNeg(true);
            await submitNegotiationRequest({
                productId: watch.id,
                productCollection: collectionName,
                buyerId: currentUser.email,
                originalPrice: base,
                proposedPrice: value,
            });
            toast.success('Negotiation request sent to seller');
            setShowNegotiateModal(false);
        } catch (e) {
            console.error(e);
            toast.error('Failed to submit request');
        } finally {
            setSubmittingNeg(false);
        }
    };

    // Update the AddressModal component
    const AddressModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Shipping Address</h2>
                    <button
                        onClick={() => setShowAddressModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="Full Name"
                            title="Full Name"
                            value={shippingAddress.name}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            placeholder="Address"
                            title="Address"
                            value={shippingAddress.address}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                placeholder="City"
                                title="City"
                                value={shippingAddress.city}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <input
                                type="text"
                                placeholder="State"
                                title="State"
                                value={shippingAddress.state}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                            <input
                                type="text"
                                placeholder="Pincode"
                                title="Pincode"
                                value={shippingAddress.pincode}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                placeholder="Phone"
                                title="Phone"
                                value={shippingAddress.phone}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={() => handleBuyNow(watch)}
                            className="flex-1 bg-rose-600 text-white py-3 rounded-md hover:bg-rose-700 font-medium"
                        >
                            Continue to Payment
                        </button>
                        <button
                            onClick={() => setShowAddressModal(false)}
                            className="flex-1 border border-gray-300 py-3 rounded-md hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // Improved Negotiate Price Modal (responsive, accessible, professional)
    const NegotiateModal = () => {
        const dialogRef = useRef<HTMLDivElement | null>(null);
        const inputRef = useRef<HTMLInputElement | null>(null);
        const [localError, setLocalError] = useState<string>('');
        const basePrice = watch?.Price || 0;
        const suggestions = [5, 10, 15, 20]; // discount percentages

        useEffect(() => {
            // Focus input when opened
            if (showNegotiateModal && inputRef.current) {
                inputRef.current.focus();
            }
            // Escape key close
            const handleKey = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    setShowNegotiateModal(false);
                }
            };
            window.addEventListener('keydown', handleKey);
            return () => window.removeEventListener('keydown', handleKey);
        }, []);

        const applySuggestion = (pct: number) => {
            const suggested = Math.max(1, Math.floor(basePrice * (1 - pct / 100)));
            setProposedPrice(String(suggested));
            setLocalError('');
        };

        const validateInline = (val: string) => {
            if (!val) { setLocalError('Enter a value'); return; }
            const num = Number(val);
            if (isNaN(num)) { setLocalError('Not a number'); return; }
            if (num <= 0) { setLocalError('Must be positive'); return; }
            if (num >= basePrice) { setLocalError('Offer must be below current price'); return; }
            setLocalError('');
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setProposedPrice(e.target.value);
            validateInline(e.target.value);
        };

        const handleSubmit = async () => {
            if (localError) return;
            await submitNegotiation();
        };

        const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
                setShowNegotiateModal(false);
            }
        };

        return (
            <div
                className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
                role="dialog"
                aria-modal="true"
                onMouseDown={onBackdropClick}
            >
                <div
                    ref={dialogRef}
                    className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 p-6 animate-fadeIn scale-100 flex flex-col"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight text-gray-900">Negotiate Price</h2>
                            <p className="text-sm text-gray-500 mt-1">Suggest a fair offer below the current price.</p>
                        </div>
                        <button
                            onClick={() => setShowNegotiateModal(false)}
                            aria-label="Close negotiation modal"
                            className="text-gray-400 hover:text-gray-600 rounded p-1 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm text-gray-600">Current price</span>
                            <span className="text-lg font-bold text-rose-600">₹{basePrice.toLocaleString()}</span>
                        </div>
                        <div>
                            <label htmlFor="negOffer" className="block text-sm font-medium text-gray-700">Your offer (₹)</label>
                            <input
                                ref={inputRef}
                                id="negOffer"
                                type="number"
                                min={1}
                                max={Math.max(1, basePrice - 1)}
                                value={proposedPrice}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-base"
                                placeholder="e.g. {Math.floor(basePrice*0.9)}"
                            />
                            {localError && <p className="mt-1 text-xs text-red-600" role="alert">{localError}</p>}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-2">Quick suggestions</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map(pct => {
                                    const suggested = Math.max(1, Math.floor(basePrice * (1 - pct / 100)));
                                    const active = proposedPrice === String(suggested);
                                    return (
                                        <button
                                            key={pct}
                                            type="button"
                                            onClick={() => applySuggestion(pct)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                                        >
                                            -{pct}% (₹{suggested})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={submittingNeg || !!localError || !proposedPrice}
                                className="flex-1 inline-flex justify-center items-center bg-rose-600 disabled:bg-rose-300 text-white py-3 rounded-md font-medium shadow-sm hover:bg-rose-700 transition-colors"
                            >
                                {submittingNeg ? 'Submitting…' : 'Send Request'}
                            </button>
                            <button
                                onClick={() => setShowNegotiateModal(false)}
                                type="button"
                                className="flex-1 inline-flex justify-center items-center py-3 rounded-md border border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
                            >Cancel</button>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">We’ll notify you here when the seller responds. Approved offers automatically apply only for you.</p>
                    </div>
                </div>
            </div>
        );
    };

    if (!watch) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
                    {/* Add Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
                    >
                        <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="font-medium">Back</span>
                    </button>

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
                                        {approvedPrice && approvedPrice < (watch?.Price || 0) ? (
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-gray-500 line-through text-xl">₹{watch?.Price?.toLocaleString()}</span>
                                                <span className="text-3xl font-bold text-green-600">₹{approvedPrice.toLocaleString()}</span>
                                            </div>
                                        ) : (
                                            <span className="text-3xl font-bold text-rose-600">
                                                ₹{watch?.Price?.toLocaleString()}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span>SKU:</span>
                                            <span className="font-medium">{watch?.SKU}</span>
                                        </div>
                                        {negStatus !== 'none' && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${negStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : negStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {negStatus === 'pending' ? 'Negotiation pending' : negStatus === 'approved' ? 'Negotiation approved' : 'Negotiation rejected'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Section */}
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={() => {
                                            if (!currentUser) { toast.error('Please login to negotiate'); navigate('/login'); return; }
                                            setShowNegotiateModal(true);
                                        }}
                                        disabled={negStatus === 'pending'}
                                        className={`flex-1 min-w-[200px] py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border ${negStatus === 'pending' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-900'}`}
                                    >
                                        {negStatus === 'approved' ? 'Approved price applied' : negStatus === 'pending' ? 'Request Sent' : 'Negotiate Price'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!currentUser) {
                                                toast.error('Please login to continue');
                                                navigate('/login');
                                                return;
                                            }
                                            setShowCheckoutModal(true);
                                        }}
                                        className="flex-1 min-w-[200px] py-3 px-6 bg-rose-600 hover:bg-rose-700 
                                            text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        Buy Now
                                    </button>

                                    <button
                                        onClick={(e) => handleAddToCart(e, watch)}
                                        className="flex-1 min-w-[200px] py-3 px-6 bg-rose-600 hover:bg-rose-700 
                                            text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBagIcon className="w-5 h-5" />
                                        Add to Cart
                                    </button>

                                    <button
                                        aria-label="Toggle wishlist"
                                        title="Toggle wishlist"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleWishlist(watch?.id);
                                        }}
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

                    {/* Related Products Section */}
                    {relatedWatches.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold mb-6">More from {watch?.Company}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {relatedWatches.map((relatedWatch) => (
                                    <Link
                                        key={relatedWatch.id}
                                        to={`/details/${collectionName}/${relatedWatch.id}`}
                                    >
                                        <div className="group relative bg-gray-100 rounded-lg overflow-hidden border border-gray-300 hover:border-gray-400 transition-all duration-300">
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleWishlist(relatedWatch.id);
                                                    }}
                                                    className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 backdrop-blur-sm"
                                                >
                                                    {wishlist.includes(relatedWatch.id) ? (
                                                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                                                    ) : (
                                                        <HeartIcon className="w-5 h-5 text-gray-800" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleAddToCart(e, relatedWatch);
                                                    }}
                                                    className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 backdrop-blur-sm"
                                                >
                                                    <ShoppingBagIcon className="w-5 h-5 text-gray-800" />
                                                </button>
                                            </div>

                                            <div className="aspect-square overflow-hidden relative">
                                                <img
                                                    src={relatedWatch.Image || relatedWatch.images?.[0]}
                                                    alt={relatedWatch.Company}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>

                                            <div className="p-4 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-xl font-medium uppercase tracking-wide text-gray-900 truncate max-w-[70%]">
                                                        {relatedWatch.Company}
                                                    </h3>
                                                    <div className="flex items-center gap-1">
                                                        {renderRating(relatedWatch.rating || 0)}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-lg font-light">
                                                    Rs. {relatedWatch.Price?.toLocaleString()}
                                                </p>
                                                <p className="text-gray-500 text-sm line-clamp-2">
                                                    {relatedWatch.Description}
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleAddToCart(e, relatedWatch);
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
                    )}

                    {/* Similar Products Section - New Addition */}
                    {similarProducts.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold mb-6">More Products Like This</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {similarProducts.map((product) => (
                                    <Link
                                        key={product.id}
                                        to={`/${collectionName}/${product.id}`}
                                    >
                                        <div className="group relative bg-gray-100 rounded-lg overflow-hidden border border-gray-300 hover:border-gray-400 transition-all duration-300">
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleWishlist(product.id);
                                                    }}
                                                    className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 backdrop-blur-sm"
                                                >
                                                    {wishlist.includes(product.id) ? (
                                                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                                                    ) : (
                                                        <HeartIcon className="w-5 h-5 text-gray-800" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleAddToCart(e, product);
                                                    }}
                                                    className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 backdrop-blur-sm"
                                                >
                                                    <ShoppingBagIcon className="w-5 h-5 text-gray-800" />
                                                </button>
                                            </div>

                                            <div className="aspect-square overflow-hidden relative">
                                                <img
                                                    src={product.Image || product.images?.[0]}
                                                    alt={product.Company}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>

                                            <div className="p-4 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-xl font-medium uppercase tracking-wide text-gray-900 truncate max-w-[70%]">
                                                        {product.Company}
                                                    </h3>
                                                    <div className="flex items-center gap-1">
                                                        {renderRating(product.rating || 0)}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-lg font-light">
                                                    Rs. {product.Price?.toLocaleString()}
                                                </p>
                                                <p className="text-gray-500 text-sm line-clamp-2">
                                                    {product.Description}
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleAddToCart(e, product);
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
                    )}
                </div>
            </div >

            {/* Move modals outside the main content wrapper */}
            {showCheckoutModal && (
                <div className="fixed inset-0 z-50">
                    <CheckoutFlow
                        product={watch}
                        onClose={() => setShowCheckoutModal(false)}
                    />
                </div>
            )}

            {showAddressModal && <AddressModal />}
            {showNegotiateModal && <NegotiateModal />}
        </>
    );
};

export default Detail;