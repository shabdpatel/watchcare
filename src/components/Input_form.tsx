import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../pages/firebase';

const InputForm = () => {
    const [formData, setFormData] = useState({
        productCategory: 'Watches',
        collectionType: 'Trending',
        company: '',
        description: '',
        images: ['', '', '', ''],
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
        bagClosureType: '',
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
        UVProtection: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const collectionTypeOptions = {
        Watches: ['Trending', 'Exclusive', 'Smart'],
        Shoes: ['Casual', 'Sports', 'Formal', 'Sandals'],
        Bags: ['Backpack', 'Handbag', 'Tote', 'Travel'],
        Fashion: ['Casual', 'Formal', 'Sports', 'Traditional'],
        Electronics: ['Mobile', 'Headphones', 'Chargers', 'Accessories'],
        Accessories: ['Purse', 'Clutch', 'Belt', 'Sunglasses']
    };

    const requiredFields = {
        common: ['company', 'description', 'price', 'manufacturedBy', 'importedBy'],
        Watches: ['movement', 'material'],
        Shoes: ['shoeType', 'closureType', 'soleMaterial'],
        Bags: ['bagType', 'bagClosureType', 'bagMaterial'],
        Fashion: ['clothingType', 'size', 'fabric'],
        Electronics: ['electronicType', 'model', 'specifications'],
        Accessories: ['accessoryType', 'accessoryMaterial']
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const missingCommon = requiredFields.common.filter(field => !formData[field]);
            const missingCategory = requiredFields[formData.productCategory].filter(field => !formData[field]);

            if (missingCommon.length > 0 || missingCategory.length > 0) {
                throw new Error(`Missing required fields: ${[...missingCommon, ...missingCategory].join(', ')}`);
            }

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
                createdAt: new Date()
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
                        Warranty: formData.warranty,
                        WaterResistance: formData.waterResistance,
                        CaseMaterial: formData.caseMaterial,
                        Collection: formData.collection,
                        CollectionYear: formData.collectionYear,
                        CountryOfOrigin: formData.countryOfOrigin,
                        GlobalIdentifierType: formData.globalIdentifierType || 'NA', // Add default value here
                        GlobalIdentifierValue: formData.globalIdentifierValue,
                        HandType: formData.handType,
                        ManufacturedBy: formData.manufacturedBy,
                        ImportedBy: formData.importedBy,
                        Featured: formData.featured,
                        Stock: formData.stock,
                        Stock_Number: formData.stockNumber
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

            setFormData(prev => ({
                ...prev,
                company: '',
                description: '',
                images: ['', '', '', ''],
                price: '',
                stockNumber: '',
                manufacturedBy: '',
                importedBy: '',
                globalIdentifierValue: '',
                globalIdentifierType: 'NA', // Add this line
                // ...rest of the reset logic
            }));

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
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

    return (
        <div className="min-h-screen bg-gray-200 text-gray-900">
            <div className="h-64 overflow-hidden relative bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Product Management</h1>
                        <p className="text-gray-600 text-lg">Add products to the inventory</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Add Product</h2>
                        <p className="text-gray-500">Fill in details to add a new product</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </div>

                        {/* Common Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Brand</label>
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
                                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
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
                                    required
                                >
                                    <option value="Unisex">Unisex</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Product Images (4 URLs)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {formData.images.map((url, index) => (
                                    <input
                                        key={index}
                                        type="url"
                                        value={url}
                                        onChange={(e) => handleImageChange(index, e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder={`Image URL ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Category-specific Fields */}
                        {formData.productCategory === 'Watches' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Watch Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Movement Type</label>
                                        <select
                                            name="movement"
                                            value={formData.movement}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {['Quartz', 'Automatic', 'Mechanical', 'Smart'].map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Material</label>
                                        <select
                                            name="material"
                                            value={formData.material}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        <label className="block text-sm font-medium text-gray-700">Shoe Type</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Closure Type</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Bag Type</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Material</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Clothing Type</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Size</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Fabric</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Device Type</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Model Number</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Accessory Type</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Material</label>
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

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Adding...' : 'Add Product'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InputForm;