import Dexie, { type Table } from 'dexie';
import { PRODUCT_CATALOG } from './productCatalog';

export interface Product {
  id?: number;
  name: string;
  price: number;
  createdAt: Date;
}

export interface Client {
  id?: number;
  name: string;
  phone: string;
  address: string;
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
  clientAddress: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
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
  }
}

export const db = new CarvalhoVendasDB();

export async function seedDemoData() {
  const productCount = await db.products.count();
  if (productCount === 0) {
    const now = new Date();
    const batch = PRODUCT_CATALOG.map(p => ({
      name: p.name,
      price: p.price,
      createdAt: now,
    }));
    // Insert in chunks of 500 to avoid blocking
    for (let i = 0; i < batch.length; i += 500) {
      await db.products.bulkAdd(batch.slice(i, i + 500));
    }
  }

  const clientCount = await db.clients.count();
  if (clientCount === 0) {
    await db.clients.bulkAdd([
      { name: 'Maria Silva', phone: '(11) 99999-1234', address: 'Rua das Flores, 123 - Centro', createdAt: new Date() },
      { name: 'João Santos', phone: '(11) 98888-5678', address: 'Av. Brasil, 456 - Jardim', createdAt: new Date() },
    ]);
  }
}
