import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../pages/firebase';

const InputForm = () => {
    const [formData, setFormData] = useState({
        collectionType: 'Trending watches',
        company: '',
        description: '',
        image: '',
        price: '',
        gender: 'Unisex',
        movement: 'Automatic',
        material: 'Stainless Steel',
        stock: true,
        stockNumber: '',
        featured: false,
        collectionYear: new Date().getFullYear()
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
            if (!formData.company || !formData.description || !formData.image || !formData.price) {
                throw new Error('Required fields: Company, Description, Image, Price');
            }

            await addDoc(collection(db, formData.collectionType), {
                Company: formData.company,
                Description: formData.description,
                Image: formData.image,
                Price: Number(formData.price),
                Gender: formData.gender,
                Movement: formData.movement,
                Material: formData.material,
                Stock: formData.stock,
                Stock_Number: formData.stockNumber ? Number(formData.stockNumber) : 0,
                Featured: formData.featured,
                CollectionYear: Number(formData.collectionYear),
                createdAt: new Date()
            });

            setFormData({
                ...formData,
                company: '',
                description: '',
                image: '',
                price: '',
                stockNumber: '',
            });

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

    return (
        <div className="bg-black min-h-screen text-white">
            {/* Hero Section */}
            <div className="h-64 overflow-hidden relative bg-gradient-to-r from-blue-900/50 to-gray-900/50">
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-4xl font-light tracking-widest">Curate Luxury</h1>
                </div>
            </div>

            {/* Form Container */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-gray-900/50 rounded-xl p-8 shadow-2xl border border-gray-800">
                    <h2 className="text-3xl font-light uppercase tracking-wider mb-8 text-center">
                        Add Timepiece
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg">
                                <p className="text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Collection Type & Basic Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 uppercase text-sm tracking-widest mb-2">
                                    Collection Type
                                </label>
                                <select
                                    name="collectionType"
                                    value={formData.collectionType}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                >
                                    {collectionOptions.map(option => (
                                        <option key={option} value={option} className="bg-gray-900">
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 uppercase text-sm tracking-widest mb-2">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent"                                >
                                    {['Men', 'Women', 'Unisex'].map(option => (
                                        <option key={option} value={option}
                                            className="bg-gray-900"
                                        >{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Company & Price Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 uppercase text-sm tracking-widest mb-2">
                                    Brand
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3"
                                    placeholder="Rolex"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 uppercase text-sm tracking-widest mb-2">
                                    Price (₹)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3"
                                    placeholder="25000"
                                    required
                                />
                            </div>
                        </div>

                        {/* Technical Specifications Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 uppercase text-sm tracking-widest mb-2">
                                    Movement
                                </label>
                                <select
                                    name="movement"
                                    value={formData.movement}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3"
                                >
                                    {['Automatic', 'Manual', 'Quartz', 'Solar'].map(option => (
                                        <option key={option} className="bg-gray-900" value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 uppercase text-sm tracking-widest mb-2">
                                    Material
                                </label>
                                <select
                                    name="material"
                                    value={formData.material}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3"
                                >
                                    {['Stainless Steel', 'Titanium', 'Ceramic', 'Gold', 'Platinum'].map(option => (
                                        <option key={option} className="bg-gray-900" value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description & Image */}
                        <div>
                            <label className="block text-gray-400 uppercase text-sm tracking-widest mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 h-32"
                                placeholder="Oyster, 42 mm, Oystersteel and white gold Reference 336934"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 uppercase text-sm tracking-widest mb-2">
                                Image URL
                            </label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3"
                                placeholder="https://example.com/premium-watch.jpg"
                                required
                            />
                        </div>

                        {/* Stock & Collection Year */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block text-gray-400 uppercase text-sm tracking-widest mb-2">
                                    Stock Management
                                </label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="stock"
                                            checked={formData.stock}
                                            onChange={handleChange}
                                            className="form-checkbox h-5 w-5 text-blue-600 border-gray-600 rounded bg-gray-800"
                                        />
                                        <span className="ml-2 text-gray-300">In Stock</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="stockNumber"
                                        value={formData.stockNumber}
                                        onChange={handleChange}
                                        className="w-32 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
                                        placeholder="Qty"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 uppercase text-sm tracking-widest mb-2">
                                    Collection Year
                                </label>
                                <input
                                    type="number"
                                    name="collectionYear"
                                    value={formData.collectionYear}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3"
                                    min="2000"
                                    max={new Date().getFullYear()}
                                />
                            </div>
                        </div>

                        {/* Featured Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                            <div>
                                <h3 className="text-gray-300 font-medium">Featured Item</h3>
                                <p className="text-gray-500 text-sm">Show in featured collection</p>
                            </div>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-800">
                                    <div className="absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                                </div>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600/80 hover:bg-blue-600 rounded-lg font-medium uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Crafting Timepiece...' : 'Add to Collection'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InputForm;

