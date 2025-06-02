import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../pages/firebase';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import {
    CheckIcon,
    PlusIcon,
    InboxIcon,
    TruckIcon,
    ShieldCheckIcon,
    CreditCardIcon,
    ClockIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface CheckoutFlowProps {
    product: any;
    onClose: () => void;
}

const DELIVERY_FEE = 0;

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ product, onClose }) => {
    const [step, setStep] = useState(1);
    // Initialize as an empty array
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isNewAddress, setIsNewAddress] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Calculate delivery date (5 days from now)
    const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString();

    // Calculate order summary
    const orderSummary = {
        subtotal: product.Price,
        shipping: DELIVERY_FEE,
        total: product.Price + DELIVERY_FEE
    };

    useEffect(() => {
        const fetchAddresses = async () => {
            if (currentUser?.email) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.email));
                    const userData = userDoc.data();
                    // Ensure we're setting an array of addresses
                    if (userData?.addresses?.shipping) {
                        // Convert single shipping address to array format
                        setAddresses([{
                            name: `${userData.personalInfo?.firstName || ''} ${userData.personalInfo?.lastName || ''}`.trim(),
                            address: userData.addresses.shipping.street,
                            city: userData.addresses.shipping.city,
                            state: userData.addresses.shipping.state,
                            pincode: userData.addresses.shipping.postalCode,
                            phone: userData.contact?.phoneNumber
                        }]);
                    } else {
                        setAddresses([]); // Set empty array if no addresses found
                    }
                } catch (error) {
                    console.error('Error fetching addresses:', error);
                    toast.error('Error loading addresses');
                    setAddresses([]); // Set empty array on error
                }
            }
        };
        fetchAddresses();
    }, [currentUser]);

    const handlePayment = async (method) => {
        if (method === 'cod') {
            await createOrder('cod', null);
            navigate('/order-success');
        } else {
            const options = {
                key: 'rzp_test_T5M2JyEgw9JAXJ',
                amount: orderSummary.total * 100,
                currency: 'INR',
                name: 'Watch Store',
                description: `Purchase of ${product.Company} ${product.Model}`,
                image: product.Image,
                handler: async (response) => {
                    await createOrder('online', response.razorpay_payment_id);
                    navigate('/order-success');
                },
                prefill: {
                    name: currentUser.displayName,
                    email: currentUser.email,
                    contact: selectedAddress?.phone
                },
                theme: { color: '#E11D48' }
            };

            const razorpayInstance = new window.Razorpay(options);
            razorpayInstance.open();
        }
    };

    const createOrder = async (paymentMethod, paymentId) => {
        const orderData = {
            userId: currentUser.email,
            productId: product.id,
            quantity: 1,
            amount: orderSummary.total,
            paymentMethod,
            paymentId,
            shippingAddress: selectedAddress,
            status: paymentMethod === 'cod' ? 'pending' : 'paid',
            orderDate: new Date(),
            expectedDelivery: deliveryDate
        };

        const orderId = paymentId || `order_${Date.now()}`;
        await setDoc(doc(db, 'orders', orderId), orderData);
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((number) => (
                <div key={number} className="flex items-center">
                    <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= number ? 'bg-rose-600 text-white' : 'bg-gray-200'
                        }`}>
                        {number}
                    </div>
                    {number < 3 && (
                        <div className={`h-1 w-12 ${step > number ? 'bg-rose-600' : 'bg-gray-200'
                            }`} />
                    )}
                </div>
            ))}
        </div>
    );

    const renderProductSummary = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Image Gallery */}
                    <div className="w-full md:w-1/3">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img
                                src={product.images?.[0] || product.Image}
                                alt={`${product.Company} ${product.Model}`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder-watch.png'; // Add a placeholder image
                                }}
                            />
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="w-full md:w-2/3 space-y-4">
                        <h3 className="text-xl font-medium">{product.Company} {product.Model}</h3>
                        <p className="text-gray-600">{product.Description}</p>

                        {/* Product Specifications */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {product.Movement && (
                                <div>
                                    <span className="text-gray-500">Movement:</span>
                                    <span className="ml-2">{product.Movement}</span>
                                </div>
                            )}
                            {product.Glass && (
                                <div>
                                    <span className="text-gray-500">Glass:</span>
                                    <span className="ml-2">{product.Glass}</span>
                                </div>
                            )}
                            {product.WaterResistance && (
                                <div>
                                    <span className="text-gray-500">Water Resistance:</span>
                                    <span className="ml-2">{product.WaterResistance}</span>
                                </div>
                            )}
                            {product.Warranty && (
                                <div>
                                    <span className="text-gray-500">Warranty:</span>
                                    <span className="ml-2">{product.Warranty}</span>
                                </div>
                            )}
                        </div>

                        {/* Price and Stock */}
                        <div className="flex items-center gap-4 pt-4">
                            <span className="text-3xl font-semibold">₹{product.Price?.toLocaleString()}</span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                In Stock
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setStep(2)}
                className="w-full bg-rose-600 text-white py-4 rounded-lg font-medium hover:bg-rose-700 
                    transition-colors flex items-center justify-center gap-2"
            >
                <TruckIcon className="w-5 h-5" />
                Continue to Shipping
            </button>
        </div>
    );

    // Update the renderAddressSelection function with a new address form and better navigation
    const renderAddressSelection = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Select Delivery Address</h2>

            {/* Address List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {addresses.length > 0 ? (
                    addresses.map((address, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedAddress(address)}
                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-rose-300 hover:shadow-sm ${selectedAddress === address
                                ? 'border-rose-500 bg-rose-50 shadow-sm'
                                : 'border-gray-200'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-gray-900">{address.name}</p>
                                    <p className="text-gray-600 mt-1">{address.address}</p>
                                    <p className="text-gray-600">
                                        {address.city}, {address.state} {address.pincode}
                                    </p>
                                    <p className="text-gray-600 mt-1">{address.phone}</p>
                                </div>
                                {selectedAddress === address && (
                                    <div className="bg-rose-500 text-white p-2 rounded-full">
                                        <CheckIcon className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <InboxIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No saved addresses found</p>
                        <p className="text-gray-400 text-sm">Add a new address to continue</p>
                    </div>
                )}
            </div>

            {/* Add New Address Button */}
            <button
                onClick={() => setIsNewAddress(true)}
                className="w-full border-2 border-dashed border-gray-300 p-4 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
                <PlusIcon className="w-5 h-5 text-gray-400 group-hover:text-rose-500" />
                <span className="text-gray-600 group-hover:text-rose-600">Add New Address</span>
            </button>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4 border-t">
                <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                    Back
                </button>
                <button
                    onClick={() => setStep(3)}
                    disabled={!selectedAddress}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200
                        ${selectedAddress
                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                    Continue to Payment
                </button>
            </div>
        </div>
    );

    const renderPaymentOptions = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Payment Method</h2>
            <div className="space-y-4">
                {/* Order Summary */}
                <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Order Details</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Product Price</span>
                            <span>₹{orderSummary.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span className="text-green-600">Free</span>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t">
                            <span>Total</span>
                            <span>₹{orderSummary.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Button */}
                <button
                    onClick={() => handlePayment('online')}
                    className="w-full bg-rose-600 text-white p-4 rounded-lg font-medium hover:bg-rose-700 
                    transition-colors flex items-center justify-center gap-2"
                >
                    <CreditCardIcon className="w-5 h-5" />
                    Pay Securely with Razorpay
                </button>

                {/* Security Info */}
                <div className="text-center text-sm text-gray-500 mt-4">
                    <div className="flex items-center justify-center gap-2">
                        <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                        <span>Your payment is secure and encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-50 overflow-y-auto">  {/* Changed from min-h-screen to fixed inset-0 */}
            {/* Header - Keep it sticky */}
            <header className="sticky top-0 z-30 bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2" />
                            <span className="hidden sm:inline">Back to Cart</span>
                        </button>
                        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Secure Checkout</h1>
                        <div className="w-12 sm:w-24"></div>
                    </div>
                </div>
            </header>

            {/* Main Content - Add proper padding for header */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-8">
                        {/* Progress Steps - Make it scrollable on mobile */}
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm overflow-x-auto">
                            <div className="min-w-[300px]">
                                {renderStepIndicator()}
                            </div>
                        </div>

                        {/* Current Step Content */}
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                            {step === 1 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                                        <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span>Estimated Delivery: {deliveryDate}</span>
                                    </div>
                                    {renderProductSummary()}
                                </div>
                            )}
                            {step === 2 && renderAddressSelection()}
                            {step === 3 && renderPaymentOptions()}
                        </div>

                        {/* Trust Badges - Stack on mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-green-600 mb-2" />
                                <p className="text-xs sm:text-sm text-gray-600">Secure Payment</p>
                            </div>
                            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                <TruckIcon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-blue-600 mb-2" />
                                <p className="text-xs sm:text-sm text-gray-600">Free Shipping</p>
                            </div>
                            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-purple-600 mb-2" />
                                <p className="text-xs sm:text-sm text-gray-600">24/7 Support</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar - Make it sticky but float on mobile */}
                    <div className="lg:col-span-1 order-first lg:order-last mb-4 lg:mb-0">
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm lg:sticky lg:top-24">
                            <h2 className="text-base sm:text-lg font-semibold mb-4">Order Summary</h2>

                            {/* Product Summary - Improve mobile layout */}
                            <div className="border-b pb-4 mb-4">
                                <div className="flex gap-3 sm:gap-4">
                                    <img
                                        src={product.Image}
                                        alt={product.Company}
                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
                                    />
                                    <div>
                                        <h3 className="font-medium text-sm sm:text-base">{product.Company}</h3>
                                        <p className="text-xs sm:text-sm text-gray-600">{product.Model}</p>
                                        <p className="text-rose-600 font-medium mt-1 text-sm sm:text-base">
                                            ₹{product.Price?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Price Breakdown - Adjust text sizes */}
                            <div className="space-y-2 text-xs sm:text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>₹{orderSummary.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span>₹{orderSummary.total.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        (Inclusive of all taxes)
                                    </p>
                                </div>
                            </div>

                            {/* Delivery Info - Adjust spacing */}
                            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                    <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Free delivery by {deliveryDate}</span>
                                </div>
                            </div>

                            {/* Support Info - Hide on smaller screens */}
                            <div className="hidden sm:block mt-4 sm:mt-6 pt-4 sm:pt-6 border-t text-xs sm:text-sm text-gray-600">
                                <p>Need Help?</p>
                                <a href="#" className="text-rose-600 hover:text-rose-700">
                                    Contact Customer Support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add bottom padding to ensure content isn't hidden behind sticky elements */}
            <div className="h-24"></div>
        </div>
    );
};

export default CheckoutFlow;