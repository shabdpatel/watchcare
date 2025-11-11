import { useState, useEffect } from 'react';
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../pages/firebase';
import { useAuth } from './AuthContext';

const InputForm = () => {
    const { currentUser } = useAuth(); // Add this line
    const [formData, setFormData] = useState({
        productCategory: 'Watches',
        collectionType: 'Trending',
        company: '',
        description: '',
        images: ['', '', '', '', '', '', '', ''],
        price: '',
        gender: 'Unisex',

        // Common fields for all categories
        collectionYear: new Date().getFullYear(),
        countryOfOrigin: '',
        globalIdentifierValue: '',
        manufacturedBy: '',
        importedBy: '',
        featured: false,
        stock: true,
        stockNumber: 0,
        globalIdentifierType: 'NA', // Add this line with a default value

        // Watches
        movement: 'Quartz',
        material: 'Stainless Steel',
        glass: 'Mineral Glass',
        handType: '3-Hand',
        style: 'Casual',
        occasion: 'Casual',
        bandStyle: 'Bracelet',
        collectionName: 'Bold',
        dialShape: 'Round',
        dialColor: 'Black',
        secondaryDialColor: 'Rose Gold',
        dialType: 'Analog',
        dialDiameter: '40',
        dialThickness: '10',
        strapColor: 'Rose Gold',
        secondaryStrapColor: 'Rose Gold',
        strapMaterial: 'Stainless Steel',
        strapWidth: '18',
        warranty: '24 Months',
        waterResistance: '50 m',

        // Additional Watch fields
        caseMaterial: 'Stainless Steel',
        collection: 'Bold',
        handType: '3-Hand',
        dialDiameter: '40',
        dialThickness: '10',
        strapWidth: '18',
        warranty: '24 Months',

        // Shoes
        shoeType: '',
        closureType: '',
        soleMaterial: '',
        insoleMaterial: '',
        shoeSize: '',
        width: '',
        heelHeight: '',

        // Bags
        bagType: '',
        bagClosureType: '', // Add this line
        compartments: '',
        bagMaterial: '',
        dimensions: '',
        strapLength: '',
        weight: '',

        // Fashion
        clothingType: '',
        size: '',
        fabric: '',
        careInstructions: '',
        fit: 'Regular',
        sleeveLength: '',
        pattern: '',

        // Electronics
        electronicType: '',
        model: '',
        specifications: '', // Add this line
        color: '',
        includedAccessories: '',
        warrantyPeriod: '',

        // Accessories
        accessoryType: '',
        accessoryMaterial: '',
        accessoryDimensions: '',
        accessoryClosureType: '',
        lensType: '',
        UVProtection: '',

        // Seller Information (New Fields)
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '', // will be auto-filled from auth
    sellerAddress: '',
    sellerCity: '',
    sellerState: '',
    sellerPincode: '',
    sellerGSTIN: '',
    sellerPAN: '',

        // Add these new warranty fields after the existing warranty field
        warrantyDuration: '',
        warrantyExpiry: '',
        warrantyPhotoUrl: '',
        warrantyProvider: '',
        warrantyType: 'Manufacturer',
        warrantyTerms: '',
        warrantyStatus: 'Active',
        extendedWarrantyAvailable: false,
        extendedWarrantyPrice: '',
        extendedWarrantyDuration: '',
        warrantyRegistrationRequired: false,
        warrantyRegistrationUrl: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(Array(8).fill(0));
    const [isUploading, setIsUploading] = useState(Array(8).fill(false));

    const collectionTypeOptions = {
        Watches: ['Trending', 'Exclusive', 'Smart', 'Vintage Collection'],
        Shoes: ['Casual', 'Sports', 'Formal', 'Sandals'],
        Bags: ['Backpack', 'Handbag', 'Tote', 'Travel'],
        Fashion: ['Casual', 'Formal', 'Sports', 'Traditional'],
        Electronics: ['Mobile', 'Headphones', 'Chargers', 'Accessories'],
        Accessories: ['Purse', 'Clutch', 'Belt', 'Sunglasses']
    };

    const requiredFields = {
        common: ['company', 'description', 'price', 'sellerName', 'sellerPhone', 'sellerEmail'],
        Watches: ['movement', 'material'],
        Shoes: ['shoeType', 'closureType'],
        Bags: ['bagType', 'bagMaterial'],
        Fashion: ['clothingType', 'size', 'fabric'],
        Electronics: ['electronicType', 'model'],
        Accessories: ['accessoryType', 'accessoryMaterial']
    };

    // Helper function to check if a field is required
    const isFieldRequired = (fieldName) => {
        return requiredFields.common.includes(fieldName) ||
            requiredFields[formData.productCategory]?.includes(fieldName);
    };

    // Prefill seller info if user has sold before
    useEffect(() => {
        const prefillSellerInfo = async () => {
            if (!currentUser) return;
            try {
                const userRef = doc(db, 'users', currentUser.email);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    const profile = data.sellerProfile;
                    if (profile) {
                        setFormData(prev => ({
                            ...prev,
                            sellerName: profile.Name || prev.sellerName,
                            sellerPhone: profile.Phone || prev.sellerPhone,
                            sellerEmail: currentUser.email, // always override with auth email
                            sellerAddress: profile.Address || prev.sellerAddress,
                            sellerCity: profile.City || prev.sellerCity,
                            sellerState: profile.State || prev.sellerState,
                            sellerPincode: profile.Pincode || prev.sellerPincode,
                            sellerGSTIN: profile.GSTIN || prev.sellerGSTIN,
                            sellerPAN: profile.PAN || prev.sellerPAN,
                        }));
                    } else {
                        // Even if no profile, ensure email field is set
                        setFormData(prev => ({ ...prev, sellerEmail: currentUser.email }));
                    }
                } else {
                    setFormData(prev => ({ ...prev, sellerEmail: currentUser.email }));
                }
            } catch (err) {
                console.warn('Could not prefill seller profile', err);
            }
        };
        prefillSellerInfo();
    }, [currentUser]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!currentUser) {
            setError('You must be logged in to add products');
            setLoading(false);
            return;
        }

        try {
            const productData = {
                Company: formData.company,
                Description: formData.description,
                images: formData.images.filter(url => url.trim() !== ''),
                Price: Number(formData.price),
                Gender: formData.gender,
                Stock: formData.stock,
                Stock_Number: formData.stockNumber ? Number(formData.stockNumber) : 0,
                Featured: formData.featured,
                CollectionType: formData.collectionType,
                CountryOfOrigin: formData.countryOfOrigin,
                ManufacturedBy: formData.manufacturedBy,
                ImportedBy: formData.importedBy,
                GlobalIdentifierValue: formData.globalIdentifierValue,
                createdAt: new Date(),
                // Attach seller email at top-level for easier filtering
                email: currentUser.email,

                // Add seller information
                Seller: {
                    Name: formData.sellerName,
                    Phone: formData.sellerPhone,
                    Email: currentUser.email,
                    Address: formData.sellerAddress,
                    City: formData.sellerCity,
                    State: formData.sellerState,
                    Pincode: formData.sellerPincode,
                    GSTIN: formData.sellerGSTIN,
                    PAN: formData.sellerPAN
                },

                // Update warranty information structure
                Warranty: {
                    Duration: formData.warranty || formData.warrantyDuration, // Use either the simple warranty or detailed duration
                    Expiry: formData.warrantyExpiry,
                    PhotoUrl: formData.warrantyPhotoUrl,
                    Provider: formData.warrantyProvider || formData.manufacturedBy, // Default to manufacturer if not specified
                    Type: formData.warrantyType,
                    Terms: formData.warrantyTerms,
                    Status: formData.warrantyStatus,
                    ExtendedWarranty: {
                        Available: formData.extendedWarrantyAvailable,
                        Price: formData.extendedWarrantyPrice,
                        Duration: formData.extendedWarrantyDuration
                    },
                    Registration: {
                        Required: formData.warrantyRegistrationRequired,
                        Url: formData.warrantyRegistrationUrl
                    }
                }
            };

            switch (formData.productCategory) {
                case 'Watches':
                    Object.assign(productData, {
                        Movement: formData.movement,
                        Material: formData.material,
                        CollectionYear: formData.collectionYear,
                        Glass: formData.glass,
                        HandType: formData.handType,
                        Style: formData.style,
                        Occasion: formData.occasion,
                        BandStyle: formData.bandStyle,
                        CollectionName: formData.collectionName,
                        DialShape: formData.dialShape,
                        DialColor: formData.dialColor,
                        SecondaryDialColor: formData.secondaryDialColor,
                        DialType: formData.dialType,
                        DialDiameter: `${formData.dialDiameter} MM`,
                        DialThickness: `${formData.dialThickness} mm`,
                        StrapColor: formData.strapColor,
                        SecondaryStrapColor: formData.secondaryStrapColor,
                        StrapMaterial: formData.strapMaterial,
                        StrapWidth: `${formData.strapWidth} MM`,
                        WaterResistance: formData.waterResistance,
                        CaseMaterial: formData.caseMaterial,
                        Collection: formData.collection,
                        GlobalIdentifierType: formData.globalIdentifierType || 'NA',
                    });
                    break;
                case 'Shoes':
                    Object.assign(productData, {
                        ShoeType: formData.shoeType,
                        ClosureType: formData.closureType,
                        SoleMaterial: formData.soleMaterial,
                        InsoleMaterial: formData.insoleMaterial,
                        ShoeSize: formData.shoeSize,
                        Width: formData.width,
                        HeelHeight: formData.heelHeight,
                        CollectionYear: formData.collectionYear,
                        CountryOfOrigin: formData.countryOfOrigin,
                        GlobalIdentifierValue: formData.globalIdentifierValue,
                        ManufacturedBy: formData.manufacturedBy,
                        ImportedBy: formData.importedBy,
                        Featured: formData.featured,
                        Stock: formData.stock,
                        Stock_Number: formData.stockNumber
                    });
                    break;
                case 'Bags':
                    Object.assign(productData, {
                        BagType: formData.bagType,
                        ClosureType: formData.bagClosureType,
                        Compartments: formData.compartments,
                        Material: formData.bagMaterial,
                        Dimensions: formData.dimensions,
                        StrapLength: formData.strapLength,
                        Weight: formData.weight,
                        CollectionYear: formData.collectionYear,
                        CountryOfOrigin: formData.countryOfOrigin,
                        GlobalIdentifierValue: formData.globalIdentifierValue,
                        ManufacturedBy: formData.manufacturedBy,
                        ImportedBy: formData.importedBy,
                        Featured: formData.featured,
                        Stock: formData.stock,
                        Stock_Number: formData.stockNumber
                    });
                    break;
                case 'Fashion':
                    Object.assign(productData, {
                        ClothingType: formData.clothingType,
                        Size: formData.size,
                        Fabric: formData.fabric,
                        CareInstructions: formData.careInstructions,
                        Fit: formData.fit,
                        SleeveLength: formData.sleeveLength,
                        Pattern: formData.pattern,
                        CollectionYear: formData.collectionYear,
                        CountryOfOrigin: formData.countryOfOrigin,
                        GlobalIdentifierValue: formData.globalIdentifierValue,
                        ManufacturedBy: formData.manufacturedBy,
                        ImportedBy: formData.importedBy,
                        Featured: formData.featured,
                        Stock: formData.stock,
                        Stock_Number: formData.stockNumber
                    });
                    break;
                case 'Electronics':
                    Object.assign(productData, {
                        Type: formData.electronicType,
                        Model: formData.model,
                        Specifications: formData.specifications, // Add this line
                        ManufacturedBy: formData.manufacturedBy, // Make sure this is included
                        Color: formData.color,
                        IncludedAccessories: formData.includedAccessories,
                        WarrantyPeriod: formData.warrantyPeriod,
                        CollectionYear: formData.collectionYear,
                        CountryOfOrigin: formData.countryOfOrigin,
                        GlobalIdentifierValue: formData.globalIdentifierValue,
                        ManufacturedBy: formData.manufacturedBy,
                        ImportedBy: formData.importedBy,
                        Featured: formData.featured,
                        Stock: formData.stock,
                        Stock_Number: formData.stockNumber
                    });
                    break;
                case 'Accessories':
                    Object.assign(productData, {
                        AccessoryType: formData.accessoryType,
                        Material: formData.accessoryMaterial,
                        Dimensions: formData.accessoryDimensions,
                        ClosureType: formData.accessoryClosureType,
                        LensType: formData.lensType,
                        UVProtection: formData.UVProtection,
                        CollectionYear: formData.collectionYear,
                        CountryOfOrigin: formData.countryOfOrigin,
                        GlobalIdentifierValue: formData.globalIdentifierValue,
                        ManufacturedBy: formData.manufacturedBy,
                        ImportedBy: formData.importedBy,
                        Featured: formData.featured,
                        Stock: formData.stock,
                        Stock_Number: formData.stockNumber
                    });
                    break;
                default: break;
            }

            await addDoc(collection(db, formData.productCategory), productData);

            // Upsert seller profile for future prefills
            try {
                const userRef = doc(db, 'users', currentUser.email);
                await setDoc(userRef, {
                    sellerProfile: {
                        Name: formData.sellerName,
                        Phone: formData.sellerPhone,
                        Email: currentUser.email,
                        Address: formData.sellerAddress,
                        City: formData.sellerCity,
                        State: formData.sellerState,
                        Pincode: formData.sellerPincode,
                        GSTIN: formData.sellerGSTIN,
                        PAN: formData.sellerPAN,
                        updatedAt: new Date()
                    }
                }, { merge: true });
            } catch (profileErr) {
                console.warn('Failed to update seller profile', profileErr);
            }

            setFormData(prev => ({
                ...prev,
                company: '',
                description: '',
                images: ['', '', '', '', '', '', '', ''],
                price: '',
                stockNumber: '',
                manufacturedBy: '',
                importedBy: '',
                globalIdentifierValue: '',
                globalIdentifierType: 'NA', // Add this line
                // ...rest of the reset logic
            }));

            // Reset upload states
            setUploadProgress(Array(8).fill(0));
            setIsUploading(Array(8).fill(false));

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const uploadToCloudinary = async (file, index) => {
        // Your Cloudinary configuration
        const CLOUDINARY_CLOUD_NAME = 'dcudiau08';

        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

        // Update uploading state
        setIsUploading(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
        });

        // Try multiple upload presets in order of preference
        const presets = ['watchcare_unsigned', 'ml_default'];

        try {
            for (const preset of presets) {
                try {
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', file);
                    uploadFormData.append('upload_preset', preset);

                    const response = await fetch(url, {
                        method: 'POST',
                        body: uploadFormData,
                    });

                    const data = await response.json();

                    if (response.ok && data.secure_url) {
                        // Success! Update the image URL in the form
                        const newImages = [...formData.images];
                        newImages[index] = data.secure_url;
                        setFormData(prev => ({ ...prev, images: newImages }));

                        setError(''); // Clear any previous errors
                        console.log(`Upload successful with preset "${preset}":`, data.secure_url);
                        return data.secure_url;
                    } else {
                        console.warn(`Upload failed with preset "${preset}":`, data);
                        // Continue to next preset
                        continue;
                    }
                } catch (presetError) {
                    console.warn(`Error with preset "${preset}":`, presetError);
                    // Continue to next preset
                    continue;
                }
            }

            // If all presets failed
            throw new Error('Upload failed with all available presets. Please check your Cloudinary configuration.');
        } catch (error) {
            const errorMessage = (error as Error).message || 'Upload failed';
            console.error('Upload error:', error);
            setError(`Failed to upload image ${index + 1}: ${errorMessage}`);
            throw error;
        } finally {
            // Reset uploading state
            setIsUploading(prev => {
                const newState = [...prev];
                newState[index] = false;
                return newState;
            });
        }
    };

    const handleFileUpload = async (event, index) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image size should be less than 10MB');
            return;
        }

        try {
            await uploadToCloudinary(file, index);
            setError(''); // Clear any previous errors on success
        } catch (error) {
            // Error is already handled in uploadToCloudinary
            console.error('File upload failed:', error);
        } finally {
            // Reset uploading state in case it wasn't reset
            setIsUploading(prev => {
                const newState = [...prev];
                newState[index] = false;
                return newState;
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 text-gray-900">
            {/* Header section */}
            <div className="relative">
                {/* Background with gradient and pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 opacity-75">
                    <div className="absolute inset-0 bg-grid-pattern"></div>
                </div>

                {/* Header Content */}
                <div className="relative h-48 sm:h-64 md:h-72 px-4 flex items-center justify-center">
                    <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 transition-all">
                            Product Management
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium">
                            Add products to the inventory
                        </p>
                        <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mt-4"></div>
                    </div>
                </div>

                {/* Decorative bottom curve */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg
                        className="w-full h-8 sm:h-12 text-gray-200"
                        viewBox="0 0 1440 54"
                        preserveAspectRatio="none"
                        fill="currentColor"
                    >
                        <path d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z" />
                    </svg>
                </div>
            </div>
            {/* Main form container */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Add Product</h2>
                        <p className="text-gray-500">Fill in details to add a new product</p>
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <span className="text-red-500 font-medium">*</span> indicates required fields
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Section 1: Product Information */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Product Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Existing product category and collection type fields */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Product Category</label>
                                    <select
                                        name="productCategory"
                                        value={formData.productCategory}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                                    >
                                        {['Watches', 'Shoes', 'Bags', 'Fashion', 'Electronics', 'Accessories'].map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Collection Type</label>
                                    <select
                                        name="collectionType"
                                        value={formData.collectionType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                                    >
                                        {collectionTypeOptions[formData.productCategory].map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Existing brand, price, gender fields */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Brand <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Price (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Gender/Sex</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                                    >
                                        <option value="Unisex">Unisex</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>

                            {/* Product Images Section */}
                            <div className="col-span-full space-y-4">
                                <h4 className="text-lg font-semibold">Product Images (8 URLs or Files)</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                    {formData.images.map((url, index) => (
                                        <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Image {index + 1}
                                            </label>

                                            {/* URL Input */}
                                            <input
                                                type="url"
                                                value={url}
                                                onChange={(e) => handleImageChange(index, e.target.value)}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder={`Image URL ${index + 1}`}
                                                disabled={isUploading[index]}
                                            />

                                            {/* OR Divider */}
                                            <div className="flex items-center my-2">
                                                <div className="flex-1 border-t border-gray-300"></div>
                                                <span className="px-2 sm:px-3 text-gray-500 text-xs sm:text-sm">OR</span>
                                                <div className="flex-1 border-t border-gray-300"></div>
                                            </div>

                                            {/* File Upload */}
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, index)}
                                                    className="w-full sm:flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    disabled={isUploading[index]}
                                                />
                                                {isUploading[index] && (
                                                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                                                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-xs sm:text-sm text-blue-600">Uploading...</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Image Preview */}
                                            {url && (
                                                <div className="mt-3">
                                                    <img
                                                        src={url}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-300 shadow-sm"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                                    required
                                />
                            </div>
                        </div>

                        {/* Section 2: Seller Information (New) */}
                        <div className="space-y-4 sm:space-y-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 border-b pb-2">
                                Seller Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                {/* Basic Info */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Seller Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="sellerName"
                                        value={formData.sellerName}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="sellerPhone"
                                        value={formData.sellerPhone}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="sellerEmail"
                                        value={formData.sellerEmail || currentUser?.email || ''}
                                        onChange={handleChange}
                                        readOnly
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">GSTIN</label>
                                    <input
                                        type="text"
                                        name="sellerGSTIN"
                                        value={formData.sellerGSTIN}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Full Width Address Field */}
                                <div className="col-span-1 sm:col-span-2 space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea
                                        name="sellerAddress"
                                        value={formData.sellerAddress}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                    />
                                </div>

                                {/* Location Details */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input
                                        type="text"
                                        name="sellerCity"
                                        value={formData.sellerCity}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">State</label>
                                    <input
                                        type="text"
                                        name="sellerState"
                                        value={formData.sellerState}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                                    <input
                                        type="text"
                                        name="sellerPincode"
                                        value={formData.sellerPincode}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                                    <input
                                        type="text"
                                        name="sellerPAN"
                                        value={formData.sellerPAN}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Additional Specifications */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Additional Specifications</h3>
                            {/* Keep all your existing category-specific fields here */}
                            {formData.productCategory === 'Watches' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Watch Specifications</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Movement Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="movement"
                                                value={formData.movement}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                {['Quartz', 'Automatic', 'Mechanical', 'Smart'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Material <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="material"
                                                value={formData.material}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                {['Stainless Steel', 'Titanium', 'Gold', 'Rose Gold', 'Ceramic'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Glass Type</label>
                                            <select
                                                name="glass"
                                                value={formData.glass}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {['Mineral Glass', 'Sapphire Crystal', 'Acrylic'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Water Resistance</label>
                                            <select
                                                name="waterResistance"
                                                value={formData.waterResistance}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {['30 m', '50 m', '100 m', '200 m', '300 m'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Add more watch-specific fields as needed */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Case Material</label>
                                            <select
                                                name="caseMaterial"
                                                value={formData.caseMaterial}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                {['Stainless Steel', 'Titanium', 'Gold', 'Rose Gold', 'Ceramic', 'Carbon Fiber'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Collection Name</label>
                                            <input
                                                type="text"
                                                name="collection"
                                                value={formData.collection}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Collection Year</label>
                                            <input
                                                type="number"
                                                name="collectionYear"
                                                value={formData.collectionYear}
                                                onChange={handleChange}
                                                min="1900"
                                                max={new Date().getFullYear() + 1}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Country of Origin</label>
                                            <input
                                                type="text"
                                                name="countryOfOrigin"
                                                value={formData.countryOfOrigin}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Hand Type</label>
                                            <select
                                                name="handType"
                                                value={formData.handType}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                {['2-Hand', '3-Hand', 'Chronograph', 'Skeleton'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Global Identifier</label>
                                            <input
                                                type="text"
                                                name="globalIdentifierValue"
                                                value={formData.globalIdentifierValue}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Manufactured By</label>
                                            <input
                                                type="text"
                                                name="manufacturedBy"
                                                value={formData.manufacturedBy}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Imported By</label>
                                            <input
                                                type="text"
                                                name="importedBy"
                                                value={formData.importedBy}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Featured Product</label>
                                            <div className="mt-2">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="featured"
                                                        checked={formData.featured}
                                                        onChange={handleChange}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2">Mark as featured</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Stock Management</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="stock"
                                                        checked={formData.stock}
                                                        onChange={handleChange}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2">In Stock</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="stockNumber"
                                                    value={formData.stockNumber}
                                                    onChange={handleChange}
                                                    placeholder="Stock quantity"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.productCategory === 'Shoes' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Shoe Specifications</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Shoe Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="shoeType"
                                                value={formData.shoeType}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                {['Sneakers', 'Formal', 'Boots', 'Sports', 'Casual', 'Sandals'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Closure Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="closureType"
                                                value={formData.closureType}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Closure</option>
                                                {['Lace-up', 'Slip-on', 'Velcro', 'Buckle', 'Zip'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Size Range</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    name="shoeSize"
                                                    value={formData.shoeSize}
                                                    onChange={handleChange}
                                                    placeholder="Size"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Collection Year</label>
                                            <input
                                                type="number"
                                                name="collectionYear"
                                                value={formData.collectionYear}
                                                onChange={handleChange}
                                                min="1900"
                                                max={new Date().getFullYear() + 1}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Country of Origin</label>
                                            <input
                                                type="text"
                                                name="countryOfOrigin"
                                                value={formData.countryOfOrigin}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Global Identifier</label>
                                            <input
                                                type="text"
                                                name="globalIdentifierValue"
                                                value={formData.globalIdentifierValue}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Manufactured By</label>
                                            <input
                                                type="text"
                                                name="manufacturedBy"
                                                value={formData.manufacturedBy}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Imported By</label>
                                            <input
                                                type="text"
                                                name="importedBy"
                                                value={formData.importedBy}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Featured Product</label>
                                            <div className="mt-2">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="featured"
                                                        checked={formData.featured}
                                                        onChange={handleChange}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2">Mark as featured</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Stock Management</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="stock"
                                                        checked={formData.stock}
                                                        onChange={handleChange}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2">In Stock</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="stockNumber"
                                                    value={formData.stockNumber}
                                                    onChange={handleChange}
                                                    placeholder="Stock quantity"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Sole Material</label>
                                            <select
                                                name="soleMaterial"
                                                value={formData.soleMaterial}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Sole Material</option>
                                                {['Rubber', 'PU', 'EVA', 'TPR', 'Leather', 'Phylon'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.productCategory === 'Bags' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Bag Specifications</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Bag Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="bagType"
                                                value={formData.bagType}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                {['Backpack', 'Handbag', 'Shoulder Bag', 'Tote', 'Clutch', 'Travel Bag'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Closure Type</label>
                                            <select
                                                name="bagClosureType"
                                                value={formData.bagClosureType}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select Closure Type</option>
                                                {[
                                                    'Zipper',
                                                    'Button',
                                                    'Magnetic Snap',
                                                    'Buckle',
                                                    'Drawstring',
                                                    'Flap',
                                                    'Toggle',
                                                    'Hook and Loop'
                                                ].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Material <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="bagMaterial"
                                                value={formData.bagMaterial}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Material</option>
                                                {['Leather', 'Canvas', 'Nylon', 'Polyester', 'Cotton', 'Synthetic'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Dimensions (cm)</label>
                                            <input
                                                type="text"
                                                name="dimensions"
                                                value={formData.dimensions}
                                                onChange={handleChange}
                                                placeholder="Length x Width x Height"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Collection Year</label>
                                            <input
                                                type="number"
                                                name="collectionYear"
                                                value={formData.collectionYear}
                                                onChange={handleChange}
                                                min="1900"
                                                max={new Date().getFullYear() + 1}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Country of Origin</label>
                                            <input
                                                type="text"
                                                name="countryOfOrigin"
                                                value={formData.countryOfOrigin}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Global Identifier</label>
                                            <input
                                                type="text"
                                                name="globalIdentifierValue"
                                                value={formData.globalIdentifierValue}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Manufactured By</label>
                                            <input
                                                type="text"
                                                name="manufacturedBy"
                                                value={formData.manufacturedBy}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Imported By</label>
                                            <input
                                                type="text"
                                                name="importedBy"
                                                value={formData.importedBy}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Featured Product</label>
                                            <div className="mt-2">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="featured"
                                                        checked={formData.featured}
                                                        onChange={handleChange}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2">Mark as featured</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Stock Management</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="stock"
                                                        checked={formData.stock}
                                                        onChange={handleChange}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2">In Stock</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="stockNumber"
                                                    value={formData.stockNumber}
                                                    onChange={handleChange}
                                                    placeholder="Stock quantity"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.productCategory === 'Fashion' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Fashion Specifications</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Clothing Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="clothingType"
                                                value={formData.clothingType}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                {['T-Shirt', 'Shirt', 'Jeans', 'Pants', 'Dress', 'Jacket', 'Sweater'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Size <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="size"
                                                value={formData.size}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Size</option>
                                                {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Pattern</label>
                                            <select
                                                name="pattern"
                                                value={formData.pattern}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select Pattern</option>
                                                {['Solid', 'Printed', 'Striped', 'Checked', 'Floral'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Collection Year</label>
                                            <input
                                                type="number"
                                                name="collectionYear"
                                                value={formData.collectionYear}
                                                onChange={handleChange}
                                                min="1900"
                                                max={new Date().getFullYear() + 1}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Country of Origin</label>
                                            <input
                                                type="text"
                                                name="countryOfOrigin"
                                                value={formData.countryOfOrigin}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Global Identifier</label>
                                            <input
                                                type="text"
                                                name="globalIdentifierValue"
                                                value={formData.globalIdentifierValue}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Manufactured By</label>
                                            <input
                                                type="text"
                                                name="manufacturedBy"
                                                value={formData.manufacturedBy}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Imported By</label>
                                            <input
                                                type="text"
                                                name="importedBy"
                                                value={formData.importedBy}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Featured Product</label>
                                            <div className="mt-2">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="featured"
                                                        checked={formData.featured}
                                                        onChange={handleChange}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2">Mark as featured</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Stock Management</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="stock"
                                                        checked={formData.stock}
                                                        onChange={handleChange}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2">In Stock</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="stockNumber"
                                                    value={formData.stockNumber}
                                                    onChange={handleChange}
                                                    placeholder="Stock quantity"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Fabric <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="fabric"
                                                value={formData.fabric}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Fabric</option>
                                                {[
                                                    'Cotton',
                                                    'Polyester',
                                                    'Wool',
                                                    'Linen',
                                                    'Silk',
                                                    'Denim',
                                                    'Rayon',
                                                    'Nylon',
                                                    'Spandex',
                                                    'Blend'
                                                ].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.productCategory === 'Electronics' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Electronics Specifications</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Device Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="electronicType"
                                                value={formData.electronicType}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                {['Mobile Phone', 'Headphones', 'Charger', 'Power Bank', 'USB Device'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Model Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="model"
                                                value={formData.model}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Warranty Period</label>
                                            <select
                                                name="warrantyPeriod"
                                                value={formData.warrantyPeriod}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {['6 Months', '12 Months', '24 Months', '36 Months'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Collection Year</label>
                                            <input
                                                type="number"
                                                name="collectionYear"
                                                value={formData.collectionYear}
                                                onChange={handleChange}
                                                min="1900"
                                                max={new Date().getFullYear() + 1}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Imported By</label>
                                            <input
                                                type="text"
                                                name="importedBy"
                                                value={formData.importedBy}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Specifications</label>
                                            <textarea
                                                name="specifications"
                                                value={formData.specifications}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter device specifications"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Manufactured By</label>
                                            <input
                                                type="text"
                                                name="manufacturedBy"
                                                value={formData.manufacturedBy}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Featured Product</label>
                                            <div className="mt-2">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="featured"
                                                        checked={formData.featured}
                                                        onChange={handleChange}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2">Mark as featured</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Stock Management</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="stock"
                                                        checked={formData.stock}
                                                        onChange={handleChange}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2">In Stock</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="stockNumber"
                                                    value={formData.stockNumber}
                                                    onChange={handleChange}
                                                    placeholder="Stock quantity"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.productCategory === 'Accessories' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Accessories Specifications</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Accessory Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="accessoryType"
                                                value={formData.accessoryType}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                {['Wallet', 'Belt', 'Sunglasses', 'Scarf', 'Hat', 'Gloves'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Material <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="accessoryMaterial"
                                                value={formData.accessoryMaterial}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Material</option>
                                                {['Leather', 'Metal', 'Plastic', 'Fabric', 'Wood'].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Collection Year</label>
                                            <input
                                                type="number"
                                                name="collectionYear"
                                                value={formData.collectionYear}
                                                onChange={handleChange}
                                                min="1900"
                                                max={new Date().getFullYear() + 1}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Country of Origin</label>
                                            <input
                                                type="text"
                                                name="countryOfOrigin"
                                                value={formData.countryOfOrigin}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Global Identifier</label>
                                            <input
                                                type="text"
                                                name="globalIdentifierValue"
                                                value={formData.globalIdentifierValue}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Manufactured By</label>
                                            <input
                                                type="text"
                                                name="manufacturedBy"
                                                value={formData.manufacturedBy}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Imported By</label>
                                            <input
                                                type="text"
                                                name="importedBy"
                                                value={formData.importedBy}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Featured Product</label>
                                            <div className="mt-2">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="featured"
                                                        checked={formData.featured}
                                                        onChange={handleChange}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2">Mark as featured</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Stock Management</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="stock"
                                                        checked={formData.stock}
                                                        onChange={handleChange}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2">In Stock</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="stockNumber"
                                                    value={formData.stockNumber}
                                                    onChange={handleChange}
                                                    placeholder="Stock quantity"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warranty Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 border-b pb-2">
                                    Warranty Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Warranty Duration</label>
                                        <input
                                            type="text"
                                            name="warrantyDuration"
                                            value={formData.warrantyDuration}
                                            onChange={handleChange}
                                            placeholder="e.g., 24 months"
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Warranty Expiry</label>
                                        <input
                                            type="date"
                                            name="warrantyExpiry"
                                            value={formData.warrantyExpiry}
                                            onChange={handleChange}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Warranty Photo URL</label>
                                        <input
                                            type="url"
                                            name="warrantyPhotoUrl"
                                            value={formData.warrantyPhotoUrl}
                                            onChange={handleChange}
                                            placeholder="Enter warranty card photo URL"
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Warranty Provider</label>
                                        <input
                                            type="text"
                                            name="warrantyProvider"
                                            value={formData.warrantyProvider}
                                            onChange={handleChange}
                                            placeholder="Enter warranty provider name"
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Warranty Type</label>
                                        <select
                                            name="warrantyType"
                                            value={formData.warrantyType}
                                            onChange={handleChange}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="Manufacturer">Manufacturer Warranty</option>
                                            <option value="Seller">Seller Warranty</option>
                                            <option value="Third Party">Third Party Warranty</option>
                                            <option value="International">International Warranty</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Warranty Status</label>
                                        <select
                                            name="warrantyStatus"
                                            value={formData.warrantyStatus}
                                            onChange={handleChange}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Expired">Expired</option>
                                            <option value="Pending">Pending</option>
                                        </select>
                                    </div>

                                    <div className="col-span-1 sm:col-span-2 space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Warranty Terms & Conditions</label>
                                        <textarea
                                            name="warrantyTerms"
                                            value={formData.warrantyTerms}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="Enter warranty terms and conditions"
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="col-span-1 sm:col-span-2 space-y-4">
                                        <label className="block text-sm font-medium text-gray-700">Extended Warranty Options</label>
                                        <div className="space-y-4">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="extendedWarrantyAvailable"
                                                    checked={formData.extendedWarrantyAvailable}
                                                    onChange={handleChange}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                />
                                                <span className="ml-2 text-sm sm:text-base">Extended Warranty Available</span>
                                            </label>
                                            {formData.extendedWarrantyAvailable && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        name="extendedWarrantyPrice"
                                                        value={formData.extendedWarrantyPrice}
                                                        onChange={handleChange}
                                                        placeholder="Extended warranty price"
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg"
                                                    />
                                                    <input
                                                        type="text"
                                                        name="extendedWarrantyDuration"
                                                        value={formData.extendedWarrantyDuration}
                                                        onChange={handleChange}
                                                        placeholder="Duration (e.g., 12 months)"
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-1 sm:col-span-2 space-y-4">
                                        <label className="block text-sm font-medium text-gray-700">Warranty Registration</label>
                                        <div className="space-y-4">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="warrantyRegistrationRequired"
                                                    checked={formData.warrantyRegistrationRequired}
                                                    onChange={handleChange}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                />
                                                <span className="ml-2 text-sm sm:text-base">Registration Required</span>
                                            </label>
                                            {formData.warrantyRegistrationRequired && (
                                                <input
                                                    type="url"
                                                    name="warrantyRegistrationUrl"
                                                    value={formData.warrantyRegistrationUrl}
                                                    onChange={handleChange}
                                                    placeholder="Registration URL"
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    fill="currentColor"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v5l4.5-4.5L20 9l-8 8H4z"
                                                />
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        'Add Product'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InputForm;