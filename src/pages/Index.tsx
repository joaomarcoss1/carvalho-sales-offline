import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Users, FileText } from 'lucide-react';
import { seedDemoData } from '@/lib/db';
import { useCart } from '@/hooks/useCart';
import VendaTab from '@/components/pdv/VendaTab';
import EstoqueTab from '@/components/pdv/EstoqueTab';
import ClientesTab from '@/components/pdv/ClientesTab';
import RelatoriosTab from '@/components/pdv/RelatoriosTab';

const tabs = [
  { id: 'venda', label: 'Venda', icon: ShoppingCart },
  { id: 'estoque', label: 'Estoque', icon: Package },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'relatorios', label: 'Relatórios', icon: FileText },
] as const;

type TabId = typeof tabs[number]['id'];

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabId>('venda');
  const cart = useCart();

  useEffect(() => {
    seedDemoData();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background max-w-lg mx-auto relative">
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'venda' && <VendaTab {...cart} />}
        {activeTab === 'estoque' && <EstoqueTab />}
        {activeTab === 'clientes' && <ClientesTab />}
        {activeTab === 'relatorios' && <RelatoriosTab />}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-card border-t border-border flex h-16 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 pb-safe">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
