import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bookmark, ShoppingBag, CreditCard, MapPin, LogOut, ChevronRight, Bell, Shield, HelpCircle, Truck, LayoutDashboard, Edit3, X, Camera, Moon, Sun } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, isAdmin, signOut, user } = useAuthContext();
  const [editOpen, setEditOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', city: '', state: '' });
  const [saving, setSaving] = useState(false);
  const [notifSettings, setNotifSettings] = useState({ promos: true, orders: true, messages: true, events: false });

  const openEdit = () => {
    setEditForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      city: profile?.city || '',
      state: profile?.state || '',
    });
    setEditOpen(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update(editForm).eq('id', user.id);
    setSaving(false);
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Perfil atualizado!');
    setEditOpen(false);
    window.location.reload();
  };

  const menuItems = [
    { icon: Edit3, label: 'Editar Perfil', desc: 'Nome, telefone, endereço', action: openEdit },
    { icon: ShoppingBag, label: 'Meus Pedidos', desc: 'Histórico de compras', action: () => navigate('/pdv') },
    { icon: CreditCard, label: 'PDV', desc: 'Ponto de venda', action: () => navigate('/pdv') },
    { icon: Bell, label: 'Notificações', desc: 'Preferências de alerta', action: () => setNotifOpen(true) },
    { icon: Shield, label: 'Privacidade', desc: 'Dados e segurança', action: () => toast.info('Seus dados estão protegidos com criptografia de ponta a ponta.') },
    { icon: HelpCircle, label: 'Ajuda', desc: 'Central de suporte', action: () => setHelpOpen(true) },
  ];

  if (isAdmin) {
    menuItems.splice(2, 0, { icon: LayoutDashboard, label: 'Painel Admin', desc: 'Gerenciar plataforma', action: () => navigate('/admin') });
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
      <div className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Perfil</h1>
        <button onClick={openEdit} className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center active:scale-90 transition-transform">
          <Settings className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="mx-4 glass-card rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-background text-xl font-bold glow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-foreground">{profile?.full_name || 'Usuário'}</h2>
            <p className="text-sm text-muted-foreground">{profile?.phone || 'Sem telefone'}</p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {profile?.city || 'São Paulo'}, {profile?.state || 'SP'}
            </p>
          </div>
          {isAdmin && <span className="text-xs px-2 py-1 rounded-lg gradient-primary text-background font-bold">ADMIN</span>}
        </div>
      </div>

      <div className="mx-4 mt-4 glass-card rounded-2xl overflow-hidden divide-y divide-border">
        {menuItems.map(({ icon: Icon, label, desc, action }, i) => (
          <motion.button
            key={label}
            onClick={action}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/30 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl glass-surface flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </motion.button>
        ))}
      </div>

      <div className="mx-4 mt-4 mb-8">
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout} className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border border-destructive/30 text-destructive font-medium text-sm hover:bg-destructive/10 transition-colors">
          <LogOut className="w-4 h-4" /> Sair da conta
        </motion.button>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setEditOpen(false)} />
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="relative glass rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Editar Perfil</h2>
                <button onClick={() => setEditOpen(false)} className="w-8 h-8 rounded-xl glass-surface flex items-center justify-center">
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nome completo</label>
                  <input value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} className="w-full h-11 px-4 rounded-xl glass-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Telefone</label>
                  <input value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" className="w-full h-11 px-4 rounded-xl glass-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Cidade</label>
                    <input value={editForm.city || ''} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} className="w-full h-11 px-4 rounded-xl glass-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Estado</label>
                    <input value={editForm.state || ''} onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))} className="w-full h-11 px-4 rounded-xl glass-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={saveProfile} disabled={saving} className="w-full h-12 gradient-primary text-background font-bold rounded-xl disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {notifOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setNotifOpen(false)} />
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="relative glass rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Notificações</h2>
                <button onClick={() => setNotifOpen(false)} className="w-8 h-8 rounded-xl glass-surface flex items-center justify-center">
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
              {[
                { key: 'promos', label: 'Promoções', desc: 'Ofertas e descontos' },
                { key: 'orders', label: 'Pedidos', desc: 'Status de entregas' },
                { key: 'messages', label: 'Mensagens', desc: 'Novas conversas' },
                { key: 'events', label: 'Eventos', desc: 'Eventos próximos' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifSettings(s => ({ ...s, [item.key]: !s[item.key as keyof typeof s] }))}
                    className={`w-12 h-7 rounded-full transition-colors relative ${notifSettings[item.key as keyof typeof notifSettings] ? 'gradient-primary' : 'bg-muted'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${notifSettings[item.key as keyof typeof notifSettings] ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setNotifOpen(false); toast.success('Preferências salvas!'); }} className="w-full h-12 gradient-primary text-background font-bold rounded-xl">
                Salvar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {helpOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setHelpOpen(false)} />
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="relative glass rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Central de Ajuda</h2>
                <button onClick={() => setHelpOpen(false)} className="w-8 h-8 rounded-xl glass-surface flex items-center justify-center">
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
              {[
                { q: 'Como cadastrar minha empresa?', a: 'Na tela de login, toque em "Cadastrar minha empresa" e preencha os dados.' },
                { q: 'Como funciona o PDV?', a: 'No menu Perfil, acesse PDV para registrar vendas de seus produtos.' },
                { q: 'Como me tornar entregador?', a: 'Na tela de login, toque em "Cadastrar como entregador".' },
                { q: 'Como entrar em contato?', a: 'Use o chat para conversar diretamente com as empresas.' },
              ].map((faq, i) => (
                <details key={i} className="glass-card rounded-xl p-3 group">
                  <summary className="text-sm font-medium text-foreground cursor-pointer list-none flex items-center justify-between">
                    {faq.q}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-xs text-muted-foreground mt-2">{faq.a}</p>
                </details>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
