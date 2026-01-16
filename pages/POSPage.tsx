
import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Product, Member } from '../types';
import * as Icons from '../components/icons';
import StripePaymentModal from '../components/StripePaymentModal';
import { useNotifications } from '../context/NotificationContext';
import FormModal from '../components/FormModal';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { usePayments } from '../hooks/usePayments';
import { productsAPI } from '../lib/apiClient';

interface CartItem extends Product {
    quantity: number;
}

const ReceiptModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    total: number;
    member: Member | null;
    method: string;
}> = ({ isOpen, onClose, cart, total, member, method }) => {
    const txnId = useMemo(() => Math.random().toString(36).substr(2, 9).toUpperCase(), []);

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Tranzacție Finalizată">
            <div className="bg-white text-black p-8 rounded-3xl space-y-6 shadow-inner font-mono text-sm">
                <div className="text-center space-y-1">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Pegasus Elite Hub</h2>
                    <p className="text-[10px] uppercase font-bold opacity-60">Str. Performanței, Nr. 1, București</p>
                    <p className="text-[10px] font-bold">CUI: RO123456789</p>
                </div>

                <div className="border-t border-dashed border-black/20 pt-4 space-y-1 text-xs">
                    <div className="flex justify-between"><span>Data:</span> <span>{format(new Date(), 'dd.MM.yyyy HH:mm')}</span></div>
                    <div className="flex justify-between"><span>Tranzacție:</span> <span>#{txnId}</span></div>
                    <div className="flex justify-between"><span>Casier:</span> <span>Admin Pegasus</span></div>
                    <div className="flex justify-between"><span>Client:</span> <span>{member ? `${member.firstName} ${member.lastName}` : 'CLIENT OCAZIONAL'}</span></div>
                </div>

                <div className="border-t border-b border-dashed border-black/20 py-4 space-y-2">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between gap-4">
                            <span className="flex-1 truncate uppercase font-bold text-[10px]">{item.name}</span>
                            <span className="whitespace-nowrap">x{item.quantity}</span>
                            <span className="font-bold">{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-1 text-right">
                    <div className="flex justify-between items-center text-lg font-black">
                        <span className="uppercase tracking-tighter">TOTAL RON</span>
                        <span>{total.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] font-bold opacity-60 uppercase">Metodă: {method}</p>
                </div>

                <div className="pt-4 text-center">
                    <div className="w-full h-12 bg-black flex items-center justify-center text-white font-black tracking-[0.5em] rounded mb-2">
                        ||||| ||| || ||||
                    </div>
                    <p className="text-[8px] font-bold uppercase opacity-40">Vă mulțumim pentru vizită!</p>
                </div>
            </div>

            <div className="mt-8 flex gap-3">
                <button onClick={() => window.print()} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all">
                    <Icons.PrinterIcon className="w-5 h-5" /> Print
                </button>
                <button onClick={onClose} className="flex-1 py-4 bg-primary-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">
                    Închide
                </button>
            </div>
        </FormModal>
    );
};

