import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Search, X, Package, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function PDV() {
  const { user, isAdmin } = useAuthContext();
  const [products, setProducts] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showProducts, setShowProducts] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

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
    supabase.from('products').select('*').eq('business_id', selectedBusiness).then(({ data }) => setProducts(data || []));
  }, [selectedBusiness]);

  const addItem = (p: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === p.id);
      if (existing) return prev.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: p.id, productName: p.name, price: Number(p.price), quantity: 1 }];
    });
    setShowProducts(false);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.productId === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const finalize = async () => {
    if (!selectedBusiness || cart.length === 0) { toast.error('Adicione produtos ao carrinho'); return; }
    setLoading(true);

    const { data: order, error } = await supabase.from('orders').insert({
      business_id: selectedBusiness,
      customer_name: customerName,
      customer_phone: customerPhone,
      subtotal,
      discount,
      total,
      status: 'completed',
    }).select().single();

    if (error || !order) { toast.error('Erro ao finalizar venda'); setLoading(false); return; }

    await supabase.from('order_items').insert(
      cart.map(i => ({
        order_id: order.id,
        product_id: i.productId,
        product_name: i.productName,
        price: i.price,
        quantity: i.quantity,
      }))
    );

    toast.success('Venda finalizada!');
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setLoading(false);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-40 glass border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">PDV - Ponto de Venda</h1>
        {(isAdmin || businesses.length > 1) && (
          <select value={selectedBusiness} onChange={e => setSelectedBusiness(e.target.value)}
            className="mt-2 w-full h-10 px-3 rounded-xl glass-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
            <option value="">Selecionar empresa</option>
            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-64 space-y-3">
        {/* Customer */}
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <User className="w-4 h-4 text-primary" /> Cliente
          </div>
          <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nome do cliente" className="w-full h-10 px-3 rounded-xl glass-surface text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Telefone" className="w-full h-10 px-3 rounded-xl glass-surface text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {/* Cart */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <Package className="w-16 h-16 mb-3 opacity-20" />
            <p className="font-medium">Carrinho vazio</p>
            <p className="text-sm">Toque no + para adicionar</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.productId} className="glass-card rounded-2xl p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{item.productName}</p>
                <p className="text-xs text-muted-foreground">{fmt(item.price)} un.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.productId, -1)} className="w-8 h-8 rounded-lg border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-background transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-bold text-foreground text-sm">{item.quantity}</span>
                <button onClick={() => updateQty(item.productId, 1)} className="w-8 h-8 rounded-lg border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-background transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="font-bold text-foreground text-sm w-20 text-right">{fmt(item.price * item.quantity)}</p>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-16 left-0 right-0 glass border-t border-border p-4 space-y-3 z-30">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">{fmt(subtotal)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Desconto R$</span>
          <input type="number" min="0" step="0.01" value={discount || ''} onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
            className="flex-1 h-9 px-3 rounded-lg glass-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="0,00" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-foreground">TOTAL</span>
          <span className="text-2xl font-extrabold text-primary">{fmt(total)}</span>
        </div>
        <button onClick={finalize} disabled={loading || cart.length === 0}
          className="w-full h-12 gradient-primary text-background font-bold rounded-xl text-base active:scale-[0.98] transition-all glow-sm disabled:opacity-50">
          {loading ? 'Finalizando...' : 'FINALIZAR VENDA'}
        </button>
      </div>

      {/* FAB */}
      <button onClick={() => setShowProducts(true)} className="fixed bottom-52 right-4 w-14 h-14 gradient-primary text-background rounded-2xl glow-sm flex items-center justify-center active:scale-90 transition-all z-40">
        <ShoppingCart className="w-6 h-6" />
      </button>

      {/* Product sheet */}
      {showProducts && (
        <div className="fixed inset-0 z-50" onClick={() => setShowProducts(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute bottom-0 left-0 right-0 glass rounded-t-3xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border space-y-3">
              <div className="w-12 h-1 bg-muted rounded-full mx-auto" />
              <h2 className="font-bold text-lg text-foreground">Adicionar Produto</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..." className="w-full h-10 pl-10 pr-4 rounded-xl glass-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {filteredProducts.map(p => (
                <button key={p.id} onClick={() => addItem(p)} className="w-full text-left p-3 rounded-xl glass-card hover:border-primary/20 transition-colors flex justify-between items-center">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="font-bold text-primary">{fmt(Number(p.price))}</p>
                </button>
              ))}
              {filteredProducts.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum produto encontrado</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
