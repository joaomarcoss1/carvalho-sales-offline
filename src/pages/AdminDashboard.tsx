import { useState, useEffect, useMemo } from 'react';
import { Users, Building2, Truck, ShoppingBag, BarChart3, TrendingUp, Heart, MessageCircle, DollarSign, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#14B8A6', '#8B5CF6', '#F43F5E', '#F59E0B', '#3B82F6', '#10B981'];
const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AdminDashboard() {
  const { isAdmin, loading } = useAuthContext();
  const [tab, setTab] = useState<'overview' | 'businesses' | 'drivers' | 'orders'>('overview');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from('businesses').select('*').order('created_at', { ascending: false }),
      supabase.from('drivers').select('*, profiles!inner(full_name, phone)').order('created_at', { ascending: false }),
      supabase.from('orders').select('*, businesses!inner(name)').order('created_at', { ascending: false }).limit(200),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('likes').select('*'),
      supabase.from('comments').select('*'),
    ]).then(([bRes, dRes, oRes, pRes, lRes, cRes]) => {
      setBusinesses(bRes.data || []);
      setDrivers(dRes.data || []);
      setOrders(oRes.data || []);
      setProfiles(pRes.data || []);
      setLikes(lRes.data || []);
      setComments(cRes.data || []);
    });
  }, [isAdmin]);

  const toggleApproval = async (table: 'businesses' | 'drivers', id: string, current: boolean) => {
    await (supabase.from(table) as any).update({ approved: !current }).eq('id', id);
    if (table === 'businesses') setBusinesses(prev => prev.map(b => b.id === id ? { ...b, approved: !current } : b));
    else setDrivers(prev => prev.map(d => d.id === id ? { ...d, approved: !current } : d));
  };

  // Chart data
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);

  const revenueByDay = useMemo(() => {
    const days: Record<string, number> = {};
    orders.forEach(o => {
      const day = new Date(o.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      days[day] = (days[day] || 0) + Number(o.total || 0);
    });
    return Object.entries(days).slice(-7).map(([day, value]) => ({ day, value }));
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const statuses: Record<string, number> = {};
    orders.forEach(o => { statuses[o.status] = (statuses[o.status] || 0) + 1; });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const businessesByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    businesses.forEach(b => { cats[b.category] = (cats[b.category] || 0) + 1; });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [businesses]);

  const topBusinesses = useMemo(() => {
    const biz: Record<string, { name: string; revenue: number; orders: number; likes: number }> = {};
    orders.forEach(o => {
      if (!biz[o.business_id]) biz[o.business_id] = { name: o.businesses?.name || '?', revenue: 0, orders: 0, likes: 0 };
      biz[o.business_id].revenue += Number(o.total || 0);
      biz[o.business_id].orders += 1;
    });
    return Object.values(biz).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!isAdmin) return <Navigate to="/feed" replace />;

  const tabs = [
    { id: 'overview' as const, label: 'Visão Geral', icon: BarChart3 },
    { id: 'businesses' as const, label: 'Empresas', icon: Building2 },
    { id: 'drivers' as const, label: 'Entregadores', icon: Truck },
    { id: 'orders' as const, label: 'Pedidos', icon: ShoppingBag },
  ];

  const statsCards = [
    { label: 'Usuários', value: profiles.length, icon: Users, color: 'text-primary' },
    { label: 'Empresas', value: businesses.length, icon: Building2, color: 'text-accent' },
    { label: 'Entregadores', value: drivers.length, icon: Truck, color: 'text-primary' },
    { label: 'Pedidos', value: orders.length, icon: ShoppingBag, color: 'text-accent' },
    { label: 'Curtidas', value: likes.length, icon: Heart, color: 'text-red-400' },
    { label: 'Comentários', value: comments.length, icon: MessageCircle, color: 'text-blue-400' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Painel Admin
        </h1>
        <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
          {tabs.map(t => (
            <motion.button key={t.id} whileTap={{ scale: 0.95 }} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${tab === t.id ? 'gradient-primary text-background' : 'glass-surface text-muted-foreground'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {tab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {statsCards.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-3 text-center">
                  <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Revenue Card */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Receita Total</h3>
              </div>
              <p className="text-3xl font-bold gradient-text mb-4">{fmt(totalRevenue)}</p>
              {revenueByDay.length > 0 && (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(230,15%,20%,0.5)" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(230,10%,50%)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(230,10%,50%)' }} />
                    <Tooltip contentStyle={{ background: 'hsl(230,20%,9%)', border: '1px solid hsl(230,15%,14%)', borderRadius: 12, color: '#fff' }} />
                    <Line type="monotone" dataKey="value" stroke="#14B8A6" strokeWidth={2} dot={{ r: 3, fill: '#14B8A6' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Orders by Status */}
            {ordersByStatus.length > 0 && (
              <div className="glass-card rounded-2xl p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" /> Pedidos por Status
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={ordersByStatus} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(230,20%,9%)', border: '1px solid hsl(230,15%,14%)', borderRadius: 12, color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Categories */}
            {businessesByCategory.length > 0 && (
              <div className="glass-card rounded-2xl p-4">
                <h3 className="font-semibold text-foreground mb-3">Empresas por Categoria</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={businessesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(230,15%,20%,0.5)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(230,10%,50%)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(230,10%,50%)' }} />
                    <Tooltip contentStyle={{ background: 'hsl(230,20%,9%)', border: '1px solid hsl(230,15%,14%)', borderRadius: 12, color: '#fff' }} />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Businesses */}
            {topBusinesses.length > 0 && (
              <div className="glass-card rounded-2xl p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Top Empresas
                </h3>
                <div className="space-y-2">
                  {topBusinesses.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 glass-surface rounded-xl p-3">
                      <span className="text-lg font-bold gradient-text w-6">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.orders} pedidos</p>
                      </div>
                      <p className="font-bold text-primary text-sm">{fmt(b.revenue)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'businesses' && (
          <div className="space-y-3">
            {businesses.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma empresa cadastrada</p>}
            {businesses.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="glass-card rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-background font-bold">{b.name?.[0] || 'E'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.category} • {b.city}</p>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => toggleApproval('businesses', b.id, b.approved)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${b.approved ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
                  {b.approved ? '✅ Aprovado' : '⏳ Pendente'}
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}

        {tab === 'drivers' && (
          <div className="space-y-3">
            {drivers.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum entregador cadastrado</p>}
            {drivers.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="glass-card rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass-surface flex items-center justify-center"><Truck className="w-5 h-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{d.profiles?.full_name || 'Entregador'}</p>
                  <p className="text-xs text-muted-foreground">{d.vehicle_type} • {d.license_plate || 'Sem placa'}</p>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => toggleApproval('drivers', d.id, d.approved)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${d.approved ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
                  {d.approved ? '✅ Aprovado' : '⏳ Pendente'}
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum pedido</p>}
            {orders.map((o, i) => (
              <motion.div key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground text-sm">{o.businesses?.name}</p>
                  <span className={`text-xs px-2 py-1 rounded-lg ${o.status === 'completed' ? 'bg-green-500/20 text-green-400' : o.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-primary/20 text-primary'}`}>
                    {o.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{o.customer_name || 'Sem cliente'}</span>
                  <span>{new Date(o.created_at).toLocaleDateString('pt-BR')}</span>
                  <span className="font-bold text-foreground">{fmt(Number(o.total || 0))}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
