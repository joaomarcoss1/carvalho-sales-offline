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

  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  return (
    <div className="app-shell relative mx-auto flex w-full max-w-lg flex-col bg-background">
      {/* Tab Content with fade animation */}
      <div className="app-content relative flex-1">
        <div key={activeTab} className="h-full animate-fade-in">
          {activeTab === 'venda' && <VendaTab {...cart} />}
          {activeTab === 'estoque' && <EstoqueTab />}
          {activeTab === 'clientes' && <ClientesTab />}
          {activeTab === 'relatorios' && <RelatoriosTab />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 border-t border-border bg-card/95 shadow-[0_-10px_30px_rgba(0,0,0,0.25)] backdrop-blur supports-[backdrop-filter]:bg-card/85"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Active indicator */}
        <div
          className="absolute top-0 h-[3px] bg-primary rounded-b-full transition-all duration-300 ease-out"
          style={{
            width: `${100 / tabs.length}%`,
            left: `${(activeIndex * 100) / tabs.length}%`,
          }}
        />
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex min-h-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 transition-all duration-200 active:scale-95 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'stroke-[2.5] scale-110' : ''}`} />
              <span className={`text-[10px] transition-all duration-200 ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
