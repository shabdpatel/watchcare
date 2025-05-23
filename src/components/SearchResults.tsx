// filepath: /home/shabd/Desktop/Webdev/Projects/watch_store/src/components/SearchResults.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';

interface SearchResult {
    id: string;
    name: string;
    price: string;
    image: string;
    category: string;
}

const SearchResults = () => {
    const { searchQuery, isSearching } = useSearch();
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const searchProducts = async () => {
            if (!searchQuery) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // Replace this with your actual API call
                // Example: const response = await fetch(`/api/search?q=${searchQuery}`);
                // For now, we'll simulate a search across all products
                const allProducts = [
                    // Add your product data here or fetch from your data source
                ];

                const filtered = allProducts.filter(product =>
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.category.toLowerCase().includes(searchQuery.toLowerCase())
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
    }, [searchQuery]);

    if (!isSearching) return null;

    return (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg mt-2 rounded-lg overflow-hidden max-h-96 overflow-y-auto z-50">
            {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : results.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {results.map((result) => (
                        <Link
                            key={result.id}
                            to={`/details/${result.category}/${result.id}`}
                            className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                        >
                            <img
                                src={result.image}
                                alt={result.name}
                                className="w-12 h-12 object-cover rounded"
                            />
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">{result.name}</h3>
                                <p className="text-sm text-gray-500">{result.price}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="p-4 text-center text-gray-500">
                    {searchQuery ? 'No results found' : 'Start typing to search'}
                </div>
            )}
        </div>
    );
};

export default SearchResults;