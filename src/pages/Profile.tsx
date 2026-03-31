import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bookmark, ShoppingBag, CreditCard, MapPin, LogOut, ChevronRight, Bell, Shield, HelpCircle, Moon } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

  const menuItems = [
    { icon: ShoppingBag, label: 'Meus Pedidos', desc: 'Histórico de compras', action: () => {} },
    { icon: Bookmark, label: 'Salvos', desc: 'Posts e eventos favoritos', action: () => {} },
    { icon: CreditCard, label: 'Pagamento', desc: 'Cartões e métodos', action: () => {} },
    { icon: MapPin, label: 'Endereços', desc: 'Gerenciar endereços', action: () => {} },
    { icon: Bell, label: 'Notificações', desc: 'Preferências de alerta', action: () => {} },
    { icon: Shield, label: 'Privacidade', desc: 'Dados e segurança', action: () => {} },
    { icon: HelpCircle, label: 'Ajuda', desc: 'Central de suporte', action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Perfil</h1>
        <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <Settings className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="mx-4 bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/25">
            J
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-foreground">João Silva</h2>
            <p className="text-sm text-muted-foreground">joao@email.com</p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> São Paulo, SP
            </p>
          </div>
          <button className="text-primary text-sm font-medium">Editar</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">12</p>
            <p className="text-[10px] text-muted-foreground">Pedidos</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">8</p>
            <p className="text-[10px] text-muted-foreground">Salvos</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">3</p>
            <p className="text-[10px] text-muted-foreground">Eventos</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="mx-4 mt-4 bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
        {menuItems.map(({ icon: Icon, label, desc, action }) => (
          <button key={label} onClick={action} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Icon className="w-4.5 h-4.5 text-primary" />
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
        <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border border-destructive/30 text-destructive font-medium text-sm hover:bg-destructive/10 transition-colors">
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}
