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
        className={`relative w-8 h-8 rounded-full border-2 ${isSelected ? 'border-gray-700' : 'border-gray-200'
            } shadow-sm hover:shadow-md transition-all`}
        style={{ backgroundColor: color.toLowerCase() }}
        title={color}
    >
        {isSelected && (
            <CheckIcon className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
    </button>
);

const FiltersSidebar = ({
    // State props
    selectedBrands,
    setSelectedBrands,
    selectedDialColors,
    setSelectedDialColors,
    selectedDialShapes,
    setSelectedDialShapes,
    selectedStrapColors,
    setSelectedStrapColors,
    selectedStrapMaterials,
    setSelectedStrapMaterials,
    selectedDialThicknesses,
    setSelectedDialThicknesses,
    priceRange,
    setPriceRange
}) => {
    const [openSection, setOpenSection] = useState(null);

    const filterOptions = {
        brands: ['Titan', 'Casio', 'Fossil', 'Rolex', 'Timex', 'Seiko', 'Citizen', 'Omega', 'Tag Heuer', 'Movado', 'Michael Kors', 'Diesel'],
        dialColors: ['Black', 'Blue', 'Silver', 'Gold', 'White', 'Rose Gold', 'Green', 'Grey', 'Brown', 'Champagne'],
        dialShapes: ['Round', 'Square', 'Rectangle', 'Oval', 'Tonneau', 'Cushion', 'Pilot', 'Skeleton', 'Chronograph', 'Diamond'],
        strapColors: ['Black', 'Brown', 'Silver', 'Gold', 'Blue', 'Red', 'Green', 'Grey', 'Two-tone', 'Transparent'],
        strapMaterials: ['Leather', 'Metal', 'Nylon', 'Silicone', 'Ceramic', 'Titanium', 'Stainless Steel', 'Rubber', 'Carbon Fiber', 'Alligator'],
        dialThickness: ['Thin (<8mm)', 'Medium (8-12mm)', 'Thick (>12mm)', 'Ultra Thin (<6mm)', 'Heavy Duty (>15mm)']
    };

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 h-fit sticky top-8">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Filter Products</h3>

            <div className="space-y-6">
                {/* Price Filter */}
                <FilterSection
                    title="PRICE RANGE"
                    isOpen={openSection === 'price'}
                    toggleOpen={() => toggleSection('price')}
                >
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>₹{priceRange[0].toLocaleString()}</span>
                            <span>₹{priceRange[1].toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10000000"
                            step="1000"
                            className="w-full range-slider"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
                                className="w-1/2 p-2 border rounded-lg text-sm"
                                placeholder="Min"
                            />
                            <input
                                type="number"
                                value={priceRange[1]}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (!isNaN(value) && value >= 0) {
                                        setPriceRange([priceRange[0], Math.max(value, priceRange[0])]);
                                    }
                                }}

                                className="w-1/2 p-2 border rounded-lg text-sm"
                                placeholder="Max"
                            />
                        </div>
                    </div>
                </FilterSection>

                {/* Brands */}
                <FilterSection
                    title="BRANDS"
                    isOpen={openSection === 'brands'}
                    toggleOpen={() => toggleSection('brands')}
                >
                    <div className="max-h-60 overflow-y-auto">
                        {filterOptions.brands.map(brand => (
                            <label key={brand} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                    checked={selectedBrands.includes(brand)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedBrands([...selectedBrands, brand]);
                                        } else {
                                            setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                        }
                                    }}
                                />
                                <span className="text-gray-700 text-sm">{brand}</span>
                            </label>
                        ))}
                    </div>
                </FilterSection>

                {/* Dial Color */}
                <FilterSection
                    title="DIAL COLOR"
                    isOpen={openSection === 'dialColor'}
                    toggleOpen={() => toggleSection('dialColor')}
                >
                    <div className="grid grid-cols-5 gap-3">
                        {filterOptions.dialColors.map(color => (
                            <ColorSwatch
                                key={color}
                                color={color}
                                isSelected={selectedDialColors.includes(color)}
                                onClick={() => {
                                    setSelectedDialColors(prev =>
                                        prev.includes(color)
                                            ? prev.filter(c => c !== color)
                                            : [...prev, color]
                                    );
                                }}
                            />
                        ))}
                    </div>
                </FilterSection>

                {/* Dial Shape */}
                <FilterSection
                    title="DIAL SHAPE"
                    isOpen={openSection === 'dialShape'}
                    toggleOpen={() => toggleSection('dialShape')}
                >
                    <div className="grid grid-cols-2 gap-2">
                        {filterOptions.dialShapes.map(shape => (
                            <label key={shape} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                    checked={selectedDialShapes.includes(shape)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedDialShapes([...selectedDialShapes, shape]);
                                        } else {
                                            setSelectedDialShapes(selectedDialShapes.filter(s => s !== shape));
                                        }
                                    }}
                                />
                                <span className="text-gray-700 text-sm">{shape}</span>
                            </label>
                        ))}
                    </div>
                </FilterSection>

                {/* Strap Color */}
                <FilterSection
                    title="STRAP COLOR"
                    isOpen={openSection === 'strapColor'}
                    toggleOpen={() => toggleSection('strapColor')}
                >
                    <div className="grid grid-cols-5 gap-3">
                        {filterOptions.strapColors.map(color => (
                            <ColorSwatch
                                key={color}
                                color={color}
                                isSelected={selectedStrapColors.includes(color)}
                                onClick={() => {
                                    setSelectedStrapColors(prev =>
                                        prev.includes(color)
                                            ? prev.filter(c => c !== color)
                                            : [...prev, color]
                                    );
                                }}
                            />
                        ))}
                    </div>
                </FilterSection>

                {/* Strap Material */}
                <FilterSection
                    title="STRAP MATERIAL"
                    isOpen={openSection === 'strapMaterial'}
                    toggleOpen={() => toggleSection('strapMaterial')}
                >
                    <div className="grid grid-cols-2 gap-2">
                        {filterOptions.strapMaterials.map(material => (
                            <label key={material} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                    checked={selectedStrapMaterials.includes(material)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedStrapMaterials([...selectedStrapMaterials, material]);
                                        } else {
                                            setSelectedStrapMaterials(selectedStrapMaterials.filter(m => m !== material));
                                        }
                                    }}
                                />
                                <span className="text-gray-700 text-sm">{material}</span>
                            </label>
                        ))}
                    </div>
                </FilterSection>

                {/* Dial Thickness */}
                <FilterSection
                    title="DIAL THICKNESS"
                    isOpen={openSection === 'dialThickness'}
                    toggleOpen={() => toggleSection('dialThickness')}
                >
                    <div className="space-y-2">
                        {filterOptions.dialThickness.map(thickness => (
                            <label key={thickness} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                    checked={selectedDialThicknesses.includes(thickness)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedDialThicknesses([...selectedDialThicknesses, thickness]);
                                        } else {
                                            setSelectedDialThicknesses(selectedDialThicknesses.filter(t => t !== thickness));
                                        }
                                    }}
                                />
                                <span className="text-gray-700 text-sm">{thickness}</span>
                            </label>
                        ))}
                    </div>
                </FilterSection>
            </div>

            {/* Clear All Button */}
            <button
                onClick={() => {
                    setSelectedBrands([]);
                    setSelectedDialColors([]);
                    setSelectedDialShapes([]);
                    setSelectedStrapColors([]);
                    setSelectedStrapMaterials([]);
                    setSelectedDialThicknesses([]);
                    setPriceRange([0, 10000000]);
                }}
                className="w-full mt-6 py-2 px-4 text-sm font-medium text-red-600 hover:text-red-700 border border-red-100 hover:border-red-200 rounded-lg transition-colors"
            >
                Clear All Filters
            </button>
        </div>
    );
};

export default FiltersSidebar;