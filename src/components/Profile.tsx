import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    ArrowPathIcon,
    EnvelopeIcon,
    LockClosedIcon,
    PhotoIcon,
    UserCircleIcon,
    MapPinIcon,
    PhoneIcon,
    GlobeAltIcon,
    BellIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../pages/firebase';
import { toast } from 'react-toastify';

const ProfileSection = ({ title, children, icon: Icon, onEdit }) => (
    <section className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
                <Icon className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
            )}
        </div>
        {children}
    </section>
);

const InfoField = ({ label, value }) => (
    <div className="animate-fadeIn">
        <label className="text-sm font-medium text-gray-500">{label}</label>
        <p className="mt-1 text-gray-900 font-medium">{value || 'Not specified'}</p>
    </div>
);

const EditField = ({ label, value, name, type = "text", onChange }) => (
    <div className="animate-fadeIn">
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);

const Profile = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);

    useEffect(() => {
        async function fetchUserData() {
            if (!currentUser?.email) return;

            try {
                setLoading(true);
                const userDoc = await getDoc(doc(db, 'users', currentUser.email));

                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                } else {
                    setError('User profile not found');
                    toast.error('User profile not found');
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to fetch user data');
                toast.error('Failed to fetch user data');
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Error logging out:', err);
            toast.error('Failed to log out');
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedData(userData);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData(null);
    };

    const handleSave = async () => {
        try {
            const userDocRef = doc(db, 'users', currentUser.email);
            await updateDoc(userDocRef, editedData);
            setUserData(editedData);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (err) {
            console.error('Error updating profile:', err);
            toast.error('Failed to update profile');
        }
    };

    const handleFieldChange = (fieldPath, value) => {
        setEditedData(prev => {
            const newData = { ...prev };
            const paths = fieldPath.split('.');
            let current = newData;

            for (let i = 0; i < paths.length - 1; i++) {
                if (!current[paths[i]]) {
                    current[paths[i]] = {};
                }
                current = current[paths[i]];
            }
            current[paths[paths.length - 1]] = value;
            return newData;
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="text-blue-600 font-medium">Loading your profile...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                    <div className="px-8 py-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <UserCircleIcon className="h-24 w-24 text-white/90" />
                                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg">
                                    <PhotoIcon className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl font-bold">
                                    {userData?.personalInfo?.displayName ||
                                        `${userData?.personalInfo?.firstName} ${userData?.personalInfo?.lastName}`}
                                </h1>
                                <p className="text-blue-100 flex items-center space-x-2">
                                    <EnvelopeIcon className="h-5 w-5" />
                                    <span>{currentUser?.email}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileSection
                        title="Personal Information"
                        icon={UserCircleIcon}
                        onEdit={() => {
                            setIsEditing(true);
                            setEditedData(userData);
                        }}
                    >
                        {isEditing ? (
                            <div className="grid grid-cols-1 gap-4">
                                <EditField
                                    label="First Name"
                                    name="personalInfo.firstName"
                                    value={editedData?.personalInfo?.firstName}
                                    onChange={(name, value) => setEditedData({
                                        ...editedData,
                                        personalInfo: { ...editedData.personalInfo, firstName: value }
                                    })}
                                />
                                <EditField
                                    label="Last Name"
                                    name="personalInfo.lastName"
                                    value={editedData?.personalInfo?.lastName}
                                    onChange={(name, value) => setEditedData({
                                        ...editedData,
                                        personalInfo: { ...editedData.personalInfo, lastName: value }
                                    })}
                                />
                                <EditField
                                    label="Date of Birth"
                                    value={editedData?.personalInfo?.dateOfBirth}
                                    name="personalInfo.dateOfBirth"  // Changed from dateOfBirth to personalInfo.dateOfBirth
                                    type="date"
                                    onChange={handleFieldChange}
                                />
                                <div className="animate-fadeIn">
                                    <label className="block text-sm font-medium text-gray-500">Gender</label>
                                    <select
                                        value={editedData?.personalInfo?.gender || ''}
                                        onChange={(e) => handleFieldChange('personalInfo.gender', e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                                <EditField
                                    label="Occupation"
                                    value={editedData?.personalInfo?.occupation}
                                    name="personalInfo.occupation"  // Changed from occupation to personalInfo.occupation
                                    onChange={handleFieldChange}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                <InfoField
                                    label="Full Name"
                                    value={`${userData?.personalInfo?.firstName} ${userData?.personalInfo?.lastName}`}
                                />
                                <InfoField
                                    label="Date of Birth"
                                    value={userData?.personalInfo?.dateOfBirth}
                                />
                                <InfoField
                                    label="Gender"
                                    value={userData?.personalInfo?.gender}
                                />
                                <InfoField
                                    label="Occupation"
                                    value={userData?.personalInfo?.occupation}
                                />
                            </div>
                        )}
                    </ProfileSection>

                    <ProfileSection
                        title="Contact Information"
                        icon={PhoneIcon}
                        onEdit={handleEdit}
                    >
                        <div className="grid grid-cols-1 gap-4">
                            {isEditing ? (
                                <>
                                    <EditField
                                        label="Email"
                                        value={editedData?.contact?.email}
                                        name="contact.email"
                                        type="email"
                                        onChange={handleFieldChange}
                                    />
                                    <EditField
                                        label="Phone Number"
                                        value={editedData?.contact?.phoneNumber}
                                        name="contact.phoneNumber"
                                        type="tel"
                                        onChange={handleFieldChange}
                                    />
                                </>
                            ) : (
                                <>
                                    <InfoField label="Email" value={userData?.contact?.email} />
                                    <InfoField label="Phone Number" value={userData?.contact?.phoneNumber} />
                                </>
                            )}
                        </div>
                    </ProfileSection>

                    <ProfileSection
                        title="Shipping Address"
                        icon={MapPinIcon}
                        onEdit={handleEdit}
                    >
                        {isEditing ? (
                            <div className="grid grid-cols-1 gap-4">
                                <EditField
                                    label="Street Address"
                                    value={editedData?.addresses?.shipping?.street}
                                    name="addresses.shipping.street"
                                    onChange={handleFieldChange}
                                />
                                <EditField
                                    label="Apartment/Suite"
                                    value={editedData?.addresses?.shipping?.apartment}
                                    name="addresses.shipping.apartment"
                                    onChange={handleFieldChange}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <EditField
                                        label="City"
                                        value={editedData?.addresses?.shipping?.city}
                                        name="addresses.shipping.city"
                                        onChange={handleFieldChange}
                                    />
                                    <EditField
                                        label="State"
                                        value={editedData?.addresses?.shipping?.state}
                                        name="addresses.shipping.state"
                                        onChange={handleFieldChange}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <EditField
                                        label="Postal Code"
                                        value={editedData?.addresses?.shipping?.postalCode}
                                        name="addresses.shipping.postalCode"
                                        onChange={handleFieldChange}
                                    />
                                    <EditField
                                        label="Country"
                                        value={editedData?.addresses?.shipping?.country}
                                        name="addresses.shipping.country"
                                        onChange={handleFieldChange}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900 leading-relaxed">
                                    {userData?.addresses?.shipping?.street}
                                    {userData?.addresses?.shipping?.apartment && `, ${userData.addresses.shipping.apartment}`}<br />
                                    {userData?.addresses?.shipping?.city}, {userData?.addresses?.shipping?.state} {userData?.addresses?.shipping?.postalCode}<br />
                                    {userData?.addresses?.shipping?.country}
                                </p>
                            </div>
                        )}
                    </ProfileSection>

                    <ProfileSection
                        title="Preferences"
                        icon={GlobeAltIcon}
                        onEdit={handleEdit}
                    >
                        <div className="space-y-4">
                            {isEditing ? (
                                <div className="grid grid-cols-1 gap-4">
                                    <EditField
                                        label="Language"
                                        value={editedData?.preferences?.language}
                                        name="preferences.language"
                                        onChange={handleFieldChange}
                                    />
                                    <EditField
                                        label="Currency"
                                        value={editedData?.preferences?.currency}
                                        name="preferences.currency"
                                        onChange={handleFieldChange}
                                    />
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="newsletter"
                                            checked={editedData?.preferences?.newsletter}
                                            onChange={(e) => handleFieldChange('preferences.newsletter', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="newsletter" className="text-sm text-gray-700">
                                            Subscribe to newsletter
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoField label="Language" value={userData?.preferences?.language} />
                                        <InfoField label="Currency" value={userData?.preferences?.currency} />
                                    </div>
                                    <div className="space-y-2 pt-4 border-t">
                                        {userData?.preferences?.newsletter && (
                                            <div className="flex items-center space-x-2 text-green-600">
                                                <BellIcon className="h-5 w-5" />
                                                <span className="text-sm">Newsletter subscribed</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </ProfileSection>
                </div>

                {/* Edit and Logout Buttons */}
                <div className="flex flex-col md:flex-row justify-center gap-4 pt-6">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 
                                         transition-all duration-300 transform hover:scale-105 
                                         flex items-center space-x-2 shadow-lg hover:shadow-xl"
                            >
                                <CheckIcon className="h-5 w-5" />
                                <span>Save</span>
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 
                                         transition-all duration-300 transform hover:scale-105 
                                         flex items-center space-x-2 shadow-lg hover:shadow-xl"
                            >
                                <XMarkIcon className="h-5 w-5" />
                                <span>Cancel</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                     transition-all duration-300 transform hover:scale-105 
                                     flex items-center space-x-2 shadow-lg hover:shadow-xl"
                        >
                            <PencilIcon className="h-5 w-5" />
                            <span>Edit Profile</span>
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 
                                 transition-all duration-300 transform hover:scale-105 
                                 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                        <LockClosedIcon className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;