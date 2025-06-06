import { Link } from "react-router-dom";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface ProductCardProps {
    item: {
        id: string;
        collectionName: string;
        Image?: string;
        images?: string[];
        Company?: string;
        Brand?: string;
        Name?: string;
        Price: number;
        Description?: string;
        rating?: number;
        Warranty?: {
            Duration?: string;
            Type?: string;
            Status?: string;
        };
    };
    isWishlisted: boolean;
    onToggleWishlist: (id: string) => void;
    onAddToCart: (e: React.MouseEvent, item: any) => void;
}

const ProductCard = ({ item, isWishlisted, onToggleWishlist, onAddToCart }: ProductCardProps) => {
    const renderRating = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`text-${i < rating ? 'yellow-400' : 'gray-500'}`}>★</span>
        ));
    };

    return (
        <Link
            to={`/details/${item.collectionName}/${item.id}`}
            className="block h-full"
        >
            <div className="group relative bg-gray-100 rounded-lg overflow-hidden border border-gray-300 hover:border-gray-400 transition-all duration-300 h-full flex flex-col">
                {/* Simplified warranty badge */}
                {item.Warranty && item.Warranty.Status === 'Active' && (
                    <div className="absolute top-2 left-2 z-10">
                        <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Warranty
                        </div>
                    </div>
                )}

                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onToggleWishlist(item.id);
                        }}
                        className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 backdrop-blur-sm"
                    >
                        {isWishlisted ? (
                            <HeartSolidIcon className="w-5 h-5 text-red-500" />
                        ) : (
                            <HeartIcon className="w-5 h-5 text-gray-800" />
                        )}
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onAddToCart(e, item);
                        }}
                        className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 backdrop-blur-sm"
                    >
                        <ShoppingBagIcon className="w-5 h-5 text-gray-800" />
                    </button>
                </div>

                <div className="aspect-square overflow-hidden relative">
                    <img
                        src={item.Image || item.images?.[0]}
                        alt={item.Company || item.Brand || item.Name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                <div className="p-4 space-y-1 flex flex-col flex-1">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="text-xl font-medium uppercase tracking-wide text-gray-900 line-clamp-1">
                                {item.Company || item.Brand || item.Name}
                            </h3>
                            {item.Name && (item.Company || item.Brand) && (
                                <p className="text-sm text-gray-600 line-clamp-1">{item.Name}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {renderRating(item.rating || 0)}
                        </div>
                    </div>
                    <p className="text-gray-600 text-lg font-light">Rs. {item.Price}</p>
                    <p className="text-gray-500 text-sm line-clamp-2 flex-1">{item.Description}</p>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onAddToCart(e, item);
                            }}
                            className="flex-1 py-2 text-sm uppercase tracking-wide border border-gray-400 rounded-md hover:bg-gray-300/30 transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
