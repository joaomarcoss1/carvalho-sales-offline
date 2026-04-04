import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Agulha/Costura': ['agulha', 'linha', 'costura', 'botao', 'ziper', 'fio de nylon', 'dedal', 'alfinete', 'elastico'],
  'Alumínio/Panela': ['panela', 'aluminio', 'caldeirao', 'frigideira', 'cacarola', 'leiteira', 'caneca aluminio', 'forma aluminio', 'assadeira'],
  'Brinquedo': ['brinquedo', 'boneca', 'carrinho', 'bola', 'jogo', 'pipa', 'pistola agua', 'massinha'],
  'Cozinha': ['colher', 'garfo', 'faca', 'prato', 'copo', 'xicara', 'caneca', 'vasilha', 'tigela', 'bandeja', 'escorredor', 'abridor', 'ralador', 'peneira', 'tabua', 'jarra', 'garrafa termica', 'forma'],
  'Decoração': ['quadro', 'espelho', 'vaso', 'flor artificial', 'porta retrato', 'relogio parede', 'cortina', 'toalha mesa'],
  'Elétrica': ['lampada', 'fio', 'tomada', 'interruptor', 'soquete', 'pilha', 'lanterna', 'extensao', 'benjamim', 'led', 'luminaria', 'abajur', 'adaptador', 'disjuntor', 'fita isolante'],
  'Ferramenta': ['chave', 'alicate', 'martelo', 'serrote', 'trena', 'parafuso', 'prego', 'broca', 'lixa', 'estilete', 'tesoura', 'cadeado', 'dobradiça', 'trinco', 'fechadura', 'corrente'],
  'Hidráulica': ['torneira', 'mangueira', 'conexao', 'registro', 'cano', 'joelho', 'te ', 'luva pvc', 'adaptador pvc', 'veda', 'teflon', 'sifao', 'valvula', 'flexivel'],
  'Limpeza': ['vassoura', 'rodo', 'balde', 'esponja', 'pano', 'detergente', 'desinfetante', 'saco lixo', 'luva limpeza', 'escova', 'pa de lixo', 'limpador', 'flanela', 'esfregao'],
  'Papelaria': ['caderno', 'caneta', 'lapis', 'borracha', 'apontador', 'cola', 'fita adesiva', 'tesoura escolar', 'papel', 'envelope', 'grampeador', 'clips', 'pasta', 'marca texto', 'regua'],
  'Pesca': ['anzol', 'linha pesca', 'chumbada', 'boia', 'vara', 'molinete', 'isca', 'rede'],
  'Pintura': ['tinta', 'pincel', 'rolo', 'bandeja pintura', 'lixa parede', 'massa corrida', 'selador', 'thinner', 'solvente', 'spray', 'verniz'],
  'Plástico/Utilidade': ['bacia', 'balde plastico', 'cesto', 'lixeira', 'organizador', 'pote', 'garrafa', 'regador', 'cabide', 'pregador', 'varal', 'caixa organizadora'],
  'Tintura/Cosmético': ['tintura', 'shampoo', 'creme', 'escova cabelo', 'pente', 'maquiagem', 'batom', 'esmalte', 'acetona', 'algodao', 'cotonete'],
};

function detectCategory(productName: string): string {
  const lower = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lower.includes(kwNorm)) return category;
    }
  }
  return 'Geral';
}

function standardizeName(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .replace(/[""]/g, '"')
    .replace(/\s*-\s*/g, ' - ');
}

interface ParsedProduct {
  name: string;
  ref: string;
  price: number;
  category: string;
}

// Common patterns for product lines in Brazilian supplier PDFs
// Pattern: REF/CODE  PRODUCT NAME  PRICE
// Or: PRODUCT NAME  PRICE
const PRICE_REGEX = /R?\$?\s*(\d{1,6}[.,]\d{2})\s*$/;
const REF_REGEX = /^(\d{2,8}(?:[-/.]\d+)?)\s+/;

function parseProductLine(line: string): ParsedProduct | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 5) return null;
  
  // Skip header/footer lines
  const skipPatterns = [
    /^(pagina|page|total|subtotal|cod|codigo|ref\b|descri|item|qtd|quant|valor|preco|un\b|marca)/i,
    /^\d+\/\d+\/\d+/,  // dates
    /^(telefone|fone|cnpj|cpf|end|rua|av\b)/i,
    /^[-=_]{3,}/,
    /^\s*\d+\s*$/,  // just a number
  ];
  
  for (const p of skipPatterns) {
    if (p.test(trimmed)) return null;
  }
  
  // Try to extract price
  const priceMatch = trimmed.match(PRICE_REGEX);
  if (!priceMatch) return null;
  
  const priceStr = priceMatch[1].replace(',', '.');
  const price = parseFloat(priceStr);
  if (isNaN(price) || price <= 0 || price > 99999) return null;
  
  let remainder = trimmed.slice(0, priceMatch.index).trim();
  if (!remainder || remainder.length < 3) return null;
  
  // Try to extract reference code
  let ref = '';
  const refMatch = remainder.match(REF_REGEX);
  if (refMatch) {
    ref = refMatch[1];
    remainder = remainder.slice(refMatch[0].length).trim();
  }
  
  // Also try extracting ref from middle patterns like "PRODUCT (REF: 123)"
  const refInline = remainder.match(/\(?\s*(?:ref|cod|código?)\s*[:.#]?\s*(\w[\w\-/.]*)\s*\)?/i);
  if (refInline && !ref) {
    ref = refInline[1];
    remainder = remainder.replace(refInline[0], '').trim();
  }
  
  if (!remainder || remainder.length < 3) return null;
  
  const name = standardizeName(remainder);
  const category = detectCategory(name);
  
  return { name, ref, price, category };
}

export interface PdfImportResult {
  products: ParsedProduct[];
  totalLines: number;
  skippedLines: number;
}

export async function extractProductsFromPdf(file: File): Promise<PdfImportResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const allLines: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Group text items by Y position to reconstruct lines
    const items = textContent.items as Array<{ str: string; transform: number[] }>;
    const lineMap = new Map<number, string[]>();
    
    for (const item of items) {
      if (!item.str.trim()) continue;
      // Round Y to group items on the same line (tolerance of 3px)
      const y = Math.round(item.transform[5] / 3) * 3;
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push(item.str);
    }
    
    // Sort by Y descending (PDF coords are bottom-up)
    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);
    for (const y of sortedYs) {
      allLines.push(lineMap.get(y)!.join(' '));
    }
  }
  
  const products: ParsedProduct[] = [];
  const seen = new Set<string>();
  let skipped = 0;
  
  for (const line of allLines) {
    const product = parseProductLine(line);
    if (product) {
      const key = `${product.name}|${product.price}`;
      if (!seen.has(key)) {
        seen.add(key);
        products.push(product);
      }
    } else {
      skipped++;
    }
  }
  
  return { products, totalLines: allLines.length, skippedLines: skipped };
}
