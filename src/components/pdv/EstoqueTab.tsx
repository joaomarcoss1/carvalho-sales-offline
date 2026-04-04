import { useState, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { CATEGORY_ICONS } from '@/lib/productCatalog';
import { Pencil, Plus, Package, Search, FileUp, Loader2, CheckCircle2, X } from 'lucide-react';
import { extractProductsFromPdf, type PdfImportResult } from '@/lib/pdfProductParser';
import { toast } from 'sonner';

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

  // PDF import state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<PdfImportResult | null>(null);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Selecione um arquivo PDF válido');
      return;
    }

    setImporting(true);
    setImportProgress(0);
    try {
      const result = await extractProductsFromPdf(file);
      if (result.products.length === 0) {
        toast.error('Nenhum produto encontrado no PDF. Verifique se o arquivo contém uma lista de produtos com preços.');
        setImporting(false);
        return;
      }
      setImportResult(result);
      setShowImportPreview(true);
    } catch (err) {
      console.error('Erro ao processar PDF:', err);
      toast.error('Erro ao processar o PDF. Verifique se o arquivo não está corrompido.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (!importResult) return;
    setImporting(true);
    setImportProgress(0);
    const now = new Date();
    const batch = importResult.products.map(p => ({
      name: p.name,
      ref: p.ref,
      price: p.price,
      category: p.category,
      createdAt: now,
    }));

    try {
      const chunkSize = 200;
      for (let i = 0; i < batch.length; i += chunkSize) {
        await db.products.bulkAdd(batch.slice(i, i + chunkSize));
        setImportProgress(Math.round((Math.min(i + chunkSize, batch.length) / batch.length) * 100));
      }
      setImportProgress(100);
      toast.success(`${importResult.products.length} produtos importados com sucesso!`);
      setShowImportPreview(false);
      setImportResult(null);
    } catch (err) {
      console.error('Erro ao salvar produtos:', err);
      toast.error('Erro ao salvar produtos no banco de dados.');
    } finally {
      setImporting(false);
    }
  };

  const icon = (cat: string) => CATEGORY_ICONS[cat] || '📦';
  const inputClass = "w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200";

  return (
    <div className="relative flex h-full min-h-0 flex-col pb-[calc(env(safe-area-inset-bottom)+4.75rem)]">
      <div className="shrink-0 bg-card px-4 py-3 border-b border-border shadow-sm space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-bold text-foreground">Gerenciar Estoque</h1>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/80 active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
            Importar PDF
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfSelect}
            className="hidden"
          />
        </div>
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

      <div className="app-scroll flex-1 px-4 py-3 pb-24 space-y-2">
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
        className="fixed bottom-[5.5rem] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-200 hover:opacity-90 active:scale-90 glow-sm"
        style={{ right: 'max(1rem, calc((100vw - 32rem) / 2 + 1rem))' }}
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Dialog: Novo/Editar Produto */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setShowDialog(false)}>
          <div className="absolute inset-0 bg-black/60 animate-fade-in" />
          <div
            className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-300 sm:mx-4 sm:max-h-[80vh] sm:rounded-2xl"
            style={{ maxHeight: 'min(88dvh, 100%)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="shrink-0 px-5 pt-3 pb-3">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
              <h2 className="text-lg font-bold text-foreground">{editId ? 'Editar Produto' : 'Novo Produto'}</h2>
            </div>
            <div className="app-scroll flex-1 px-5 py-2 space-y-3">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do produto *" className={inputClass} autoFocus />
              <input type="text" value={ref} onChange={e => setRef(e.target.value)} placeholder="Referência / Código" className={inputClass} />
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="Preço (R$) *" className={inputClass} />
              <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
                {Object.keys(CATEGORY_ICONS).sort().map(cat => (
                  <option key={cat} value={cat}>{icon(cat)} {cat}</option>
                ))}
              </select>
            </div>
            <div className="shrink-0 border-t border-border bg-card/95 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur supports-[backdrop-filter]:bg-card/85">
              <div className="flex gap-3">
                <button onClick={() => setShowDialog(false)} className="flex-1 h-11 rounded-xl border border-border text-foreground font-medium hover:bg-muted active:scale-95 transition-all duration-200">
                  Cancelar
                </button>
                <button onClick={handleSave} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Preview de importação PDF */}
      {showImportPreview && importResult && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => { setShowImportPreview(false); setImportResult(null); }}>
          <div className="absolute inset-0 bg-black/60 animate-fade-in" />
          <div
            className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-300 sm:mx-4 sm:max-h-[85vh] sm:rounded-2xl"
            style={{ maxHeight: 'min(88dvh, 100%)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="shrink-0 px-5 pt-3 pb-3 flex items-center justify-between gap-3">
              <div>
                <div className="mb-3 h-1.5 w-12 rounded-full bg-muted sm:hidden" />
                <h2 className="text-lg font-bold text-foreground">Importar Produtos</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {importResult.products.length} produto(s) encontrado(s) • {importResult.skippedLines} linha(s) ignorada(s)
                </p>
              </div>
              <button onClick={() => { setShowImportPreview(false); setImportResult(null); }} className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {importing && (
              <div className="px-5 pb-2">
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">Salvando... {importProgress}%</p>
              </div>
            )}

            <div className="app-scroll flex-1 px-5 py-2 space-y-1.5 min-h-0">
              {importResult.products.slice(0, 200).map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 text-sm"
                >
                  <span className="shrink-0">{icon(p.category)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-xs truncate">{p.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-primary">{formatCurrency(p.price)}</span>
                      {p.ref && <span className="text-[9px] text-muted-foreground">REF: {p.ref}</span>}
                      <span className="text-[9px] text-muted-foreground">• {p.category}</span>
                    </div>
                  </div>
                </div>
              ))}
              {importResult.products.length > 200 && (
                <p className="text-center text-xs text-muted-foreground py-1">
                  + {importResult.products.length - 200} produtos não mostrados
                </p>
              )}
            </div>

            <div className="shrink-0 border-t border-border bg-card/95 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur supports-[backdrop-filter]:bg-card/85">
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowImportPreview(false); setImportResult(null); }}
                  disabled={importing}
                  className="flex-1 h-11 rounded-xl border border-border text-foreground font-medium hover:bg-muted active:scale-95 transition-all duration-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmImport}
                  disabled={importing}
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {importing ? 'Salvando...' : `Importar ${importResult.products.length}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
