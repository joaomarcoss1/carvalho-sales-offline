import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Pencil, Plus, Package, Search } from 'lucide-react';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function EstoqueTab() {
  const products = useLiveQuery(() => db.products.toArray()) ?? [];
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const openNew = () => {
    setEditId(null);
    setName('');
    setPrice('');
    setShowDialog(true);
  };

  const openEdit = (p: typeof products[0]) => {
    setEditId(p.id!);
    setName(p.name);
    setPrice(p.price.toString());
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !price) return;
    if (editId) {
      await db.products.update(editId, { name: name.trim(), price: parseFloat(price) });
    } else {
      await db.products.add({ name: name.trim(), price: parseFloat(price), createdAt: new Date() });
    }
    setShowDialog(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card px-4 py-3 border-b border-border shadow-sm space-y-2">
        <h1 className="text-lg font-bold text-foreground">Gerenciar Estoque</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} produto(s) encontrado(s)</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-20 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="w-16 h-16 mb-3 opacity-30" />
            <p className="font-medium">{search ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}</p>
          </div>
        ) : (
          filtered.slice(0, 100).map(p => (
            <div key={p.id} className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                <p className="text-sm font-bold text-primary">{formatCurrency(p.price)}</p>
              </div>
              <button
                onClick={() => openEdit(p)}
                className="w-10 h-10 rounded-full hover:bg-accent flex items-center justify-center transition-colors shrink-0"
              >
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))
        )}
        {filtered.length > 100 && (
          <p className="text-center text-xs text-muted-foreground py-2">
            Mostrando 100 de {filtered.length} — refine sua busca
          </p>
        )}
      </div>

      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:opacity-90 active:scale-90 transition-all z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowDialog(false)}>
          <div className="absolute inset-0 bg-foreground/40" />
          <div className="bg-card rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl z-10 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground">{editId ? 'Editar Produto' : 'Novo Produto'}</h2>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome do produto"
              className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="Preço (R$)"
              className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowDialog(false)} className="flex-1 h-11 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
