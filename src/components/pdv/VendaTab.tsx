import { useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { CATEGORY_ICONS } from '@/lib/productCatalog';
import type { Client } from '@/lib/db';
import type { CartItem } from '@/hooks/useCart';
import { ShoppingCart, Plus, Minus, User, Search, X, Package, CheckCircle } from 'lucide-react';

interface VendaTabProps {
  items: CartItem[];
  client: Client | null;
  discount: number;
  subtotal: number;
  total: number;
  addItem: (id: number, name: string, price: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  removeItem: (id: number) => void;
  setClient: (c: Client | null) => void;
  setDiscount: (d: number) => void;
  finalizeSale: () => Promise<void>;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function playSaleSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch {}
}

export default function VendaTab({
  items, client, discount, subtotal, total,
  addItem, updateQuantity, removeItem, setClient, setDiscount, finalizeSale,
}: VendaTabProps) {
  const [showClientSheet, setShowClientSheet] = useState(false);
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const clients = useLiveQuery(() => db.clients.toArray()) ?? [];
  const products = useLiveQuery(() => db.products.toArray()) ?? [];

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 50);
    const q = productSearch.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.ref || '').toLowerCase().includes(q)
    ).slice(0, 50);
  }, [products, productSearch]);

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.city || '').toLowerCase().includes(q) ||
      (c.commerceName || '').toLowerCase().includes(q) ||
      (c.bairro || '').toLowerCase().includes(q)
    );
  }, [clients, clientSearch]);

  const showNotification = useCallback((text: string, type: 'success' | 'error') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  const handleFinalize = async () => {
    try {
      await finalizeSale();
      playSaleSound();
      showNotification('✅ Venda finalizada com sucesso!', 'success');
    } catch (e: any) {
      showNotification(e.message, 'error');
    }
  };

  const catIcon = (cat: string) => CATEGORY_ICONS[cat] || '📦';

  return (
    <div className="flex flex-col h-full relative">
      <div className="bg-card px-4 py-3 border-b border-border shadow-sm">
        <h1 className="text-lg font-bold text-foreground">Carvalho Vendas - PDV</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-52 space-y-3">
        {/* Client Card */}
        <button
          onClick={() => { setClientSearch(''); setShowClientSheet(true); }}
          className="w-full bg-card rounded-xl border border-border p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left flex-1 min-w-0">
            {client ? (
              <>
                <p className="font-semibold text-foreground truncate">{client.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[client.commerceName, client.city].filter(Boolean).join(' • ') || client.phone}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground font-medium">Selecionar Cliente</p>
            )}
          </div>
          {client && (
            <X
              className="w-5 h-5 text-muted-foreground shrink-0"
              onClick={(e) => { e.stopPropagation(); setClient(null); }}
            />
          )}
        </button>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground animate-fade-in">
            <Package className="w-14 h-14 mb-3 opacity-30" />
            <p className="font-medium">Carrinho vazio</p>
            <p className="text-sm">Toque no 🛒 para adicionar produtos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div
                key={item.productId}
                onContextMenu={(e) => { e.preventDefault(); removeItem(item.productId); }}
                className="bg-card rounded-xl border border-border p-3 shadow-sm animate-fade-in hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} un.</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center text-primary active:scale-90 transition-transform"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center font-bold text-foreground text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center text-primary active:scale-90 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="font-bold text-foreground w-[72px] text-right text-sm shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Footer - positioned above nav */}
      <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4 space-y-2 z-30">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Desc. R$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={discount || ''}
            onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
            className="flex-1 h-8 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
            placeholder="0,00"
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-foreground">TOTAL</span>
          <span className="text-xl font-extrabold text-primary">{formatCurrency(total)}</span>
        </div>
        <button
          onClick={handleFinalize}
          className="w-full h-11 bg-primary text-primary-foreground font-bold rounded-xl text-base hover:opacity-90 active:scale-[0.97] transition-all duration-200 shadow-lg glow-sm"
        >
          FINALIZAR VENDA
        </button>
      </div>

      {/* FAB - above footer */}
      <button
        onClick={() => { setProductSearch(''); setShowProductSheet(true); }}
        className="absolute bottom-[200px] right-3 w-13 h-13 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:opacity-90 active:scale-90 transition-all duration-200 z-40 glow-sm"
        style={{ width: 52, height: 52 }}
      >
        <ShoppingCart className="w-5 h-5" />
      </button>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 left-4 right-4 max-w-lg mx-auto py-4 px-5 rounded-2xl text-sm font-semibold text-center z-[60] shadow-2xl animate-scale-in flex items-center justify-center gap-2 ${
          notification.type === 'success'
            ? 'bg-primary text-primary-foreground glow-sm'
            : 'bg-destructive text-destructive-foreground'
        }`}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.text}
        </div>
      )}

      {/* Client Bottom Sheet */}
      {showClientSheet && (
        <div className="fixed inset-0 z-50" onClick={() => setShowClientSheet(false)}>
          <div className="absolute inset-0 bg-black/60 animate-fade-in" />
          <div
            className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto bg-card rounded-t-2xl flex flex-col animate-scale-in"
            style={{ maxHeight: '70vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border space-y-3 shrink-0">
              <div className="w-12 h-1 bg-muted rounded-full mx-auto" />
              <h2 className="font-bold text-lg text-foreground">Selecionar Cliente</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  placeholder="Buscar nome, cidade, comércio..."
                  autoFocus
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                />
              </div>
              <p className="text-xs text-muted-foreground">{filteredClients.length} resultado(s)</p>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {filteredClients.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setClient(c); setShowClientSheet(false); }}
                  className="w-full text-left p-3 rounded-xl border border-border hover:bg-accent hover:border-primary/30 active:scale-[0.98] transition-all duration-200"
                >
                  <p className="font-semibold text-foreground text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[c.commerceName, c.city, c.bairro, c.phone].filter(Boolean).join(' • ')}
                  </p>
                </button>
              ))}
              {filteredClients.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum cliente encontrado</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Bottom Sheet */}
      {showProductSheet && (
        <div className="fixed inset-0 z-50" onClick={() => setShowProductSheet(false)}>
          <div className="absolute inset-0 bg-black/60 animate-fade-in" />
          <div
            className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto bg-card rounded-t-2xl flex flex-col animate-scale-in"
            style={{ maxHeight: '70vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border space-y-3 shrink-0">
              <div className="w-12 h-1 bg-muted rounded-full mx-auto" />
              <h2 className="font-bold text-lg text-foreground">Adicionar Produto</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Buscar produto ou referência..."
                  autoFocus
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => { addItem(p.id!, p.name, p.price); setShowProductSheet(false); setProductSearch(''); }}
                  className="w-full text-left p-3 rounded-xl border border-border hover:bg-accent hover:border-primary/30 active:scale-[0.98] transition-all duration-200 flex items-center gap-3"
                >
                  <span className="text-xl shrink-0">{catIcon(p.category || 'Geral')}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                    {p.ref && <p className="text-[10px] text-muted-foreground">REF: {p.ref}</p>}
                  </div>
                  <p className="font-bold text-primary ml-2 shrink-0 text-sm">{formatCurrency(p.price)}</p>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum produto encontrado</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
