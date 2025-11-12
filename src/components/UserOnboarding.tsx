import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../pages/firebase';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const UserOnboarding = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const [formData, setFormData] = useState({
        personalInfo: {
            firstName: '',
            lastName: '',
            displayName: '',
            dateOfBirth: '',
            gender: '',
            occupation: ''
        },
        contact: {
            email: currentUser?.email || '',
            phoneNumber: '',
            alternatePhone: ''
        },
        addresses: {
            shipping: {
                street: '',
                apartment: '',
                city: '',
                state: '',
                postalCode: '',
                country: ''
            },
            billing: {
                sameAsShipping: true,
                street: '',
                apartment: '',
                city: '',
                state: '',
                postalCode: '',
                country: ''
            }
        },
        preferences: {
            newsletter: false,
            smsNotifications: false,
            emailNotifications: false,
            language: 'english',
            currency: 'USD'
        },
        socialMedia: {
            facebook: '',
            twitter: '',
            instagram: ''
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const fields = name.split('.');

        setFormData(prev => {
            const newData = { ...prev } as any; // TODO: refine deep type without feature changes
            let current = newData as any;

            for (let i = 0; i < fields.length - 1; i++) {
                current = current[fields[i]];
            }

            current[fields[fields.length - 1]] = type === 'checkbox' ? checked : value;

            if (name === 'addresses.billing.sameAsShipping' && checked) {
                newData.addresses.billing = {
                    ...newData.addresses.shipping,
                    sameAsShipping: true
                };
            }

            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!currentUser?.email) {
                throw new Error('No authenticated user found');
            }

            // Create user data object with all form data
            const userData = {
                ...formData,
                userId: currentUser.uid,
                email: currentUser.email.toLowerCase(), // Ensure email is lowercase
                updatedAt: new Date().toISOString(),
                onboardingCompleted: true,
                createdAt: new Date().toISOString()
            };

            // Save to Firestore
            const userRef = doc(db, 'users', currentUser.email.toLowerCase());
            await setDoc(userRef, userData, { merge: true }); // Add merge option

            // Show success message
            toast.success('Profile completed successfully!');

            // Add a small delay before navigation
            setTimeout(() => {
                // Force a page reload instead of using navigate
                window.location.href = '/profile';
            }, 1000);

        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Failed to save profile information. Please try again.');
            toast.error('Failed to save profile information');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-center">
                        <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
                        <p className="text-blue-100">Help us personalize your experience</p>
                    </div>

                    <div className="p-8 space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 rounded-lg flex items-center gap-3">
                                <svg className="w-5 h-5 text-red-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-700 font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Information */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            name="personalInfo.firstName"
                                            value={formData.personalInfo.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            name="personalInfo.lastName"
                                            value={formData.personalInfo.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
                                        <input
                                            type="text"
                                            name="personalInfo.displayName"
                                            value={formData.personalInfo.displayName}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                                        <input
                                            type="date"
                                            name="personalInfo.dateOfBirth"
                                            value={formData.personalInfo.dateOfBirth}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                                        <select
                                            name="personalInfo.gender"
                                            value={formData.personalInfo.gender}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                                        <input
                                            type="text"
                                            name="personalInfo.occupation"
                                            value={formData.personalInfo.occupation}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Contact Information */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="contact.phoneNumber"
                                            value={formData.contact.phoneNumber}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                                        <input
                                            type="tel"
                                            name="contact.alternatePhone"
                                            value={formData.contact.alternatePhone}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Shipping Address */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                                <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                                        <input
                                            type="text"
                                            name="addresses.shipping.street"
                                            value={formData.addresses.shipping.street}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Apartment/Suite</label>
                                        <input
                                            type="text"
                                            name="addresses.shipping.apartment"
                                            value={formData.addresses.shipping.apartment}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                            <input
                                                type="text"
                                                name="addresses.shipping.city"
                                                value={formData.addresses.shipping.city}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                            <input
                                                type="text"
                                                name="addresses.shipping.state"
                                                value={formData.addresses.shipping.state}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                                            <input
                                                type="text"
                                                name="addresses.shipping.postalCode"
                                                value={formData.addresses.shipping.postalCode}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                                            <input
                                                type="text"
                                                name="addresses.shipping.country"
                                                value={formData.addresses.shipping.country}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Billing Address */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Billing Address</h2>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            name="addresses.billing.sameAsShipping"
                                            checked={formData.addresses.billing.sameAsShipping}
                                            onChange={handleChange}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        Same as shipping address
                                    </label>
                                </div>
                                {!formData.addresses.billing.sameAsShipping && (
                                    <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                                            <input
                                                type="text"
                                                name="addresses.billing.street"
                                                value={formData.addresses.billing.street}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Apartment/Suite</label>
                                            <input
                                                type="text"
                                                name="addresses.billing.apartment"
                                                value={formData.addresses.billing.apartment}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                                <input
                                                    type="text"
                                                    name="addresses.billing.city"
                                                    value={formData.addresses.billing.city}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                                <input
                                                    type="text"
                                                    name="addresses.billing.state"
                                                    value={formData.addresses.billing.state}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                                                <input
                                                    type="text"
                                                    name="addresses.billing.postalCode"
                                                    value={formData.addresses.billing.postalCode}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                                                <input
                                                    type="text"
                                                    name="addresses.billing.country"
                                                    value={formData.addresses.billing.country}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                            {/* Preferences */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                                        <legend className="text-sm font-medium text-gray-700 mb-2">Communication Preferences</legend>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    name="preferences.newsletter"
                                                    checked={formData.preferences.newsletter}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">Subscribe to newsletter</span>
                                            </label>
                                            {/* Add other checkboxes similarly */}
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="preferences.smsNotifications"
                                                    checked={formData.preferences.smsNotifications}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label className="ml-2 block text-sm text-gray-700">
                                                    SMS notifications
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="preferences.emailNotifications"
                                                    checked={formData.preferences.emailNotifications}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label className="ml-2 block text-sm text-gray-700">
                                                    Email notifications
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                            <select
                                                name="preferences.language"
                                                value={formData.preferences.language}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                            >
                                                <option value="english">English</option>
                                                <option value="spanish">Spanish</option>
                                                <option value="french">French</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                            <select
                                                name="preferences.currency"
                                                value={formData.preferences.currency}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                            >
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Social Media */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Social Media <span className="text-gray-500 text-sm font-normal">(Optional)</span></h2>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                    {/* Social media inputs with labels */}
                                    <input
                                        type="url"
                                        name="socialMedia.facebook"
                                        value={formData.socialMedia.facebook}
                                        onChange={handleChange}
                                        placeholder="Facebook Profile URL"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <input
                                        type="url"
                                        name="socialMedia.twitter"
                                        value={formData.socialMedia.twitter}
                                        onChange={handleChange}
                                        placeholder="Twitter Profile URL"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <input
                                        type="url"
                                        name="socialMedia.instagram"
                                        value={formData.socialMedia.instagram}
                                        onChange={handleChange}
                                        placeholder="Instagram Profile URL"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>
                            </section>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Saving...</span>
                                    </div>
                                ) : (
                                    'Complete Profile'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserOnboarding;