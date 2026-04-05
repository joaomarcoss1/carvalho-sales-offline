import jsPDF from 'jspdf';
import type { Sale } from './db';
import { PAYMENT_LABELS } from './db';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString('pt-BR');
}

export function generateSalesPDF(sales: Sale[], title: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > 270) {
      doc.addPage();
      y = 20;
    }
  };

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CARVALHO VENDAS', pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(12);
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 6;
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
    doc.text('Nenhuma venda encontrada.', pageWidth / 2, y, { align: 'center' });
  }

  for (const sale of sales) {
    const itemsHeight = sale.items.length * 6 + 50;
    checkPage(itemsHeight);

    const boxStart = y;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Cliente: ${sale.clientName}`, 16, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cel: ${sale.clientPhone}  |  ${[sale.clientCommerce, sale.clientCity].filter(Boolean).join(' - ')}`, 16, y);
    y += 5;
    doc.text(`Data: ${formatDateTime(sale.createdAt)}`, 16, y);
    y += 7;

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
    doc.text(`Pagamento: ${PAYMENT_LABELS[sale.paymentMethod] || 'Dinheiro'}`, 120, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(230, 130, 0);
    doc.text(`Total: ${formatCurrency(sale.total)}`, 120, y);
    doc.setTextColor(0, 0, 0);
    y += 3;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, boxStart - 4, pageWidth - 28, y - boxStart + 6, 2, 2, 'S');
    y += 12;
  }

  if (sales.length > 0) {
    checkPage(20);
    const grandTotal = sales.reduce((s, v) => s + v.total, 0);
    doc.setDrawColor(230, 130, 0);
    doc.setLineWidth(0.8);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${formatCurrency(grandTotal)} (${sales.length} vendas)`, pageWidth / 2, y, { align: 'center' });
  }

  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
}

/** Generate a single sale receipt PDF styled as nota fiscal and return the blob */
export function generateReceiptPDF(sale: Sale): Blob {
  const doc = new jsPDF({ unit: 'mm', format: [80, 200 + sale.items.length * 6] });
  const w = 80;
  let y = 6;

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CARVALHO VENDAS', w / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('DOCUMENTO NAO FISCAL', w / 2, y, { align: 'center' });
  y += 3;

  // Dashed line
  doc.setLineDashPattern([1, 1], 0);
  doc.setDrawColor(100);
  doc.setLineWidth(0.2);
  doc.line(4, y, w - 4, y);
  y += 4;

  // Client info
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE', 4, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(sale.clientName, 4, y);
  y += 3.5;
  if (sale.clientPhone) {
    doc.text(`Tel: ${sale.clientPhone}`, 4, y);
    y += 3.5;
  }
  if (sale.clientCommerce) {
    doc.text(sale.clientCommerce, 4, y);
    y += 3.5;
  }
  if (sale.clientCity) {
    doc.text(sale.clientCity, 4, y);
    y += 3.5;
  }
  doc.text(`Data: ${formatDateTime(sale.createdAt)}`, 4, y);
  y += 4;

  doc.line(4, y, w - 4, y);
  y += 3;

  // Items header
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('QTD', 4, y);
  doc.text('DESCRICAO', 14, y);
  doc.text('TOTAL', w - 4, y, { align: 'right' });
  y += 1;
  doc.line(4, y, w - 4, y);
  y += 3;

  // Items
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  for (const item of sale.items) {
    const nameStr = item.productName.length > 22 ? item.productName.substring(0, 22) + '..' : item.productName;
    doc.text(String(item.quantity), 6, y, { align: 'center' });
    doc.text(nameStr, 14, y);
    doc.text(formatCurrency(item.price * item.quantity), w - 4, y, { align: 'right' });
    y += 4;
  }

  y += 1;
  doc.line(4, y, w - 4, y);
  y += 4;

  // Totals
  doc.setFontSize(8);
  doc.text('Subtotal:', 4, y);
  doc.text(formatCurrency(sale.subtotal), w - 4, y, { align: 'right' });
  y += 4;

  if (sale.discount > 0) {
    doc.text('Desconto:', 4, y);
    doc.text(`-${formatCurrency(sale.discount)}`, w - 4, y, { align: 'right' });
    y += 4;
  }

  doc.text('Pagamento:', 4, y);
  doc.text(PAYMENT_LABELS[sale.paymentMethod] || 'Dinheiro', w - 4, y, { align: 'right' });
  y += 4;

  doc.line(4, y, w - 4, y);
  y += 4;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', 4, y);
  doc.text(formatCurrency(sale.total), w - 4, y, { align: 'right' });
  y += 5;

  doc.setLineDashPattern([1, 1], 0);
  doc.line(4, y, w - 4, y);
  y += 4;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Obrigado pela preferencia!', w / 2, y, { align: 'center' });
  y += 3;
  doc.text('CARVALHO VENDAS', w / 2, y, { align: 'center' });

  return doc.output('blob');
}

/** Generate report PDF and return blob */
export function generateSalesPDFBlob(sales: Sale[], title: string): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > 270) { doc.addPage(); y = 20; }
  };

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CARVALHO VENDAS', pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(12);
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 6;
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
    doc.text('Nenhuma venda encontrada.', pageWidth / 2, y, { align: 'center' });
  }

  for (const sale of sales) {
    const itemsHeight = sale.items.length * 6 + 50;
    checkPage(itemsHeight);
    const boxStart = y;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Cliente: ${sale.clientName}`, 16, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cel: ${sale.clientPhone}  |  ${[sale.clientCommerce, sale.clientCity].filter(Boolean).join(' - ')}`, 16, y);
    y += 5;
    doc.text(`Data: ${formatDateTime(sale.createdAt)}`, 16, y);
    y += 7;

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
    doc.text(`Pagamento: ${PAYMENT_LABELS[sale.paymentMethod] || 'Dinheiro'}`, 120, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(230, 130, 0);
    doc.text(`Total: ${formatCurrency(sale.total)}`, 120, y);
    doc.setTextColor(0, 0, 0);
    y += 3;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, boxStart - 4, pageWidth - 28, y - boxStart + 6, 2, 2, 'S');
    y += 12;
  }

  if (sales.length > 0) {
    checkPage(20);
    const grandTotal = sales.reduce((s, v) => s + v.total, 0);
    doc.setDrawColor(230, 130, 0);
    doc.setLineWidth(0.8);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${formatCurrency(grandTotal)} (${sales.length} vendas)`, pageWidth / 2, y, { align: 'center' });
  }

  return doc.output('blob');
}

/** Share a PDF blob via Web Share API or fallback to download */
export async function sharePDFViaWhatsApp(blob: Blob, filename: string, phone?: string) {
  const file = new File([blob], filename, { type: 'application/pdf' });

  // Try Web Share API (works on mobile)
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Carvalho Vendas',
        text: 'Segue o recibo em PDF',
      });
      return;
    } catch (e) {
      // User cancelled or error, fallback
    }
  }

  // Fallback: download + open WhatsApp with text message
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  if (phone) {
    const cleaned = phone.replace(/\D/g, '');
    const num = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
    setTimeout(() => {
      window.open(`https://wa.me/${num}?text=${encodeURIComponent('Segue o recibo da compra em PDF! 📄')}`, '_blank');
    }, 500);
  }
}
