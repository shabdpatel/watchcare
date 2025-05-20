import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon, EnvelopeIcon, LockClosedIcon, PhotoIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../pages/firebase';

const Profile = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchUserData() {
            if (!currentUser) return;

            try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.email));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            } catch (err) {
                setError('Failed to fetch user data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [currentUser]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Profile Header */}
                    <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <UserCircleIcon className="h-16 w-16 text-white/80" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {userData?.personalInfo?.displayName || userData?.personalInfo?.firstName + ' ' + userData?.personalInfo?.lastName}
                                </h1>
                                <p className="text-blue-100">{currentUser?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="p-6 space-y-8">
                        {/* Personal Information */}
                        <section>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                                    <p className="mt-1 text-gray-900">
                                        {userData?.personalInfo?.firstName} {userData?.personalInfo?.lastName}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                                    <p className="mt-1 text-gray-900">{userData?.personalInfo?.dateOfBirth}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Gender</label>
                                    <p className="mt-1 text-gray-900">{userData?.personalInfo?.gender}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Occupation</label>
                                    <p className="mt-1 text-gray-900">{userData?.personalInfo?.occupation || 'Not specified'}</p>
                                </div>
                            </div>
                        </section>

                        {/* Contact Information */}
                        <section>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="mt-1 text-gray-900">{userData?.contact?.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                                    <p className="mt-1 text-gray-900">{userData?.contact?.phoneNumber}</p>
                                </div>
                            </div>
                        </section>

                        {/* Shipping Address */}
                        <section>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900">
                                    {userData?.addresses?.shipping?.street}
                                    {userData?.addresses?.shipping?.apartment && `, ${userData.addresses.shipping.apartment}`}<br />
                                    {userData?.addresses?.shipping?.city}, {userData?.addresses?.shipping?.state} {userData?.addresses?.shipping?.postalCode}<br />
                                    {userData?.addresses?.shipping?.country}
                                </p>
                            </div>
                        </section>

                        {/* Billing Address */}
                        <section>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                {userData?.addresses?.billing?.sameAsShipping ? (
                                    <p className="text-gray-600">Same as shipping address</p>
                                ) : (
                                    <p className="text-gray-900">
                                        {userData?.addresses?.billing?.street}
                                        {userData?.addresses?.billing?.apartment && `, ${userData.addresses.billing.apartment}`}<br />
                                        {userData?.addresses?.billing?.city}, {userData?.addresses?.billing?.state} {userData?.addresses?.billing?.postalCode}<br />
                                        {userData?.addresses?.billing?.country}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Preferences */}
                        <section>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Language</label>
                                    <p className="mt-1 capitalize text-gray-900">{userData?.preferences?.language}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Currency</label>
                                    <p className="mt-1 text-gray-900">{userData?.preferences?.currency}</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <p className="text-sm text-gray-600">
                                    {userData?.preferences?.newsletter && '✓ Subscribed to newsletter'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {userData?.preferences?.smsNotifications && '✓ SMS notifications enabled'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {userData?.preferences?.emailNotifications && '✓ Email notifications enabled'}
                                </p>
                            </div>
                        </section>

                        <div className="border-t pt-6">
                            <button
                                onClick={handleLogout}
                                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;