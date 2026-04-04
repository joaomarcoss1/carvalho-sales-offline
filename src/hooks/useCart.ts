import { useState, useCallback, useMemo } from 'react';
import type { Client, SaleItem, PaymentMethod } from '@/lib/db';
import { db } from '@/lib/db';

export interface CartItem extends SaleItem {}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');

  const addItem = useCallback((productId: number, productName: string, price: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId, productName, price, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: number, delta: number) => {
    setItems(prev =>
      prev.map(i =>
        i.productId === productId ? { ...i, quantity: i.quantity + delta } : i
      ).filter(i => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  const finalizeSale = useCallback(async (): Promise<number> => {
    if (!client || items.length === 0) {
      throw new Error('Selecione um cliente e adicione itens');
    }

    const saleId = await db.sales.add({
      clientId: client.id!,
      clientName: client.name,
      clientPhone: client.phone,
      clientCity: client.city || '',
      clientCommerce: client.commerceName || '',
      items: [...items],
      subtotal,
      discount,
      total,
      paymentMethod,
      createdAt: new Date(),
    });

    const savedItems = [...items];
    const savedClient = { ...client };
    const savedTotal = total;
    const savedDiscount = discount;
    const savedSubtotal = subtotal;
    const savedPayment = paymentMethod;

    setItems([]);
    setClient(null);
    setDiscount(0);
    setPaymentMethod('dinheiro');

    return saleId as number;
  }, [client, items, subtotal, discount, total, paymentMethod]);

  // Get last sale for WhatsApp sharing
  const getLastSale = useCallback(async (saleId: number) => {
    return db.sales.get(saleId);
  }, []);

  return {
    items, client, discount, subtotal, total, paymentMethod,
    addItem, updateQuantity, removeItem,
    setClient, setDiscount, setPaymentMethod, finalizeSale, getLastSale,
  };
}
