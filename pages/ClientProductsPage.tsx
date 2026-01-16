import React, { useState, useMemo } from 'react';
import { Member } from '../types';
import { useDatabase } from '../context/DatabaseContext';
import { useCart } from '../context/CartContext';
import ShoppingCart from '../components/ShoppingCart';
import {
    ShoppingBagIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ShoppingCartIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

interface ClientProductsPageProps {
    member: Member;
    onBack: () => void;
}

const ClientProductsPage: React.FC<ClientProductsPageProps> = ({ member, onBack }) => {
    const { products } = useDatabase();
    const { addToCart, totalItems, isInCart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [justAdded, setJustAdded] = useState<string | null>(null);

    const categories = useMemo(() => {
        const cats = ['all', ...new Set(products.map(p => p.category))];
        return cats;
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

            return matchesSearch && matchesCategory && product.stock > 0;
        });
    }, [products, searchQuery, selectedCategory]);


    const handleAddToCart = (product: any) => {
        addToCart(product, 1);
        setJustAdded(product.id);
        setTimeout(() => setJustAdded(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">Produse Disponibile</h1>
                    <p className="text-gray-400">Suplimente, echipament și merchandise</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                        <ShoppingCartIcon className="w-5 h-5" />
                        <span>Coș</span>
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        ← Înapoi
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Caută produse..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="w-5 h-5 text-gray-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'Toate Categoriile' : cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden hover:border-primary-500/50 transition-all group"
                        >
                            {/* Product Image Placeholder */}
                            <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                                <ShoppingBagIcon className="w-20 h-20 text-gray-700 group-hover:text-gray-600 transition-colors" />
                                {product.stock < 10 && (
                                    <div className="absolute top-2 right-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-semibold px-2 py-1 rounded">
                                        Stoc limitat
                                    </div>
                                )}
                                {product.stock >= 50 && (
                                    <div className="absolute top-2 left-2 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold px-2 py-1 rounded flex items-center">
                                        <SparklesIcon className="w-3 h-3 mr-1" />
                                        Popular
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <div className="mb-2">
                                    <span className="text-xs text-primary-400 font-semibold">{product.category}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{product.name}</h3>

                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-2xl font-bold text-white">{product.price.toFixed(2)} RON</div>
                                        <div className="text-xs text-gray-400">În stoc: {product.stock}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className={`w-full ${justAdded === product.id ? 'bg-green-600' : 'bg-primary-600 hover:bg-primary-700'} text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2`}
                                    disabled={justAdded === product.id}
                                >
                                    <ShoppingCartIcon className="w-5 h-5" />
                                    <span>{justAdded === product.id ? 'Adăugat!' : isInCart(product.id) ? 'Adaugă Mai Mult' : 'Adaugă în Coș'}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-12 text-center">
                    <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Nu s-au găsit produse</h3>
                    <p className="text-gray-400">
                        {searchQuery || selectedCategory !== 'all'
                            ? 'Încearcă să modifici filtrele de căutare'
                            : 'Nu sunt produse disponibile momentan'}
                    </p>
                </div>
            )}

            {/* Results Count */}
            {filteredProducts.length > 0 && (
                <div className="text-center text-sm text-gray-400">
                    Se afișează {filteredProducts.length} {filteredProducts.length === 1 ? 'produs' : 'produse'}
                </div>
            )}

            {/* Shopping Cart Slide-out */}
            <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
};

export default ClientProductsPage;
