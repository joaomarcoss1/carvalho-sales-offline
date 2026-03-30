import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Client, Product } from '@/lib/db';
import type { CartItem } from '@/hooks/useCart';
import { ShoppingCart, Plus, Minus, User, Search, X, Package } from 'lucide-react';

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

export default function VendaTab({
  items, client, discount, subtotal, total,
  addItem, updateQuantity, removeItem, setClient, setDiscount, finalizeSale,
}: VendaTabProps) {
  const [showClientSheet, setShowClientSheet] = useState(false);
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [message, setMessage] = useState('');

  const clients = useLiveQuery(() => db.clients.toArray()) ?? [];
  const products = useLiveQuery(() => db.products.toArray()) ?? [];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleFinalize = async () => {
    try {
      await finalizeSale();
      setMessage('Venda finalizada com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e: any) {
      setMessage(e.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="bg-card px-4 py-3 border-b border-border shadow-sm">
        <h1 className="text-lg font-bold text-foreground">Carvalho Vendas - PDV</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-56 space-y-3">
        {/* Client Card */}
        <button
          onClick={() => setShowClientSheet(true)}
          className="w-full bg-card rounded-xl border border-border p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left flex-1 min-w-0">
            {client ? (
              <>
                <p className="font-semibold text-foreground truncate">{client.name}</p>
                <p className="text-xs text-muted-foreground truncate">{client.phone}</p>
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
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="w-16 h-16 mb-3 opacity-30" />
            <p className="font-medium">Carrinho vazio</p>
            <p className="text-sm">Toque no + para adicionar produtos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div
                key={item.productId}
                onContextMenu={(e) => { e.preventDefault(); removeItem(item.productId); }}
                className="bg-card rounded-xl border border-border p-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} un.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-bold text-foreground w-20 text-right text-sm">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Footer */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 space-y-3 z-30">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Desconto R$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={discount || ''}
            onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
            className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="0,00"
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-foreground">TOTAL</span>
          <span className="text-2xl font-extrabold text-primary">{formatCurrency(total)}</span>
        </div>
        <button
          onClick={handleFinalize}
          className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
        >
          FINALIZAR VENDA
        </button>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowProductSheet(true)}
        className="fixed bottom-52 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:opacity-90 active:scale-90 transition-all z-40"
      >
        <ShoppingCart className="w-6 h-6" />
      </button>

      {/* Snackbar */}
      {message && (
        <div className="fixed top-4 left-4 right-4 bg-foreground text-background py-3 px-4 rounded-xl text-sm font-medium text-center z-50 animate-in fade-in slide-in-from-top-2">
          {message}
        </div>
      )}

      {/* Client Bottom Sheet */}
      {showClientSheet && (
        <div className="fixed inset-0 z-50" onClick={() => setShowClientSheet(false)}>
          <div className="absolute inset-0 bg-foreground/40" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border">
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-3" />
              <h2 className="font-bold text-lg text-foreground">Selecionar Cliente</h2>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {clients.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setClient(c); setShowClientSheet(false); }}
                  className="w-full text-left p-3 rounded-xl border border-border hover:bg-accent transition-colors"
                >
                  <p className="font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </button>
              ))}
              {clients.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum cliente cadastrado</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Bottom Sheet */}
      {showProductSheet && (
        <div className="fixed inset-0 z-50" onClick={() => setShowProductSheet(false)}>
          <div className="absolute inset-0 bg-foreground/40" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border space-y-3">
              <div className="w-12 h-1 bg-muted rounded-full mx-auto" />
              <h2 className="font-bold text-lg text-foreground">Adicionar Produto</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Buscar produto..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => { addItem(p.id!, p.name, p.price); setShowProductSheet(false); setProductSearch(''); }}
                  className="w-full text-left p-3 rounded-xl border border-border hover:bg-accent transition-colors flex justify-between items-center"
                >
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="font-bold text-primary">{formatCurrency(p.price)}</p>
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
