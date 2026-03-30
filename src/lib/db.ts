import Dexie, { type Table } from 'dexie';

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

// Seed some demo data if empty
export async function seedDemoData() {
  const productCount = await db.products.count();
  if (productCount === 0) {
    await db.products.bulkAdd([
      { name: 'Coca-Cola 2L', price: 8.99, createdAt: new Date() },
      { name: 'Pão Francês (kg)', price: 14.90, createdAt: new Date() },
      { name: 'Arroz 5kg', price: 24.50, createdAt: new Date() },
      { name: 'Feijão 1kg', price: 8.90, createdAt: new Date() },
      { name: 'Óleo de Soja 900ml', price: 6.49, createdAt: new Date() },
      { name: 'Açúcar 1kg', price: 4.99, createdAt: new Date() },
    ]);
  }

  const clientCount = await db.clients.count();
  if (clientCount === 0) {
    await db.clients.bulkAdd([
      { name: 'Maria Silva', phone: '(11) 99999-1234', address: 'Rua das Flores, 123 - Centro', createdAt: new Date() },
      { name: 'João Santos', phone: '(11) 98888-5678', address: 'Av. Brasil, 456 - Jardim', createdAt: new Date() },
    ]);
  }
}
