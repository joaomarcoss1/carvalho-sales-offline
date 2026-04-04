import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Sale } from '@/lib/db';
import { FileText, Download, Calendar } from 'lucide-react';
import { generateSalesPDF } from '@/lib/pdfGenerator';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString('pt-BR');
}

function groupByDate(sales: Sale[]) {
  const groups: Record<string, Sale[]> = {};
  for (const sale of sales) {
    const key = formatDate(sale.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(sale);
  }
  return groups;
}

export default function RelatoriosTab() {
  const sales = useLiveQuery(() => db.sales.orderBy('createdAt').reverse().toArray()) ?? [];
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const today = new Date().toLocaleDateString('pt-BR');
  const todaySales = sales.filter(s => formatDate(s.createdAt) === today);

  const monthlySales = sales.filter(s => {
    const d = new Date(s.createdAt);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return m === selectedMonth;
  });

  const grouped = groupByDate(sales);

  const monthLabel = (() => {
    const [y, m] = selectedMonth.split('-');
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${months[parseInt(m) - 1]} ${y}`;
  })();

  return (
    <div className="flex h-full min-h-0 flex-col pb-[calc(env(safe-area-inset-bottom)+4.75rem)]">
      <div className="shrink-0 bg-card px-4 py-3 border-b border-border shadow-sm">
        <h1 className="text-lg font-bold text-foreground">Relatórios</h1>
      </div>

      <div className="app-scroll flex-1 px-4 py-3 pb-6 space-y-4">
        {/* Daily Report */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">Relatório de Hoje</p>
              <p className="text-sm text-muted-foreground">
                {todaySales.length} venda(s) — {formatCurrency(todaySales.reduce((s, v) => s + v.total, 0))}
              </p>
            </div>
          </div>
          <button
            onClick={() => generateSalesPDF(todaySales, `Relatório do Dia - ${today}`)}
            className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            GERAR PDF DO DIA
          </button>
        </div>

        {/* Monthly Report */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">Relatório Mensal</p>
              <p className="text-sm text-muted-foreground">
                {monthlySales.length} venda(s) — {formatCurrency(monthlySales.reduce((s, v) => s + v.total, 0))}
              </p>
            </div>
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => generateSalesPDF(monthlySales, `Relatório Mensal - ${monthLabel}`)}
            className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            GERAR PDF MENSAL
          </button>
        </div>

        {/* Sales History */}
        {Object.entries(grouped).map(([date, dateSales]) => (
          <div key={date} className="space-y-2">
            <h3 className="text-sm font-bold text-muted-foreground px-1">{date}</h3>
            {dateSales.map(sale => (
              <div key={sale.id} className="bg-card rounded-xl border border-border p-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{sale.clientName}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(sale.createdAt)}</p>
                  </div>
                  <p className="font-bold text-primary">{formatCurrency(sale.total)}</p>
                </div>
              </div>
            ))}
          </div>
        ))}

        {sales.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="w-16 h-16 mb-3 opacity-30" />
            <p className="font-medium">Nenhuma venda registrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
