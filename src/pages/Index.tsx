import { useState, useEffect, useRef } from 'react';
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
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    seedDemoData();
  }, []);

  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  return (
    <div className="h-screen flex flex-col bg-background max-w-lg mx-auto relative overflow-hidden">
      {/* Tab Content with fade animation */}
      <div className="flex-1 overflow-hidden relative">
        <div key={activeTab} className="h-full animate-fade-in">
          {activeTab === 'venda' && <VendaTab {...cart} />}
          {activeTab === 'estoque' && <EstoqueTab />}
          {activeTab === 'clientes' && <ClientesTab />}
          {activeTab === 'relatorios' && <RelatoriosTab />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-card border-t border-border flex h-14 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50 safe-bottom relative">
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
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-90 ${
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
