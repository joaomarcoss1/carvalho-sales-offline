import Dexie, { type Table } from 'dexie';
import { PRODUCT_CATALOG } from './productCatalog';

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'entrega';

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: '💠 Pix',
  dinheiro: '💵 Dinheiro',
  cartao: '💳 Cartão',
  entrega: '📦 Na Entrega',
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
  }
}

export const db = new CarvalhoVendasDB();

export async function seedDemoData() {
  const productCount = await db.products.count();
  if (productCount === 0) {
    const now = new Date();
    const batch = PRODUCT_CATALOG.map(p => ({
      name: p.name,
      ref: p.ref,
      price: p.price,
      category: p.category,
      createdAt: now,
    }));
    for (let i = 0; i < batch.length; i += 500) {
      await db.products.bulkAdd(batch.slice(i, i + 500));
    }
  }

  const clientCount = await db.clients.count();
  if (clientCount === 0) {
    await db.clients.bulkAdd([
      { name: 'Maria Silva', phone: '(11) 99999-1234', city: 'São Paulo', bairro: 'Centro', commerceName: 'Mercearia da Maria', referencePoint: 'Próximo à praça', createdAt: new Date() },
      { name: 'João Santos', phone: '(11) 98888-5678', city: 'São Paulo', bairro: 'Jardim', commerceName: 'Loja do João', referencePoint: 'Em frente ao mercado', createdAt: new Date() },
    ]);
  }
}
