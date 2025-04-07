import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../pages/firebase';

const InputForm = () => {
    const [formData, setFormData] = useState({
        collectionType: 'Trending watches',
        company: '',
        description: '',
        images: ['', '', '', ''],
        price: '',
        gender: 'Unisex',
        movement: 'Quartz',
        material: 'Stainless Steel',
        stock: true,
        stockNumber: '',
        featured: false,
        collectionYear: new Date().getFullYear(),
        glass: 'Mineral Glass',
        handType: '3-Hand',
        style: 'Casual',
        occasion: 'Casual',
        bandStyle: 'Bracelet',
        collectionName: 'Bold',
        countryOfOrigin: 'Switzerland',
        manufacturedBy: '',
        importedBy: '',
        globalIdentifierValue: '',
        globalIdentifierType: 'NA',
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
        waterResistance: '50 m'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const collectionOptions = [
        'Trending watches',
        'Exclusive Watches',
        'Smart Watches'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const requiredFields = [
                'company', 'description', 'price', 'manufacturedBy', 'importedBy'
            ];
            const missingFields = requiredFields.filter(field => !formData[field]);
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            const watchData = {
                Company: formData.company,
                Description: formData.description,
                images: formData.images.filter(url => url.trim() !== ''),
                Price: Number(formData.price),
                Gender: formData.gender,
                Movement: formData.movement,
                Material: formData.material,
                Stock: formData.stock,
                Stock_Number: formData.stockNumber ? Number(formData.stockNumber) : 0,
                Featured: formData.featured,
                CollectionYear: Number(formData.collectionYear),
                Glass: formData.glass,
                HandType: formData.handType,
                Style: formData.style,
                Occasion: formData.occasion,
                BandStyle: formData.bandStyle,
                CaseMaterial: formData.material,
                Warranty: formData.warranty,
                WaterResistance: formData.waterResistance,
                Collection: formData.collectionName,
                CountryOfOrigin: formData.countryOfOrigin,
                ManufacturedBy: formData.manufacturedBy,
                ImportedBy: formData.importedBy,
                GlobalIdentifierValue: formData.globalIdentifierValue,
                GlobalIdentifierType: formData.globalIdentifierType,
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
                createdAt: new Date()
            };

            await addDoc(collection(db, formData.collectionType), watchData);

            setFormData(prev => ({
                ...prev,
                company: '',
                description: '',
                images: ['', '', '', ''],
                price: '',
                stockNumber: '',
                manufacturedBy: '',
                importedBy: '',
                globalIdentifierValue: ''
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
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <div className="h-64 overflow-hidden relative bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Curate Luxury</h1>
                        <p className="text-gray-600 text-lg">Add exquisite timepieces to the collection</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Add Timepiece</h2>
                        <p className="text-gray-500">Fill in details to add a new watch to the collection</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Collection Type</label>
                                <select
                                    name="collectionType"
                                    value={formData.collectionType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                                >
                                    {collectionOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                                >
                                    {['Men', 'Women', 'Unisex'].map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

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

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Technical Specifications</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select
                                    name="glass"
                                    value={formData.glass}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option>Mineral Glass</option>
                                    <option>Sapphire Crystal</option>
                                </select>

                                <select
                                    name="handType"
                                    value={formData.handType}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option>3-Hand</option>
                                    <option>Chronograph</option>
                                </select>

                                <input
                                    type="text"
                                    name="warranty"
                                    value={formData.warranty}
                                    onChange={handleChange}
                                    placeholder="Warranty"
                                    className="w-full p-2 border rounded-lg"
                                />

                                <input
                                    type="text"
                                    name="waterResistance"
                                    value={formData.waterResistance}
                                    onChange={handleChange}
                                    placeholder="Water Resistance"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Brand Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="manufacturedBy"
                                    value={formData.manufacturedBy}
                                    onChange={handleChange}
                                    placeholder="Manufacturer"
                                    className="w-full p-2 border rounded-lg"
                                    required
                                />

                                <input
                                    type="text"
                                    name="importedBy"
                                    value={formData.importedBy}
                                    onChange={handleChange}
                                    placeholder="Imported By"
                                    className="w-full p-2 border rounded-lg"
                                    required
                                />

                                <input
                                    type="text"
                                    name="globalIdentifierValue"
                                    value={formData.globalIdentifierValue}
                                    onChange={handleChange}
                                    placeholder="Global Identifier Value"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Dial Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select
                                    name="dialShape"
                                    value={formData.dialShape}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option>Round</option>
                                    <option>Square</option>
                                </select>

                                <input
                                    type="text"
                                    name="dialColor"
                                    value={formData.dialColor}
                                    onChange={handleChange}
                                    placeholder="Dial Color"
                                    className="w-full p-2 border rounded-lg"
                                />

                                <input
                                    type="text"
                                    name="secondaryDialColor"
                                    value={formData.secondaryDialColor}
                                    onChange={handleChange}
                                    placeholder="Secondary Dial Color"
                                    className="w-full p-2 border rounded-lg"
                                />

                                <input
                                    type="number"
                                    name="dialDiameter"
                                    value={formData.dialDiameter}
                                    onChange={handleChange}
                                    placeholder="Dial Diameter (mm)"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Strap Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="strapColor"
                                    value={formData.strapColor}
                                    onChange={handleChange}
                                    placeholder="Strap Color"
                                    className="w-full p-2 border rounded-lg"
                                />

                                <input
                                    type="text"
                                    name="secondaryStrapColor"
                                    value={formData.secondaryStrapColor}
                                    onChange={handleChange}
                                    placeholder="Secondary Strap Color"
                                    className="w-full p-2 border rounded-lg"
                                />

                                <input
                                    type="number"
                                    name="strapWidth"
                                    value={formData.strapWidth}
                                    onChange={handleChange}
                                    placeholder="Strap Width (mm)"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                        </div>

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
                            {loading ? 'Adding...' : 'Add to Collection'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InputForm;