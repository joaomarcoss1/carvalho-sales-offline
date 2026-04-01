import { useState, useEffect } from 'react';
import { Users, Building2, Truck, ShoppingBag, BarChart3, CheckCircle, XCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { isAdmin, loading } = useAuthContext();
  const [tab, setTab] = useState<'overview' | 'businesses' | 'drivers' | 'orders'>('overview');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from('businesses').select('*').order('created_at', { ascending: false }).then(({ data }) => setBusinesses(data || []));
    supabase.from('drivers').select('*, profiles!inner(full_name, phone)').order('created_at', { ascending: false }).then(({ data }) => setDrivers(data || []));
    supabase.from('orders').select('*, businesses!inner(name)').order('created_at', { ascending: false }).limit(50).then(({ data }) => setOrders(data || []));
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setProfiles(data || []));
  }, [isAdmin]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!isAdmin) return <Navigate to="/feed" replace />;

  const toggleApproval = async (table: 'businesses' | 'drivers', id: string, current: boolean) => {
    await (supabase.from(table) as any).update({ approved: !current }).eq('id', id);
    if (table === 'businesses') {
      setBusinesses(prev => prev.map(b => b.id === id ? { ...b, approved: !current } : b));
    } else {
      setDrivers(prev => prev.map(d => d.id === id ? { ...d, approved: !current } : d));
    }
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const tabs = [
    { id: 'overview' as const, label: 'Visão Geral', icon: BarChart3 },
    { id: 'businesses' as const, label: 'Empresas', icon: Building2 },
    { id: 'drivers' as const, label: 'Entregadores', icon: Truck },
    { id: 'orders' as const, label: 'Pedidos', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Painel Admin
        </h1>
        <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${tab === t.id ? 'gradient-primary text-background' : 'glass-surface text-muted-foreground'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Usuários', value: profiles.length, icon: Users, color: 'text-primary' },
                { label: 'Empresas', value: businesses.length, icon: Building2, color: 'text-accent' },
                { label: 'Entregadores', value: drivers.length, icon: Truck, color: 'text-primary' },
                { label: 'Pedidos', value: orders.length, icon: ShoppingBag, color: 'text-accent' },
              ].map(s => (
                <div key={s.label} className="glass-card rounded-2xl p-4">
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-2xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Receita Total</h3>
              <p className="text-3xl font-bold gradient-text">{fmt(orders.reduce((s, o) => s + Number(o.total || 0), 0))}</p>
            </div>
          </>
        )}

        {tab === 'businesses' && (
          <div className="space-y-3">
            {businesses.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma empresa cadastrada</p>}
            {businesses.map(b => (
              <div key={b.id} className="glass-card rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-background font-bold">
                  {b.name?.[0] || 'E'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.category} • {b.city}</p>
                </div>
                <button onClick={() => toggleApproval('businesses', b.id, b.approved)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${b.approved ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
                  {b.approved ? '✅ Aprovado' : '⏳ Pendente'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'drivers' && (
          <div className="space-y-3">
            {drivers.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum entregador cadastrado</p>}
            {drivers.map(d => (
              <div key={d.id} className="glass-card rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass-surface flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{d.profiles?.full_name || 'Entregador'}</p>
                  <p className="text-xs text-muted-foreground">{d.vehicle_type} • {d.license_plate || 'Sem placa'}</p>
                </div>
                <button onClick={() => toggleApproval('drivers', d.id, d.approved)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${d.approved ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
                  {d.approved ? '✅ Aprovado' : '⏳ Pendente'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum pedido</p>}
            {orders.map(o => (
              <div key={o.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground text-sm">{o.businesses?.name}</p>
                  <span className={`text-xs px-2 py-1 rounded-lg ${o.status === 'completed' ? 'bg-green-500/20 text-green-400' : o.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-primary/20 text-primary'}`}>
                    {o.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{o.customer_name || 'Sem cliente'}</span>
                  <span className="font-bold text-foreground">{fmt(Number(o.total || 0))}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
