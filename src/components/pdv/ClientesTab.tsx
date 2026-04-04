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

  const inputClass = "w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card px-4 py-3 border-b border-border shadow-sm space-y-2">
        <h1 className="text-lg font-bold text-foreground">Lista de Clientes</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, cidade, comércio..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} cliente(s)</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-20 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="w-16 h-16 mb-3 opacity-30" />
            <p className="font-medium">{search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p>
          </div>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-start gap-3">
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
                className="w-9 h-9 rounded-full hover:bg-accent flex items-center justify-center transition-colors shrink-0"
              >
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:opacity-90 active:scale-90 transition-all z-40"
      >
        <UserPlus className="w-6 h-6" />
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowDialog(false)}>
          <div className="absolute inset-0 bg-foreground/40" />
          <div
            className="bg-card rounded-t-2xl sm:rounded-2xl p-5 w-full sm:w-[90%] sm:max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl z-10 space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-foreground">{editId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo *" className={inputClass} />
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Celular" className={inputClass} />
            <input type="text" value={commerceName} onChange={e => setCommerceName(e.target.value)} placeholder="Nome do comércio" className={inputClass} />
            <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Cidade" className={inputClass} />
            <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" className={inputClass} />
            <input type="text" value={referencePoint} onChange={e => setReferencePoint(e.target.value)} placeholder="Ponto de referência" className={inputClass} />
            <div className="flex gap-3 pt-1">
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
