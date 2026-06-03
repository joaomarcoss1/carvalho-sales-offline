import Dexie, { type Table } from 'dexie';
import { PRODUCT_CATALOG } from './productCatalog';

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'cheque';

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartao',
  cheque: 'Cheque',
};

export const PAYMENT_LABELS_DISPLAY: Record<PaymentMethod, string> = {
  pix: '💠 Pix',
  dinheiro: '💵 Dinheiro',
  cartao: '💳 Cartão',
  cheque: '📝 Cheque',
};

export interface Product {
  id?: number;
  name: string;
  ref: string;
  price: number;
  category: string;
  createdAt: Date;
}

export interface Client {
  id?: number;
  name: string;
  phone: string;
  city: string;
  bairro: string;
  commerceName: string;
  referencePoint: string;
  createdAt: Date;
}

export interface SaleItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id?: number;
  clientId: number;
  clientName: string;
  clientPhone: string;
  clientCity: string;
  clientCommerce: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: Date;
}

class CarvalhoVendasDB extends Dexie {
  products!: Table<Product>;
  clients!: Table<Client>;
  sales!: Table<Sale>;

  constructor() {
    super('CarvalhoVendasDB');
    
    this.version(1).stores({
      products: '++id, name',
      clients: '++id, name',
      sales: '++id, clientId, createdAt',
    });

    this.version(2).stores({
      products: '++id, name, category, ref',
      clients: '++id, name, city, commerceName',
      sales: '++id, clientId, createdAt',
    }).upgrade(tx => {
      return tx.table('products').toCollection().modify(product => {
        if (!product.ref) product.ref = '';
        if (!product.category) product.category = 'Geral';
      });
    });

    this.version(3).stores({
      products: '++id, name, category, ref',
      clients: '++id, name, city, commerceName',
      sales: '++id, clientId, createdAt',
    }).upgrade(tx => {
      return tx.table('clients').toCollection().modify(client => {
        if (!client.city) client.city = '';
        if (!client.bairro) client.bairro = '';
        if (!client.commerceName) client.commerceName = '';
        if (!client.referencePoint) client.referencePoint = '';
      });
    });

    this.version(4).stores({
      products: '++id, name, category, ref',
      clients: '++id, name, city, commerceName',
      sales: '++id, clientId, createdAt, paymentMethod',
    }).upgrade(tx => {
      return tx.table('sales').toCollection().modify(sale => {
        if (!sale.paymentMethod) sale.paymentMethod = 'dinheiro';
      });
    });

    this.version(5).stores({
      products: '++id, name, category, ref',
      clients: '++id, name, city, commerceName',
      sales: '++id, clientId, createdAt, paymentMethod',
    }).upgrade(tx => {
      return tx.table('sales').toCollection().modify(sale => {
        if ((sale as any).paymentMethod === 'fiado') {
          sale.paymentMethod = 'entrega';
        }
      });
    });

    this.version(6).stores({
      products: '++id, name, category, ref',
      clients: '++id, name, city, commerceName',
      sales: '++id, clientId, createdAt, paymentMethod',
    }).upgrade(tx => {
      return tx.table('sales').toCollection().modify(sale => {
        if ((sale as any).paymentMethod === 'entrega') {
          sale.paymentMethod = 'cheque';
        }
      });
    });
  }
}

export const db = new CarvalhoVendasDB();