const ProductCard: React.FC<{
    product: Product;
    categoryName: string;
    onClick: () => void
}> = ({ product, categoryName, onClick }) => {
    const isOutOfStock = product.stock <= 0;

    return (
        <div
            onClick={!isOutOfStock ? onClick : undefined}
            className={`bg-white dark:bg-card-dark rounded-3xl p-5 border border-border-light dark:border-border-dark transition-all duration-300 group flex flex-col h-full relative overflow-hidden ${isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:border-primary-500 hover:shadow-2xl'}`}
        >
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isOutOfStock ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-background-dark opacity-60'}`}>
                {isOutOfStock ? 'Stoc epuizat' : `${product.stock} în stoc`}
            </div>
            <div className="h-32 bg-gray-100 dark:bg-background-dark rounded-2xl mb-4 flex items-center justify-center text-text-light-secondary dark:text-text-dark-secondary group-hover:scale-105 transition-transform">
                <Icons.ArchiveIcon className="w-12 h-12 opacity-40" />
            </div>
            <h3 className="font-black text-text-light-primary dark:text-text-dark-primary leading-tight text-lg mb-2">{product.name}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-4">{categoryName}</p>
            <div className="mt-auto pt-4 border-t border-border-light dark:border-border-dark flex justify-between items-center">
                <span className="text-xl font-black text-text-light-primary dark:text-text-dark-primary">{product.price.toFixed(2)} RON</span>
                <div className={`p-2 rounded-xl shadow-lg transition-colors ${isOutOfStock ? 'bg-gray-400' : 'bg-primary-500 text-white shadow-primary-500/30 group-hover:bg-primary-600'}`}>
                    <Icons.PlusIcon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
};

const POSPage: React.FC = () => {
    const { products, members, updateProduct, onlineHubSettings, productCategories, currentLocationId, locations } = useDatabase();
    const { notify } = useNotifications();
    const { processPayment, loading: paymentLoading } = usePayments();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [finalCart, setFinalCart] = useState<CartItem[]>([]);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [finalMember, setFinalMember] = useState<Member | null>(null);
    const [finalMethod, setFinalMethod] = useState('');
    const [searchMemberTerm, setSearchMemberTerm] = useState('');
    const [activeCategoryId, setActiveCategoryId] = useState<string | 'All'>('All');
    const [isStripeOpen, setIsStripeOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    const activeLocationId = useMemo(() => {
        return currentLocationId === 'all' ? (locations[0]?.id || 'loc_central') : currentLocationId;
    }, [currentLocationId, locations]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => (activeCategoryId === 'All' || p.category === activeCategoryId) && (currentLocationId === 'all' || p.locationId === currentLocationId));
    }, [products, activeCategoryId, currentLocationId]);

    const addToCart = (product: Product) => {
        const cartItem = cart.find(item => item.id === product.id);
        const currentQtyInCart = cartItem ? cartItem.quantity : 0;

        if (product.stock <= currentQtyInCart) {
            notify("Nu poți adăuga mai multe produse decât sunt disponibile în stoc.", "warning");
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                if (newQty > product.stock && delta > 0) {
                    notify("Stoc insuficient.", "warning");
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const total = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

    const finalizeSale = async (method: 'Cash' | 'Card' | 'Stripe', stripeRef?: string) => {
        if (cart.length === 0) return;

        try {
            // 1. Process Payment via API
            await processPayment({
                memberId: selectedMember?.id || 'casual_sale',
                locationId: activeLocationId,
                amount: total,
                date: new Date().toISOString(),
                description: `Vânzare POS: ${cart.map(i => `${i.name} x${i.quantity}`).join(', ')}`,
                method,
                stripeRef,
                status: 'succeeded',
                items: cart.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity, price: i.price }))
            });

            // 2. Update Stock via API (Parallel or Sequential)
            // Using productsAPI directly for stock updates
            await Promise.all(cart.map(async (item) => {
                const newStock = item.stock - item.quantity;
                // Update local context for UI responsiveness (optional if we re-fetch)
                updateProduct({ ...item, stock: newStock });
                // Update Backend
                await productsAPI.update(item.id, { stock: newStock });
            }));

            setFinalCart([...cart]);
            setFinalMember(selectedMember);
            setFinalMethod(method);
            setIsReceiptOpen(true);

            setCart([]);
            setSelectedMember(null);
            notify("Vânzare finalizată cu succes!", "success");

        } catch (err) {
            console.error("Payment failed", err);
            notify("Eroare la procesarea vânzării. Stocul nu a fost modificat.", "error");
        }
    };

    const handleCheckout = (method: 'Cash' | 'Card') => {
        if (method === 'Card' && onlineHubSettings.stripe.enabled) {
            setIsStripeOpen(true);
        } else {
            finalizeSale(method);
        }
    };

    const filteredMembers = useMemo(() => {
        if (!searchMemberTerm) return [];
        return members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchMemberTerm.toLowerCase())).slice(0, 5);
    }, [members, searchMemberTerm]);

    return (
        <div className="flex flex-col lg:flex-row h-full -m-4 sm:-m-6 md:-m-8 animate-fadeIn">
            <StripePaymentModal
                isOpen={isStripeOpen}
                onClose={() => setIsStripeOpen(false)}
                amount={total}
                description="Achiziție Produse POS"
                onSuccess={(ref) => finalizeSale('Stripe', ref)}
            />

            <ReceiptModal
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                cart={finalCart}
                total={finalCart.reduce((s, i) => s + (i.price * i.quantity), 0)}
                member={finalMember}
                method={finalMethod}
            />

            <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-background-dark">
                <header className="p-8 border-b border-border-light dark:border-border-dark bg-white dark:bg-card-dark">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter">Terminal Vânzări</h1>
                            <p className="text-[10px] text-primary-500 font-black uppercase tracking-[0.3em] mt-1">
                                {currentLocationId === 'all' ? 'Vânzare Globală' : locations.find(l => l.id === currentLocationId)?.name}
                            </p>
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            <button
                                onClick={() => setActiveCategoryId('All')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategoryId === 'All' ? 'bg-primary-500 text-black shadow-lg' : 'bg-gray-100 dark:bg-background-dark text-gray-500'}`}
                            >
                                Toate Produsele
                            </button>
                            {productCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategoryId(cat.id)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategoryId === cat.id ? 'bg-primary-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-background-dark text-gray-500'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {filteredProducts.map(p => (
                            <ProductCard
                                key={p.id}
                                product={p}
                                categoryName={productCategories.find(c => c.id === p.category)?.name || 'General'}
                                onClick={() => addToCart(p)}
                            />
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center">
                                <Icons.ArchiveIcon className="w-16 h-16 mb-4" />
                                <p className="font-black uppercase tracking-widest text-xs">Niciun produs disponibil în această selecție.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-[450px] bg-white dark:bg-card-dark border-l border-border-light dark:border-border-dark flex flex-col shadow-2xl z-10">
                <header className="p-8 border-b border-border-light dark:border-border-dark">
                    <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <Icons.ShoppingCartIcon className="w-6 h-6 text-primary-500" />
                        Coș de Cumpărături
                    </h2>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-light-secondary opacity-60">Asociază Client (Puncte Loialitate)</label>
                        {selectedMember ? (
                            <div className="flex items-center justify-between p-4 bg-primary-500/5 rounded-2xl border border-primary-500/20 group animate-scaleIn">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-black">{selectedMember.avatar}</div>
                                    <div>
                                        <p className="font-black text-sm">{selectedMember.firstName} {selectedMember.lastName}</p>
                                        <p className="text-[10px] uppercase font-bold text-primary-500">Profil Verificat</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedMember(null)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Icons.XIcon className="w-5 h-5" /></button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Icons.SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                <input
                                    type="text"
                                    placeholder="Caută membru..."
                                    value={searchMemberTerm}
                                    onChange={e => setSearchMemberTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                {filteredMembers.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-2xl overflow-hidden z-20 animate-scaleIn">
                                        {filteredMembers.map(m => (
                                            <button key={m.id} onClick={() => { setSelectedMember(m); setSearchMemberTerm(''); }} className="w-full text-left p-4 hover:bg-primary-500/5 border-b border-border-light dark:border-border-dark last:border-0 flex items-center gap-3 transition-colors">
                                                <div className="w-8 h-8 bg-gray-100 dark:bg-background-dark rounded-full flex items-center justify-center font-black text-xs">{m.avatar}</div>
                                                <span className="font-bold text-sm">{m.firstName} {m.lastName}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-border-light dark:bg-border-dark"></div>

                    <div className="space-y-4">
                        {cart.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center opacity-20 italic">
                                <Icons.ShoppingCartIcon className="w-16 h-16 mb-4" />
                                <p className="font-black uppercase tracking-widest text-[10px]">Coșul este gol</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex justify-between items-center group animate-fadeInUp">
                                    <div className="flex-1">
                                        <p className="font-bold text-sm leading-tight">{item.name}</p>
                                        <p className="text-[10px] text-primary-500 font-black uppercase mt-1">{item.price.toFixed(2)} RON</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-background-dark p-1.5 rounded-xl border border-border-light dark:border-border-dark">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-200 dark:hover:bg-card-dark rounded-lg transition-colors"><Icons.XIcon className="w-3 h-3" /></button>
                                        <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-card-dark rounded-lg transition-colors"><Icons.PlusIcon className="w-3 h-3" /></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-40 group-hover:opacity-100"><Icons.TrashIcon className="w-4 h-4" /></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <footer className="p-8 border-t border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark/30 space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-text-light-secondary opacity-60 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span>{total.toFixed(2)} RON</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xl font-black uppercase tracking-tighter">Total de Plată</span>
                            <span className="text-4xl font-black text-primary-500">{total.toFixed(2)} RON</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            disabled={cart.length === 0}
                            onClick={() => handleCheckout('Cash')}
                            className="py-4 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:bg-gray-50 transition-all disabled:opacity-30 active:scale-95"
                        >
                            Încasare CASH
                        </button>
                        <button
                            disabled={cart.length === 0}
                            onClick={() => handleCheckout('Card')}
                            className="py-4 bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all active:scale-95 disabled:opacity-30"
                        >
                            Plată CARD
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default POSPage;
