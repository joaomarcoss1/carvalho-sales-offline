import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { CATEGORY_ICONS } from '@/lib/productCatalog';
import { Pencil, Plus, Package, Search } from 'lucide-react';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function EstoqueTab() {
  const products = useLiveQuery(() => db.products.toArray()) ?? [];
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [ref, setRef] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Geral');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'Geral'));
    return ['', ...Array.from(cats).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let result = products;
    if (filterCategory) {
      result = result.filter(p => (p.category || 'Geral') === filterCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.ref || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, search, filterCategory]);

  const openNew = () => {
    setEditId(null);
    setName(''); setRef(''); setPrice(''); setCategory('Geral');
    setShowDialog(true);
  };

  const openEdit = (p: typeof products[0]) => {
    setEditId(p.id!);
    setName(p.name);
    setRef(p.ref || '');
    setPrice(p.price.toString());
    setCategory(p.category || 'Geral');
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !price) return;
    const data = {
      name: name.trim(),
      ref: ref.trim(),
      price: parseFloat(price),
      category: category.trim() || 'Geral',
    };
    try {
      if (editId) {
        await db.products.update(editId, data);
      } else {
        await db.products.add({ ...data, createdAt: new Date() });
      }
      setShowDialog(false);
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
    }
  };

  const icon = (cat: string) => CATEGORY_ICONS[cat] || '📦';
  const inputClass = "w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200";

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
            placeholder="Buscar produto ou referência..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat || '_all'}
              onClick={() => setFilterCategory(cat)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 ${
                filterCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
            >
              {cat ? `${icon(cat)} ${cat}` : 'Todos'}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} produto(s)</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-20 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground animate-fade-in">
            <Package className="w-16 h-16 mb-3 opacity-30" />
            <p className="font-medium">{search || filterCategory ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}</p>
          </div>
        ) : (
          filtered.slice(0, 100).map((p, i) => (
            <div
              key={p.id}
              className="bg-card rounded-xl border border-border p-3 shadow-sm flex items-center gap-3 animate-fade-in hover:shadow-md hover:border-primary/30 transition-all duration-200"
              style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
            >
              <span className="text-2xl shrink-0">{icon(p.category || 'Geral')}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-primary">{formatCurrency(p.price)}</span>
                  {p.ref && <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">REF: {p.ref}</span>}
                </div>
                <span className="text-[10px] text-muted-foreground">{p.category || 'Geral'}</span>
              </div>
              <button
                onClick={() => openEdit(p)}
                className="w-9 h-9 rounded-full hover:bg-accent flex items-center justify-center transition-all duration-200 shrink-0 active:scale-90"
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
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:opacity-90 active:scale-90 transition-all duration-200 z-40 glow-sm"
      >
        <Plus className="w-7 h-7" />
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDialog(false)}>
          <div className="absolute inset-0 bg-black/60 animate-fade-in" />
          <div
            className="bg-card rounded-2xl w-full max-w-sm max-h-[80vh] shadow-2xl z-10 flex flex-col animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 pb-3 shrink-0">
              <h2 className="text-lg font-bold text-foreground">{editId ? 'Editar Produto' : 'Novo Produto'}</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-2">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do produto *" className={inputClass} autoFocus />
              <input type="text" value={ref} onChange={e => setRef(e.target.value)} placeholder="Referência / Código" className={inputClass} />
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="Preço (R$) *" className={inputClass} />
              <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
                {Object.keys(CATEGORY_ICONS).sort().map(cat => (
                  <option key={cat} value={cat}>{icon(cat)} {cat}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 p-5 pt-3 shrink-0 border-t border-border">
              <button onClick={() => setShowDialog(false)} className="flex-1 h-11 rounded-xl border border-border text-foreground font-medium hover:bg-muted active:scale-95 transition-all duration-200">
                Cancelar
              </button>
              <button onClick={handleSave} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
