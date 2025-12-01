import React, { useState, useEffect } from 'react';
import { ensureRazorpayKey } from '../config/payments';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../components/AuthContext';
import { toast } from 'react-toastify';
import { doc, setDoc, getDoc, writeBatch, increment } from 'firebase/firestore';
import { db } from '../pages/firebase';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isNewAddress, setIsNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: ''
    });

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (currentUser?.email) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.email));
                    const userData = userDoc.data();
                    if (userData?.addresses?.shipping) {
                        setAddresses([{
                            name: `${userData.personalInfo?.firstName || ''} ${userData.personalInfo?.lastName || ''}`.trim(),
                            address: userData.addresses.shipping.street,
                            city: userData.addresses.shipping.city,
                            state: userData.addresses.shipping.state,
                            pincode: userData.addresses.shipping.postalCode,
                            phone: userData.contact?.phoneNumber
                        }]);
                    } else {
                        setAddresses([]);
                    }
                } catch (error) {
                    console.error('Error fetching addresses:', error);
                    toast.error('Error loading addresses');
                }
            }
        };
        fetchAddresses();
    }, [currentUser]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => {
                script.remove();
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handleAddAddress = async () => {
        if (!currentUser?.email) {
            toast.error('Please login to continue');
            return;
        }

        try {
            const userRef = doc(db, 'users', currentUser.email);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data() || {};

            const newAddressData = {
                shipping: {
                    street: newAddress.address,
                    city: newAddress.city,
                    state: newAddress.state,
                    postalCode: newAddress.pincode
                }
            };

            await setDoc(userRef, {
                ...userData,
                addresses: newAddressData,
                personalInfo: {
                    ...userData.personalInfo,
                    firstName: newAddress.name.split(' ')[0],
                    lastName: newAddress.name.split(' ').slice(1).join(' ')
                },
                contact: {
                    ...userData.contact,
                    phoneNumber: newAddress.phone
                }
            }, { merge: true });

            setAddresses([...addresses, newAddress]);
            setSelectedAddress(newAddress);
            setIsNewAddress(false);
            toast.success('Address added successfully');
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error('Failed to add address');
        }
    };

    const handleCheckout = async () => {
        if (!currentUser) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }

        if (!selectedAddress) {
            toast.error('Please select a delivery address');
            return;
        }

        try {
            setLoading(true);

            // Load Razorpay script
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                throw new Error('Failed to load payment gateway');
            }

            const options = {
                key: ensureRazorpayKey(),
                amount: (total + (total * 0.18)) * 100,
                currency: 'INR',
                name: 'Watch Store',
                description: `Purchase of ${cartItems.length} items`,
                handler: async (response) => {
                    try {
                        if (response.razorpay_payment_id) {
                            await createOrder('online', response.razorpay_payment_id);
                            navigate('/order-success');
                        } else {
                            throw new Error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment processing error:', error);
                        toast.error('Failed to process payment. Please try again.');
                    }
                },
                prefill: {
                    name: selectedAddress.name || '',
                    email: currentUser.email || '',
                    contact: selectedAddress.phone || ''
                },
                theme: { color: '#E11D48' }
            };

            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Checkout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const createOrder = async (paymentMethod: string, paymentId: string | null) => {
        if (!currentUser?.email) {
            throw new Error('User not authenticated');
        }

        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const batch = writeBatch(db);

        try {
            // Get user's shipping address
            const userDoc = await getDoc(doc(db, 'users', currentUser.email));
            const userData = userDoc.data();
            const shippingAddress = userData?.addresses?.shipping;

            // Create order data with detailed product information
            const orderData = {
                id: orderId,
                userId: currentUser.email.toLowerCase(),
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    image: item.image,
                    category: item.category || 'watches',
                    Company: item.Company || item.name,
                    Model: item.Model || '',
                    Description: item.Description || '',
                    // Include any additional product details available
                    Color: item.Color || '',
                    Material: item.Material || '',
                    Warranty: item.Warranty || ''
                })),
                amount: total + (total * 0.18),
                tax: total * 0.18,
                shipping: 0,
                status: paymentMethod === 'cod' ? 'pending' : 'paid',
                orderDate: new Date(),
                paymentMethod,
                paymentId,
                shippingAddress
            };

            // Add order document
            const orderRef = doc(db, 'orders', orderId);
            batch.set(orderRef, orderData);

            // Update user's orders array
            const userRef = doc(db, 'users', currentUser.email.toLowerCase());
            batch.update(userRef, {
                orders: increment(1)
            });

            // Update product stocks
            for (const item of cartItems) {
                if (!item.category) {
                    console.warn(`Skipping stock update for item ${item.id} due to missing category`);
                    continue;
                }

                const productRef = doc(db, item.category, item.id);
                const productDoc = await getDoc(productRef);

                if (productDoc.exists()) {
                    batch.update(productRef, {
                        Stock_Number: increment(-item.quantity)
                    });
                } else {
                    console.warn(`Product document not found: ${item.category}/${item.id}`);
                }
            }

            // Commit the batch
            await batch.commit();
            return true;
        } catch (error) {
            console.error('Order creation error:', error);
            throw error;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold">Shopping Cart ({totalItems} items)</h1>
                    <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm">
                        Continue Shopping
                    </Link>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow">
                        <img
                            src="/empty-cart.svg"
                            alt="Empty Cart"
                            className="w-48 h-48 mx-auto mb-6"
                        />
                        <h2 className="text-2xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet</p>
                        <Link
                            to="/all_watches"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
                                    <Link to={`/details/${item.category}/${item.id}`}>
                                        <div className="flex p-4 cursor-pointer">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-24 h-24 object-cover rounded-md"
                                            />
                                            <div className="ml-4 flex-1">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Category: {item.category}
                                                            {item.size && ` • Size: ${item.size}`}
                                                            {item.color && ` • Color: ${item.color}`}
                                                        </p>
                                                    </div>
                                                    <p className="text-lg font-medium text-gray-900">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 rounded-full hover:bg-gray-100"
                                                disabled={item.quantity <= 1}
                                            >
                                                <MinusIcon className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 rounded-full hover:bg-gray-100"
                                            >
                                                <PlusIcon className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
                                        >
                                            <XMarkIcon className="w-5 h-5 mr-1" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                                <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                                        <span>{formatPrice(total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping Estimate</span>
                                        <span>{formatPrice(0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax Estimate</span>
                                        <span>{formatPrice(total * 0.18)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                        <div className="flex justify-between font-medium">
                                            <span>Order Total</span>
                                            <span>{formatPrice(total + (total * 0.18))}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Selection */}
                                <div className="mt-4 border-t pt-4">
                                    <h3 className="text-sm font-medium mb-2">Delivery Address</h3>
                                    {addresses.map((address, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedAddress(address)}
                                            className={`border rounded-lg p-3 mb-2 cursor-pointer ${selectedAddress === address ? 'border-rose-500 bg-rose-50' : ''
                                                }`}
                                        >
                                            <p className="font-medium">{address.name}</p>
                                            <p className="text-sm text-gray-600">{address.address}</p>
                                            <p className="text-sm text-gray-600">
                                                {address.city}, {address.state} {address.pincode}
                                            </p>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setIsNewAddress(true)}
                                        className="text-rose-600 text-sm font-medium mt-2"
                                    >
                                        + Add New Address
                                    </button>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={loading || cartItems.length === 0 || !selectedAddress}
                                    className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 
                                        transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex 
                                        items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        'Proceed to Checkout'
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Shipping & taxes calculated at checkout
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* New Address Modal */}
            {isNewAddress && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Add New Address</h3>
                            <button onClick={() => setIsNewAddress(false)} className="text-gray-500">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleAddAddress();
                        }} className="space-y-4">
                            {/* Address form fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newAddress.name}
                                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    required
                                    value={newAddress.address}
                                    onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">State</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">PIN Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAddress.pincode}
                                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newAddress.phone}
                                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-rose-600 text-white py-2 rounded-md hover:bg-rose-700"
                                >
                                    Save Address
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsNewAddress(false)}
                                    className="flex-1 border border-gray-300 py-2 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;