import { useNavigate } from 'react-router-dom';
import { Settings, Bookmark, ShoppingBag, CreditCard, MapPin, LogOut, ChevronRight, Bell, Shield, HelpCircle, Truck, LayoutDashboard } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, isAdmin, signOut } = useAuthContext();

  const menuItems = [
    { icon: ShoppingBag, label: 'Meus Pedidos', desc: 'Histórico de compras', action: () => {} },
    { icon: Bookmark, label: 'Salvos', desc: 'Posts e eventos favoritos', action: () => {} },
    { icon: CreditCard, label: 'PDV', desc: 'Ponto de venda', action: () => navigate('/pdv') },
    { icon: MapPin, label: 'Endereços', desc: 'Gerenciar endereços', action: () => {} },
    { icon: Bell, label: 'Notificações', desc: 'Preferências de alerta', action: () => {} },
    { icon: Shield, label: 'Privacidade', desc: 'Dados e segurança', action: () => {} },
    { icon: HelpCircle, label: 'Ajuda', desc: 'Central de suporte', action: () => {} },
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
    <div className="min-h-screen bg-background">
      <div className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Perfil</h1>
        <button className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center">
          <Settings className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Profile Card */}
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

      {/* Menu */}
      <div className="mx-4 mt-4 glass-card rounded-2xl overflow-hidden divide-y divide-border">
        {menuItems.map(({ icon: Icon, label, desc, action }) => (
          <button key={label} onClick={action} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/30 transition-colors text-left">
            <div className="w-9 h-9 rounded-xl glass-surface flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="mx-4 mt-4 mb-8">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border border-destructive/30 text-destructive font-medium text-sm hover:bg-destructive/10 transition-colors">
          <LogOut className="w-4 h-4" /> Sair da conta
        </button>
      </div>
    </div>
  );
}
