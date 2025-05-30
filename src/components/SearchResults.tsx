// filepath: /home/shabd/Desktop/Webdev/Projects/watch_store/src/components/SearchResults.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../pages/firebase';

interface SearchResult {
    id: string;
    name: string;
    Brand: string;
    Price: number;
    Image: string;
    collectionName: string;
    Description?: string;
}

const SearchResults = () => {
    const { searchQuery, isSearching, setIsSearching } = useSearch();
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [allProducts, setAllProducts] = useState<SearchResult[]>([]);

    // Fetch all products once when component mounts
    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const collections = ['Watches', 'Fashion', 'Electronics', 'Accessories', 'Bags', 'Shoes'];
                let products: SearchResult[] = [];

                for (const collectionName of collections) {
                    const querySnapshot = await getDocs(collection(db, collectionName));
                    const items = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        collectionName,
                        name: doc.data().name || doc.data().Brand || '',
                        Brand: doc.data().Brand || '',
                        Price: parseFloat(doc.data().Price) || 0,
                        Image: doc.data().images?.[0] || doc.data().Image || '',
                        Description: doc.data().Description || doc.data().description || '',
                        ...doc.data()
                    }));
                    products = [...products, ...items];
                }

                setAllProducts(products);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchAllProducts();
    }, []);

    // Search functionality
    useEffect(() => {
        const searchProducts = () => {
            if (!searchQuery.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const searchTerm = searchQuery.toLowerCase();
                const filtered = allProducts.filter(product =>
                    product.name?.toLowerCase().includes(searchTerm) ||
                    product.Brand?.toLowerCase().includes(searchTerm) ||
                    product.Description?.toLowerCase().includes(searchTerm) ||
                    product.collectionName.toLowerCase().includes(searchTerm)
                );

                setResults(filtered);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, allProducts]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as Element).closest('.search-results')) {
                setIsSearching(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsSearching]);

    if (!isSearching) return null;

    return (
        <div className="fixed inset-x-0 top-16 sm:top-20 mx-auto w-full max-w-2xl bg-white shadow-2xl rounded-lg overflow-hidden z-50 search-results border border-gray-200">
            <div className="max-h-[80vh] overflow-y-auto">
                {loading ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Searching...</p>
                    </div>
                ) : results.length > 0 ? (
                    <div>
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <p className="text-sm text-gray-600">
                                Found {results.length} result{results.length === 1 ? '' : 's'}
                            </p>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {results.map((result) => (
                                <Link
                                    key={`${result.collectionName}-${result.id}`}
                                    to={result.collectionName === 'Watches'
                                        ? `/all_watches`
                                        : `/details/${result.collectionName}/${result.id}`}
                                    className="flex items-start p-4 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsSearching(false)}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={result.Image}
                                            alt={result.name}
                                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg shadow-sm"
                                        />
                                        <span className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-full text-gray-700">
                                            {result.collectionName}
                                        </span>
                                    </div>
                                    <div className="ml-4 flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                                                    {result.name || result.Brand}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500 truncate">
                                                    Brand: {result.Brand}
                                                </p>
                                            </div>
                                            <div className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
                                                <p className="text-lg font-semibold text-gray-900">
                                                    ₹{result.Price?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        {result.Description && (
                                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                {result.Description}
                                            </p>
                                        )}
                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                View Details →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        {searchQuery ? (
                            <div>
                                <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
                                <p className="mt-2 text-sm text-gray-400">Try adjusting your search terms</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-500 text-lg">Start typing to search</p>
                                <p className="mt-2 text-sm text-gray-400">Search across all products</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <button
                onClick={() => setIsSearching(false)}
                className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full"
            >
                <span className="sr-only">Close search</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default SearchResults;