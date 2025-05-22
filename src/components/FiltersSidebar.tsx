import React, { useState } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

const FilterSection = ({ title, children, isOpen, toggleOpen }) => (
    <div className="border-b border-gray-200 pb-6">
        <button
            onClick={toggleOpen}
            className="w-full flex justify-between items-center"
        >
            <h4 className="text-sm font-semibold uppercase text-gray-700">{title}</h4>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className={`space-y-2 mt-3 ${isOpen ? 'block' : 'hidden'}`}>
            {children}
        </div>
    </div>
);

const ColorSwatch = ({ color, onClick, isSelected }) => (
    <button
        onClick={onClick}
        className={`relative w-8 h-8 rounded-full border-2 ${isSelected ? 'border-gray-700' : 'border-gray-200'}`}
        style={{ backgroundColor: color.toLowerCase() }}
        title={color}
    >
        {isSelected && (
            <CheckIcon className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
    </button>
);

// Define filter options for each category
export const filterOptions = {
    watches: {
        brands: ['Rolex', 'Omega', 'Casio', 'Fossil', 'Titan', 'Seiko', 'Timex', 'Citizen'],
        dialColors: ['Black', 'Blue', 'Silver', 'Gold', 'White', 'Rose Gold'],
        dialShapes: ['Round', 'Square', 'Rectangle', 'Oval', 'Tonneau'],
        strapColors: ['Black', 'Brown', 'Silver', 'Gold', 'Blue'],
        strapMaterials: ['Leather', 'Metal', 'Nylon', 'Silicone', 'Ceramic'],
        movements: ['Automatic', 'Quartz', 'Mechanical', 'Smart']
    },
    shoes: {
        brands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance'],
        types: ['Sneakers', 'Formal', 'Sports', 'Casual', 'Boots'],
        colors: ['Black', 'White', 'Blue', 'Red', 'Grey', 'Brown'],
        sizes: ['6', '7', '8', '9', '10', '11', '12'],
        materials: ['Leather', 'Canvas', 'Suede', 'Mesh', 'Synthetic'],
        closureTypes: ['Lace-up', 'Slip-on', 'Velcro', 'Buckle', 'Zip']
    },
    bags: {
        brands: ['Coach', 'Michael Kors', 'Louis Vuitton', 'Gucci', 'Prada'],
        types: ['Handbag', 'Backpack', 'Tote', 'Clutch', 'Shoulder Bag'],
        colors: ['Black', 'Brown', 'Tan', 'Navy', 'Red', 'White'],
        materials: ['Leather', 'Canvas', 'Nylon', 'Suede', 'Synthetic'],
        sizes: ['Small', 'Medium', 'Large', 'Extra Large'],
        styles: ['Casual', 'Formal', 'Sports', 'Travel', 'Evening']
    },
    fashion: {
        brands: ['Zara', 'H&M', 'Uniqlo', 'Levi\'s', 'Nike'],
        types: ['T-Shirts', 'Shirts', 'Pants', 'Dresses', 'Jackets'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'White', 'Blue', 'Red', 'Grey'],
        materials: ['Cotton', 'Polyester', 'Wool', 'Linen', 'Denim'],
        styles: ['Casual', 'Formal', 'Sports', 'Ethnic', 'Party']
    },
    electronics: {
        brands: ['Apple', 'Samsung', 'Sony', 'Bose', 'JBL'],
        types: ['Mobile', 'Headphones', 'Chargers', 'Accessories'],
        colors: ['Black', 'White', 'Grey', 'Blue', 'Rose Gold'],
        features: ['Wireless', 'Noise Cancelling', 'Water Resistant', 'Fast Charging'],
        warranty: ['6 Months', '1 Year', '2 Years', '3 Years']
    },
    accessories: {
        brands: ['Ray-Ban', 'Fossil', 'Gucci', 'Prada', 'Hermès'],
        types: ['Sunglasses', 'Belts', 'Wallets', 'Scarves', 'Hats'],
        colors: ['Black', 'Brown', 'Gold', 'Silver', 'Multi'],
        materials: ['Leather', 'Metal', 'Plastic', 'Fabric', 'Wood'],
        styles: ['Casual', 'Formal', 'Sports', 'Luxury', 'Vintage']
    }
};

interface FiltersSidebarProps {
    category: 'watches' | 'shoes' | 'bags' | 'fashion' | 'electronics' | 'accessories';
    selectedFilters: {
        [key: string]: string[];
    };
    setSelectedFilters: (filters: any) => void;
    priceRange?: number[];
    setPriceRange?: (range: number[]) => void;
    isMobile?: boolean;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
    category,
    selectedFilters,
    setSelectedFilters,
    priceRange = [0, 1000000],
    setPriceRange = () => { },
    isMobile = false
}) => {
    const [openSection, setOpenSection] = useState<string | null>(null);
    const currentFilters = filterOptions[category];

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    const updateFilter = (filterType: string, value: string) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filterType]: prev[filterType].includes(value)
                ? prev[filterType].filter(item => item !== value)
                : [...prev[filterType], value]
        }));
    };

    const renderFilterSection = (title: string, filterType: string, options: string[], type: 'color' | 'checkbox' = 'checkbox') => (
        <FilterSection
            title={title}
            isOpen={openSection === filterType}
            toggleOpen={() => toggleSection(filterType)}
        >
            <div className={`${type === 'color' ? 'grid grid-cols-5 gap-3' : 'space-y-2'}`}>
                {type === 'color' ? (
                    options.map(color => (
                        <ColorSwatch
                            key={color}
                            color={color}
                            isSelected={selectedFilters[filterType]?.includes(color)}
                            onClick={() => updateFilter(filterType, color)}
                        />
                    ))
                ) : (
                    options.map(option => (
                        <label key={option} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                checked={selectedFilters[filterType]?.includes(option)}
                                onChange={() => updateFilter(filterType, option)}
                            />
                            <span className="text-gray-700 text-sm">{option}</span>
                        </label>
                    ))
                )}
            </div>
        </FilterSection>
    );

    return (
        <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200 ${!isMobile ? 'h-fit sticky top-8' : ''}`}>
            <h3 className="text-xl font-bold mb-6 text-gray-800">Filter Products</h3>

            <div className="space-y-6">
                {/* Price Range Filter */}
                <FilterSection
                    title="PRICE RANGE"
                    isOpen={openSection === 'price'}
                    toggleOpen={() => toggleSection('price')}
                >
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>₹{priceRange[0]?.toLocaleString()}</span>
                            <span>₹{priceRange[1]?.toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1000000"
                            step="1000"
                            className="w-full"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([
                                    Math.min(Number(e.target.value), priceRange[1]),
                                    priceRange[1]
                                ])}
                                className="w-1/2 p-2 border rounded-lg text-sm"
                                placeholder="Min"
                            />
                            <input
                                type="number"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([
                                    priceRange[0],
                                    Math.max(Number(e.target.value), priceRange[0])
                                ])}
                                className="w-1/2 p-2 border rounded-lg text-sm"
                                placeholder="Max"
                            />
                        </div>
                    </div>
                </FilterSection>

                {/* Category-specific filters */}
                {Object.entries(currentFilters).map(([filterType, options]) => (
                    renderFilterSection(
                        filterType.toUpperCase(),
                        filterType,
                        options as string[],
                        ['colors', 'dialColors', 'strapColors'].includes(filterType) ? 'color' : 'checkbox'
                    )
                ))}
            </div>

            {/* Clear All Button */}
            <button
                onClick={() => {
                    setSelectedFilters(
                        Object.keys(currentFilters).reduce((acc, key) => ({
                            ...acc,
                            [key]: []
                        }), {})
                    );
                    setPriceRange([0, 1000000]);
                }}
                className="w-full mt-6 py-2 px-4 text-sm font-medium text-red-600 hover:text-red-700 border border-red-100 hover:border-red-200 rounded-lg transition-colors"
            >
                Clear All Filters
            </button>
        </div>
    );
};

export default FiltersSidebar;