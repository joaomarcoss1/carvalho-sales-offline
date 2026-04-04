import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { UserPlus, Users, Search, Pencil } from 'lucide-react';

export default function ClientesTab() {
  const clients = useLiveQuery(() => db.clients.toArray()) ?? [];
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [bairro, setBairro] = useState('');
  const [commerceName, setCommerceName] = useState('');
  const [referencePoint, setReferencePoint] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.city || '').toLowerCase().includes(q) ||
      (c.commerceName || '').toLowerCase().includes(q) ||
      (c.bairro || '').toLowerCase().includes(q)
    );
  }, [clients, search]);

  const openNew = () => {
    setEditId(null);
    setName(''); setPhone(''); setCity(''); setBairro('');
    setCommerceName(''); setReferencePoint('');
    setShowDialog(true);
  };

  const openEdit = (c: typeof clients[0]) => {
    setEditId(c.id!);
    setName(c.name);
    setPhone(c.phone);
    setCity(c.city || '');
    setBairro(c.bairro || '');
    setCommerceName(c.commerceName || '');
    setReferencePoint(c.referencePoint || '');
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const data = {
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      bairro: bairro.trim(),
      commerceName: commerceName.trim(),
      referencePoint: referencePoint.trim(),
    };
    if (editId) {
      await db.clients.update(editId, data);
    } else {
      await db.clients.add({ ...data, createdAt: new Date() });
    }
    setShowDialog(false);
  };

  const inputClass = "w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200";

  return (
    <div className="relative flex h-full min-h-0 flex-col pb-[calc(env(safe-area-inset-bottom)+4.75rem)]">
      <div className="shrink-0 bg-card px-4 py-3 border-b border-border shadow-sm space-y-2">
        <h1 className="text-lg font-bold text-foreground">Lista de Clientes</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, cidade, comércio..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          />
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} cliente(s)</p>
      </div>

      <div className="app-scroll flex-1 px-4 py-3 pb-24 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground animate-fade-in">
            <Users className="w-16 h-16 mb-3 opacity-30" />
            <p className="font-medium">{search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p>
          </div>
        ) : (
          filtered.map((c, i) => (
            <div
              key={c.id}
              className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-start gap-3 animate-fade-in hover:shadow-md hover:border-primary/30 transition-all duration-200"
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.phone}</p>
                {c.commerceName && (
                  <p className="text-xs text-primary mt-0.5">🏪 {c.commerceName}</p>
                )}
                <div className="flex flex-wrap gap-x-3 mt-1">
                  {c.city && <p className="text-xs text-muted-foreground">📍 {c.city}</p>}
                  {c.bairro && <p className="text-xs text-muted-foreground">• {c.bairro}</p>}
                </div>
                {c.referencePoint && (
                  <p className="text-xs text-muted-foreground mt-0.5">🔖 {c.referencePoint}</p>
                )}
              </div>
              <button
                onClick={() => openEdit(c)}
                className="w-9 h-9 rounded-full hover:bg-accent flex items-center justify-center transition-all duration-200 shrink-0 active:scale-90"
              >
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={openNew}
        className="fixed bottom-[5.5rem] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-200 hover:opacity-90 active:scale-90 glow-sm"
        style={{ right: 'max(1rem, calc((100vw - 32rem) / 2 + 1rem))' }}
      >
        <UserPlus className="w-6 h-6" />
      </button>

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
              <h2 className="text-lg font-bold text-foreground">{editId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            </div>
            <div className="app-scroll flex-1 px-5 py-2 space-y-3">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo *" className={inputClass} autoFocus />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Celular" className={inputClass} />
              <input type="text" value={commerceName} onChange={e => setCommerceName(e.target.value)} placeholder="Nome do comércio" className={inputClass} />
              <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Cidade" className={inputClass} />
              <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" className={inputClass} />
              <input type="text" value={referencePoint} onChange={e => setReferencePoint(e.target.value)} placeholder="Ponto de referência" className={inputClass} />
            </div>
            <div className="shrink-0 border-t border-border bg-card/95 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur supports-[backdrop-filter]:bg-card/85">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDialog(false)}
                  className="flex-1 h-11 rounded-xl border border-border text-foreground font-medium hover:bg-muted active:scale-95 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
