import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, Search, X, Package, User, Trash2, Receipt, History, BarChart3, Tag, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  category?: string;
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type TabType = 'venda' | 'historico' | 'produtos';

export default function PDV() {
  const { user, isAdmin } = useAuthContext();
  const [products, setProducts] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [showProducts, setShowProducts] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('venda');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showReceipt, setShowReceipt] = useState<any>(null);

  useEffect(() => {
    const loadBusinesses = async () => {
      if (isAdmin) {
        const { data } = await supabase.from('businesses').select('*').eq('approved', true);
        setBusinesses(data || []);
      } else if (user) {
        const { data } = await supabase.from('businesses').select('*').eq('owner_id', user.id);
        setBusinesses(data || []);
        if (data?.[0]) setSelectedBusiness(data[0].id);
      }
    };
    loadBusinesses();
  }, [user, isAdmin]);

  useEffect(() => {
    if (!selectedBusiness) return;
    supabase.from('products').select('*').eq('business_id', selectedBusiness).order('category').then(({ data }) => setProducts(data || []));
    supabase.from('orders').select('*, order_items(*)').eq('business_id', selectedBusiness).order('created_at', { ascending: false }).limit(50).then(({ data }) => setOrders(data || []));
  }, [selectedBusiness]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'Geral'));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== 'all') filtered = filtered.filter(p => (p.category || 'Geral') === selectedCategory);
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    return filtered;
  }, [products, selectedCategory, search]);

  const addItem = (p: any) => {
    if (p.stock <= 0) { toast.error('Produto sem estoque'); return; }
    const inCart = cart.find(i => i.productId === p.id);
    if (inCart && inCart.quantity >= p.stock) { toast.error('Estoque insuficiente'); return; }
    setCart(prev => {
      const existing = prev.find(i => i.productId === p.id);
      if (existing) return prev.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: p.id, productName: p.name, price: Number(p.price), quantity: 1, category: p.category }];
    });
    toast.success(`${p.name} adicionado`);
  };

  const updateQty = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    setCart(prev => prev.map(i => {
      if (i.productId !== id) return i;
      const newQty = i.quantity + delta;
      if (product && newQty > product.stock) { toast.error('Estoque insuficiente'); return i; }
      return { ...i, quantity: Math.max(0, newQty) };
    }).filter(i => i.quantity > 0));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountValue = discountType === 'percent' ? subtotal * (discount / 100) : discount;
  const total = Math.max(0, subtotal - discountValue);

  const finalize = async () => {
    if (!selectedBusiness || cart.length === 0) { toast.error('Adicione produtos ao carrinho'); return; }
    setLoading(true);

    const { data: order, error } = await supabase.from('orders').insert({
      business_id: selectedBusiness,
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      subtotal,
      discount: discountValue,
      total,
      status: 'completed',
    }).select().single();

    if (error || !order) { toast.error('Erro ao finalizar venda'); setLoading(false); return; }

    await supabase.from('order_items').insert(
      cart.map(i => ({ order_id: order.id, product_id: i.productId, product_name: i.productName, price: i.price, quantity: i.quantity }))
    );

    // Update stock
    for (const item of cart) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        await supabase.from('products').update({ stock: Math.max(0, product.stock - item.quantity) }).eq('id', item.productId);
      }
    }

    setShowReceipt({ ...order, items: cart, businessName: businesses.find(b => b.id === selectedBusiness)?.name });
    toast.success('Venda finalizada!');
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setLoading(false);

    // Reload products and orders
    supabase.from('products').select('*').eq('business_id', selectedBusiness).order('category').then(({ data }) => setProducts(data || []));
    supabase.from('orders').select('*, order_items(*)').eq('business_id', selectedBusiness).order('created_at', { ascending: false }).limit(50).then(({ data }) => setOrders(data || []));
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'venda', label: 'Nova Venda', icon: ShoppingCart },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'produtos', label: 'Produtos', icon: Package },
  ];

  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total || 0), 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" /> PDV Profissional
          </h1>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Hoje</p>
            <p className="text-sm font-bold gradient-text">{fmt(todayRevenue)}</p>
          </div>
        </div>
        {(isAdmin || businesses.length > 1) && (
          <select value={selectedBusiness} onChange={e => setSelectedBusiness(e.target.value)}
            className="w-full h-10 px-3 rounded-xl glass-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none mb-2">
            <option value="">Selecionar empresa</option>
            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <div className="flex gap-2">
          {tabs.map(t => (
            <motion.button key={t.id} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === t.id ? 'gradient-primary text-background' : 'glass-surface text-muted-foreground'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-4 space-y-3">
        {activeTab === 'venda' && (
          <>
            {/* Customer */}
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <User className="w-4 h-4 text-primary" /> Cliente (opcional)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nome" className="h-10 px-3 rounded-xl glass-surface text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Telefone" className="h-10 px-3 rounded-xl glass-surface text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            {/* Cart */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" /> Carrinho ({cart.length})
                </span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowProducts(true)} className="h-8 px-3 gradient-primary text-background text-xs font-medium rounded-lg flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </motion.button>
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-sm">Carrinho vazio</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map(item => (
                    <motion.div key={item.productId} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="glass-surface rounded-xl p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{fmt(item.price)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQty(item.productId, -1)} className="w-7 h-7 rounded-lg border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-background transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </motion.button>
                        <span className="w-6 text-center font-bold text-foreground text-sm">{item.quantity}</span>
                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQty(item.productId, 1)} className="w-7 h-7 rounded-lg border border-primary/50 text-primary flex items-center justify-center hover:bg-primary hover:text-background transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                      <p className="font-bold text-foreground text-sm w-16 text-right">{fmt(item.price * item.quantity)}</p>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => setCart(prev => prev.filter(i => i.productId !== item.productId))} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            {cart.length > 0 && (
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" /> Desconto
                  </span>
                  <div className="flex-1 flex gap-1">
                    <input type="number" min="0" step="0.01" value={discount || ''} onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                      className="flex-1 h-9 px-3 rounded-lg glass-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="0" />
                    <button onClick={() => setDiscountType(d => d === 'fixed' ? 'percent' : 'fixed')}
                      className="h-9 px-3 rounded-lg glass-surface text-primary text-xs font-bold">
                      {discountType === 'fixed' ? 'R$' : '%'}
                    </button>
                  </div>
                </div>
                {discountValue > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-destructive">Desconto</span>
                    <span className="text-destructive">-{fmt(discountValue)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-base font-bold text-foreground">TOTAL</span>
                  <span className="text-2xl font-extrabold gradient-text">{fmt(total)}</span>
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={finalize} disabled={loading}
                  className="w-full h-12 gradient-primary text-background font-bold rounded-xl text-base glow-sm disabled:opacity-50">
                  {loading ? 'Finalizando...' : '✅ FINALIZAR VENDA'}
                </motion.button>
              </div>
            )}
          </>
        )}

        {activeTab === 'historico' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{todayOrders.length}</p>
                <p className="text-xs text-muted-foreground">Vendas hoje</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold gradient-text">{fmt(todayRevenue)}</p>
                <p className="text-xs text-muted-foreground">Receita hoje</p>
              </div>
            </div>
            {orders.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma venda registrada</p>}
            {orders.map(o => (
              <motion.div key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{o.customer_name || 'Sem cliente'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg ${o.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {o.status === 'completed' ? '✅ Concluído' : '⏳ Pendente'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                  <span>{o.order_items?.length || 0} itens</span>
                  {o.discount > 0 && <span className="text-destructive">-{fmt(Number(o.discount))}</span>}
                  <span className="font-bold text-foreground">{fmt(Number(o.total))}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'produtos' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..."
                className="w-full h-10 pl-10 pr-4 rounded-xl glass-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'gradient-primary text-background' : 'glass-surface text-muted-foreground'}`}>
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>
            {filteredProducts.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum produto</p>}
            {filteredProducts.map(p => (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass-surface flex items-center justify-center">
                  <Tag className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category || 'Geral'} • Estoque: {p.stock}</p>
                </div>
                <p className="font-bold text-primary text-sm">{fmt(Number(p.price))}</p>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => addItem(p)}
                  className="w-8 h-8 rounded-lg gradient-primary text-background flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Product sheet (for venda tab quick add) */}
      <AnimatePresence>
        {showProducts && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50" onClick={() => setShowProducts(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className="absolute bottom-0 left-0 right-0 glass rounded-t-3xl max-h-[75vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-border space-y-3">
                <div className="w-12 h-1 bg-muted rounded-full mx-auto" />
                <h2 className="font-bold text-lg text-foreground">Adicionar Produto</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl glass-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-2">
                {filteredProducts.map(p => (
                  <motion.button key={p.id} whileTap={{ scale: 0.98 }} onClick={() => { addItem(p); setShowProducts(false); }}
                    className="w-full text-left p-3 rounded-xl glass-card hover:border-primary/20 transition-colors flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Estoque: {p.stock}</p>
                    </div>
                    <p className="font-bold text-primary">{fmt(Number(p.price))}</p>
                  </motion.button>
                ))}
                {filteredProducts.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum produto encontrado</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowReceipt(null)} />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative glass rounded-3xl w-full max-w-sm p-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-3 flex items-center justify-center glow-sm">
                  <Receipt className="w-8 h-8 text-background" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Venda Concluída!</h2>
                <p className="text-xs text-muted-foreground">{showReceipt.businessName}</p>
              </div>
              <div className="glass-surface rounded-xl p-3 space-y-2">
                {showReceipt.items?.map((item: CartItem) => (
                  <div key={item.productId} className="flex justify-between text-xs">
                    <span className="text-foreground">{item.quantity}× {item.productName}</span>
                    <span className="text-foreground font-medium">{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3">
                {showReceipt.discount > 0 && (
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-destructive">Desconto</span>
                    <span className="text-destructive">-{fmt(Number(showReceipt.discount))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="text-xl font-extrabold gradient-text">{fmt(Number(showReceipt.total))}</span>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowReceipt(null)}
                className="w-full h-11 gradient-primary text-background font-bold rounded-xl">
                Fechar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
