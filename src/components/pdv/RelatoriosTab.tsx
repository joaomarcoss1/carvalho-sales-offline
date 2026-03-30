import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Sale } from '@/lib/db';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';

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

function generatePDF(sales: Sale[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > 270) {
      doc.addPage();
      y = 20;
    }
  };

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CARVALHO VENDAS - RELATÓRIO', pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setDrawColor(230, 130, 0);
  doc.setLineWidth(0.8);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  if (sales.length === 0) {
    doc.setFontSize(12);
    doc.text('Nenhuma venda encontrada para hoje.', pageWidth / 2, y, { align: 'center' });
  }

  for (const sale of sales) {
    const itemsHeight = sale.items.length * 6 + 50;
    checkPage(itemsHeight);

    // Sale border box
    const boxStart = y;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);

    // Client info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Cliente: ${sale.clientName}`, 16, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cel: ${sale.clientPhone}  |  ${sale.clientAddress}`, 16, y);
    y += 5;
    doc.text(`Data: ${formatDateTime(sale.createdAt)}`, 16, y);
    y += 7;

    // Items header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('QTD', 16, y);
    doc.text('PRODUTO', 30, y);
    doc.text('PREÇO', 120, y);
    doc.text('SUBTOTAL', 155, y);
    y += 1;
    doc.setDrawColor(180, 180, 180);
    doc.line(16, y, pageWidth - 16, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    for (const item of sale.items) {
      checkPage(6);
      doc.text(String(item.quantity), 18, y);
      doc.text(item.productName.substring(0, 30), 30, y);
      doc.text(formatCurrency(item.price), 120, y);
      doc.text(formatCurrency(item.price * item.quantity), 155, y);
      y += 6;
    }

    y += 2;
    doc.setDrawColor(180, 180, 180);
    doc.line(120, y, pageWidth - 16, y);
    y += 5;

    doc.setFontSize(9);
    doc.text(`Subtotal: ${formatCurrency(sale.subtotal)}`, 120, y);
    y += 5;
    doc.text(`Desconto: ${formatCurrency(sale.discount)}`, 120, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(230, 130, 0);
    doc.text(`Total: ${formatCurrency(sale.total)}`, 120, y);
    doc.setTextColor(0, 0, 0);
    y += 3;

    // Draw border
    doc.roundedRect(14, boxStart - 4, pageWidth - 28, y - boxStart + 6, 2, 2, 'S');
    y += 12;
  }

  // Total summary
  if (sales.length > 0) {
    checkPage(20);
    const grandTotal = sales.reduce((s, v) => s + v.total, 0);
    doc.setDrawColor(230, 130, 0);
    doc.setLineWidth(0.8);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL DO DIA: ${formatCurrency(grandTotal)}`, pageWidth / 2, y, { align: 'center' });
  }

  // Open in new window
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
}

export default function RelatoriosTab() {
  const sales = useLiveQuery(() => db.sales.orderBy('createdAt').reverse().toArray()) ?? [];

  const today = new Date().toLocaleDateString('pt-BR');
  const todaySales = sales.filter(s => formatDate(s.createdAt) === today);
  const grouped = groupByDate(sales);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card px-4 py-3 border-b border-border shadow-sm">
        <h1 className="text-lg font-bold text-foreground">Relatórios Diários</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-20 space-y-4">
        {/* Daily report card */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">Relatório de Hoje</p>
              <p className="text-sm text-muted-foreground">{todaySales.length} venda(s) — {formatCurrency(todaySales.reduce((s, v) => s + v.total, 0))}</p>
            </div>
          </div>
          <button
            onClick={() => generatePDF(todaySales)}
            className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            GERAR PDF DO DIA
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
