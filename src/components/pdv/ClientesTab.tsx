import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { UserPlus, Users } from 'lucide-react';

export default function ClientesTab() {
  const clients = useLiveQuery(() => db.clients.toArray()) ?? [];
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSave = async () => {
    if (!name.trim()) return;
    await db.clients.add({ name: name.trim(), phone: phone.trim(), address: address.trim(), createdAt: new Date() });
    setName(''); setPhone(''); setAddress('');
    setShowDialog(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card px-4 py-3 border-b border-border shadow-sm">
        <h1 className="text-lg font-bold text-foreground">Lista de Clientes</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-20 space-y-2">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="w-16 h-16 mb-3 opacity-30" />
            <p className="font-medium">Nenhum cliente cadastrado</p>
          </div>
        ) : (
          clients.map(c => (
            <div key={c.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <p className="font-semibold text-foreground">{c.name}</p>
              <p className="text-sm text-muted-foreground">{c.phone}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.address}</p>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setShowDialog(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:opacity-90 active:scale-90 transition-all z-40"
      >
        <UserPlus className="w-6 h-6" />
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowDialog(false)}>
          <div className="absolute inset-0 bg-foreground/40" />
          <div className="bg-card rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl z-10 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground">Novo Cliente</h2>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo"
              className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Celular"
              className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Endereço completo"
              className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
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
