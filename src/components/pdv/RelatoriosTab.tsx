import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, PAYMENT_LABELS, type Sale } from '@/lib/db';
import { FileText, Download, Calendar, Trash2, Share2 } from 'lucide-react';
import { generateSalesPDF, generateReceiptPDF, generateSalesPDFBlob, sharePDFViaWhatsApp } from '@/lib/pdfGenerator';

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
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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

  const handleDeleteSale = async (id: number) => {
    await db.sales.delete(id);
    setDeleteConfirm(null);
  };

  const handleShareReceiptPDF = async (sale: Sale) => {
    const blob = generateReceiptPDF(sale);
    await sharePDFViaWhatsApp(blob, `recibo-${sale.id}.pdf`, sale.clientPhone);
  };

  const handleShareReportPDF = async (salesList: Sale[], title: string) => {
    const blob = generateSalesPDFBlob(salesList, title);
    await sharePDFViaWhatsApp(blob, `relatorio.pdf`);
  };

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
          <div className="flex gap-2">
            <button
              onClick={() => generateSalesPDF(todaySales, `Relatório do Dia - ${today}`)}
              className="flex-1 h-12 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
            >
              <Download className="w-5 h-5" />
              GERAR PDF
            </button>
            <button
              onClick={() => handleShareReportPDF(todaySales, `Relatório do Dia - ${today}`)}
              className="h-12 px-4 rounded-xl bg-[#25D366] text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
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
          <div className="flex gap-2">
            <button
              onClick={() => generateSalesPDF(monthlySales, `Relatório Mensal - ${monthLabel}`)}
              className="flex-1 h-12 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
            >
              <Download className="w-5 h-5" />
              GERAR PDF
            </button>
            <button
              onClick={() => handleShareReportPDF(monthlySales, `Relatório Mensal - ${monthLabel}`)}
              className="h-12 px-4 rounded-xl bg-[#25D366] text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sales History */}
        {Object.entries(grouped).map(([date, dateSales]) => (
          <div key={date} className="space-y-2">
            <h3 className="text-sm font-bold text-muted-foreground px-1">{date}</h3>
            {dateSales.map(sale => (
              <div key={sale.id} className="bg-card rounded-xl border border-border p-3 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm">{sale.clientName}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(sale.createdAt)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                        {PAYMENT_LABELS[sale.paymentMethod] || '💵 Dinheiro'}
                      </span>
                      <span className="text-xs text-muted-foreground">{sale.items.length} item(s)</span>
                    </div>
                  </div>
                  <p className="font-bold text-primary text-sm shrink-0">{formatCurrency(sale.total)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShareReceiptPDF(sale)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] text-xs font-semibold active:scale-95 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Recibo PDF
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(sale.id!)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold active:scale-95 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>
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

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/60 animate-fade-in" />
          <div className="relative z-10 w-[90%] max-w-sm bg-card rounded-2xl border border-border p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-destructive/10">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-center font-bold text-foreground mb-1">Excluir Venda?</h3>
            <p className="text-center text-sm text-muted-foreground mb-4">Esta venda será removida permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-11 rounded-xl border border-border font-medium hover:bg-muted active:scale-95 transition-all">
                Cancelar
              </button>
              <button onClick={() => handleDeleteSale(deleteConfirm)} className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground font-bold active:scale-95 transition-all">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