const PERFUMARIA_PRODUCTS: Omit<Product, 'id' | 'createdAt'>[] = [
  { ref: '032144', name: 'ABSORVENTE COTTON BABY 12X1', price: 3.72, category: 'Tintura/Cosmético' },
  { ref: '032121', name: 'ABSORVENTE NOTURNO COTTON BABY', price: 5.96, category: 'Tintura/Cosmético' },
  { ref: '021113', name: 'BASE DELTRIO 12X1', price: 38.00, category: 'Tintura/Cosmético' },
  { ref: '032371', name: 'BATON 24 HORAS 12X1', price: 44.00, category: 'Tintura/Cosmético' },
  { ref: '023914', name: 'BRILHANTINA 12X1', price: 142.00, category: 'Tintura/Cosmético' },
  { ref: '000121', name: 'BRILHO LABIAL 36X1', price: 190.00, category: 'Tintura/Cosmético' },
  { ref: '000011', name: 'COLONIA ESSENCIAL SORTIDA', price: 32.00, category: 'Tintura/Cosmético' },
  { ref: '000156', name: 'COLONIA INFANTIL SORTIDA', price: 14.40, category: 'Tintura/Cosmético' },
  { ref: '000006', name: 'CREME CEBO DE CARNEIRO PARA RACHADURA DOS PES', price: 8.90, category: 'Tintura/Cosmético' },
  { ref: '032191', name: 'CREME DE AXILAS HERBISSIMO 55GR', price: 6.96, category: 'Tintura/Cosmético' },
  { ref: '030674', name: 'CREME DE PENTEAR TRATAMENTO SORTIDO', price: 7.00, category: 'Tintura/Cosmético' },
  { ref: '032188', name: 'CREME DENTAL SORRISO 90GR 12X1', price: 71.00, category: 'Tintura/Cosmético' },
  { ref: '030721', name: 'CREME SEBO DE CARNEIRO PARA OS PES BISNAGA', price: 9.98, category: 'Tintura/Cosmético' },
  { ref: '030191', name: 'DESODORANTE AEROSOL BIZ', price: 9.40, category: 'Tintura/Cosmético' },
  { ref: '024829', name: 'GEL COLA TUTI AMORE 240ML', price: 8.90, category: 'Tintura/Cosmético' },
  { ref: '024814', name: 'GEL DE MASSAGEM 15 ERVAS 200ML', price: 6.60, category: 'Tintura/Cosmético' },
  { ref: '021114', name: 'GEL DE MASSAGEM CEBO DE CARNEIRO 200ML', price: 7.90, category: 'Tintura/Cosmético' },
  { ref: '000010', name: 'GEL DE MASSAGEM COM ARNICA 200ML', price: 7.90, category: 'Tintura/Cosmético' },
  { ref: '023912', name: 'GEL DE MASSAGEM DE ALECRIM 100GR', price: 18.00, category: 'Tintura/Cosmético' },
  { ref: '029422', name: 'HIDRATANTE CORPORAL BELL CORPUS', price: 9.80, category: 'Tintura/Cosmético' },
  { ref: '032367', name: 'KIT DE GLOSS LABIAL', price: 8.40, category: 'Tintura/Cosmético' },
  { ref: '023743', name: 'OLEO CAPILAR DE MAMONA 120ML', price: 14.90, category: 'Tintura/Cosmético' },
  { ref: '000012', name: 'OLEO CAPILAR ESSENCIALY SORTIDO', price: 8.90, category: 'Tintura/Cosmético' },
];

export async function seedDemoData() {
  const SEED_FLAG = 'cv_seed_v2_perfumaria';
  if (!localStorage.getItem(SEED_FLAG)) {
    // One-time reset: clear existing stock and load only the Perfumaria list
    await db.products.clear();
    const now = new Date();
    await db.products.bulkAdd(
      PERFUMARIA_PRODUCTS.map(p => ({ ...p, createdAt: now }))
    );
    localStorage.setItem(SEED_FLAG, '1');
  }

  const clientCount = await db.clients.count();
  if (clientCount === 0) {
    await db.clients.bulkAdd([
      { name: 'Maria Silva', phone: '(11) 99999-1234', city: 'São Paulo', bairro: 'Centro', commerceName: 'Mercearia da Maria', referencePoint: 'Próximo à praça', createdAt: new Date() },
      { name: 'João Santos', phone: '(11) 98888-5678', city: 'São Paulo', bairro: 'Jardim', commerceName: 'Loja do João', referencePoint: 'Em frente ao mercado', createdAt: new Date() },
    ]);
  }
}
