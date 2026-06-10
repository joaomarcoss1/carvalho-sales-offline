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

const MEDEIROS_PRODUCTS: Omit<Product, 'id' | 'createdAt'>[] = [
  // Pág 0024 - Xaropes e Ervas/Ferragens
  { ref: '000323', name: 'XAROPE HISTAMIN', price: 19.90, category: 'Geral' },
  { ref: '030958', name: 'XAROPE MEL COM ALHO 220ML', price: 5.90, category: 'Geral' },
  { ref: '030959', name: 'XAROPE MEL COM HORTELA 220ML', price: 5.90, category: 'Geral' },
  { ref: '017804', name: 'XAROPE PEITORAL DE ANGICO', price: 21.90, category: 'Geral' },
  { ref: '030963', name: 'XAROPE TIRA TOSSE 200ML', price: 5.39, category: 'Geral' },
  { ref: '000117', name: 'ZIPER FINO 15CM SORTIDO', price: 11.90, category: 'Agulha/Costura' },
  { ref: '000118', name: 'ZIPER REFORCADO 15CM SORTIDO', price: 36.00, category: 'Agulha/Costura' },
  { ref: '030767', name: 'AMARA DE SOLA PARA CHUCALHO', price: 19.00, category: 'Geral' },
  { ref: '032217', name: 'AMARA PARA CHUCALHO SOLA BRANCA', price: 19.00, category: 'Geral' },
  { ref: '031639', name: 'ANZOL MARINE ESPORTE 100X1 N 7/0', price: 79.00, category: 'Pesca' },
  { ref: '021188', name: 'ANZOL MARINE ESPORTE 100X1 Nº01', price: 22.00, category: 'Pesca' },
  { ref: '021189', name: 'ANZOL MARINE ESPORTE 100X1 Nº02', price: 20.00, category: 'Pesca' },
  { ref: '021190', name: 'ANZOL MARINE ESPORTE 100X1 Nº04', price: 20.00, category: 'Pesca' },
  { ref: '021191', name: 'ANZOL MARINE ESPORTE 100X1 Nº06', price: 20.00, category: 'Pesca' },
  { ref: '021192', name: 'ANZOL MARINE ESPORTE 100X1 Nº08', price: 20.00, category: 'Pesca' },
  { ref: '021197', name: 'ANZOL MARINE ESPORTE 100X1 Nº1/0', price: 29.00, category: 'Pesca' },
  { ref: '021193', name: 'ANZOL MARINE ESPORTE 100X1 Nº10', price: 20.00, category: 'Pesca' },
  { ref: '021194', name: 'ANZOL MARINE ESPORTE 100X1 Nº12', price: 20.00, category: 'Pesca' },
  { ref: '021195', name: 'ANZOL MARINE ESPORTE 100X1 Nº14', price: 20.00, category: 'Pesca' },
  { ref: '021196', name: 'ANZOL MARINE ESPORTE 100X1 Nº16', price: 20.00, category: 'Pesca' },
  { ref: '021198', name: 'ANZOL MARINE ESPORTE 100X1 Nº2/0', price: 39.00, category: 'Pesca' },
  { ref: '021199', name: 'ANZOL MARINE ESPORTE 100X1 Nº3/0', price: 46.00, category: 'Pesca' },
  { ref: '021200', name: 'ANZOL MARINE ESPORTE 100X1 Nº4/0', price: 49.00, category: 'Pesca' },
  // Pág 0014 - Pentes e Pilhas
  { ref: '017414', name: 'PENTE CRISTAL SEM CABO', price: 2.19, category: 'Tintura/Cosmético' },
  { ref: '000096', name: 'PENTE DURAO P/BOLCO 24X1', price: 23.90, category: 'Tintura/Cosmético' },
  { ref: '032325', name: 'PENTE ESCOVA BELA OVAL REF.863', price: 2.96, category: 'Tintura/Cosmético' },
  { ref: '032358', name: 'PENTE ESCOVA OVAL', price: 29.00, category: 'Tintura/Cosmético' },
  { ref: '000099', name: 'PENTE ESCOVA REDONDO 24X1', price: 38.00, category: 'Tintura/Cosmético' },
  { ref: '032324', name: 'PENTE ESCOVA RETA REF.986', price: 2.96, category: 'Tintura/Cosmético' },
  { ref: '000100', name: 'PENTE FINO C/CABO P/PIOLHO 24X1', price: 27.40, category: 'Tintura/Cosmético' },
  { ref: '000101', name: 'PENTE FINO S/CABO P/PIOLHO 24X1', price: 27.90, category: 'Tintura/Cosmético' },
  { ref: '000102', name: 'PENTE GRANDE C/CABO 24X1', price: 23.90, category: 'Tintura/Cosmético' },
  { ref: '000103', name: 'PENTE GRANDE S/CABO 24X1', price: 23.90, category: 'Tintura/Cosmético' },
  { ref: '032322', name: 'PENTE INFINITO COLOR REF.115', price: 2.75, category: 'Tintura/Cosmético' },
  { ref: '032320', name: 'PENTE JACARE REF.1424', price: 2.75, category: 'Tintura/Cosmético' },
  { ref: '032243', name: 'PENTE PROFICIONAL CABO FINO 24X1', price: 29.00, category: 'Tintura/Cosmético' },
  { ref: '032321', name: 'PENTE PROFICIONAL REF.627', price: 2.75, category: 'Tintura/Cosmético' },
  { ref: '000104', name: 'PENTE VOVO 24X1', price: 32.00, category: 'Tintura/Cosmético' },
  { ref: '030847', name: 'PETECA COCAO 40X1', price: 40.00, category: 'Brinquedo' },
  { ref: '030848', name: 'PETECA LEITOSA 200X1', price: 59.00, category: 'Brinquedo' },
  { ref: '000105', name: 'PETECA VERDE 200X1', price: 38.00, category: 'Brinquedo' },
  { ref: '024832', name: 'PILHA PALITO ECONOMAX 60X1', price: 60.00, category: 'Elétrica' },
  { ref: '032417', name: 'PILHA PALITO RAYOVAC 48X1', price: 68.00, category: 'Elétrica' },
  { ref: '024831', name: 'PILHA PEQUENA ECONOMAX 60X1', price: 60.00, category: 'Elétrica' },
  { ref: '032416', name: 'PILHA PEQUENA RAYOVAC 48X1', price: 68.00, category: 'Elétrica' },
  { ref: '000106', name: 'PINCAS DEPILATORIA 12X1', price: 19.00, category: 'Tintura/Cosmético' },
  { ref: '032361', name: 'PIPAS COLORIDAS SORTIDAS 25X1', price: 128.00, category: 'Brinquedo' },
  { ref: '031904', name: 'PIRANHA GG 12X1', price: 15.60, category: 'Tintura/Cosmético' },
  // Pág 0020 - Extratos/Géis/Medicamentos
  { ref: '020906', name: 'EXTRATO DE NONI C/UVA 500ML', price: 11.80, category: 'Geral' },
  { ref: '030330', name: 'EXTRATO DE SETE ERVAS 200ML', price: 7.90, category: 'Geral' },
  { ref: '029716', name: 'FLUCONAZOL 150MG', price: 3.90, category: 'Geral' },
  { ref: '020805', name: 'GEL DE MASSAGEM BANHA DE AVESTRUZ', price: 12.90, category: 'Tintura/Cosmético' },
  { ref: '030194', name: 'GEL DE MASSAGEM BANHA DE CASCAVEL 240GR', price: 12.90, category: 'Tintura/Cosmético' },
  { ref: '030193', name: 'GEL DE MASSAGEM BANHA DE SUCURI 250GR', price: 12.90, category: 'Tintura/Cosmético' },
  { ref: '032168', name: 'GEL DE MASSAGEM CANELA DE VELHO 240GR', price: 11.50, category: 'Tintura/Cosmético' },
  { ref: '030332', name: 'GEL DE MASSAGEM CARTILGEM DE TUBARAO', price: 12.90, category: 'Tintura/Cosmético' },
  { ref: '024639', name: 'GEL DE MASSAGEM DE COPAIBA 200ML', price: 7.90, category: 'Tintura/Cosmético' },
  { ref: '030333', name: 'GEL DE MASSAGEM MAGRELA', price: 14.90, category: 'Tintura/Cosmético' },
  { ref: '030331', name: 'GEL DE MASSAGEM OLEO DE PEIXE ELETRICO', price: 12.90, category: 'Tintura/Cosmético' },
  { ref: '000155', name: 'GELOFUTI POMADA 20GR', price: 6.00, category: 'Geral' },
  { ref: '017805', name: 'GOTA DO ZECA', price: 4.90, category: 'Geral' },
  { ref: '020110', name: 'GOTA MILAGROSA PARA RACHADURA', price: 6.00, category: 'Geral' },
  { ref: '020113', name: 'GRIPAL C COMPRIMIDO 200X1', price: 180.00, category: 'Geral' },
  { ref: '020112', name: 'GRIPIN C COMPRIMIDO 150X1', price: 86.00, category: 'Geral' },
  { ref: '022401', name: 'HEPOGLOS CREME 45GRA', price: 16.90, category: 'Geral' },
  { ref: '032282', name: 'HISTAMIM COMPRIMIDO 20X1', price: 14.90, category: 'Geral' },
  { ref: '023177', name: 'IBUPROFENO COMPRIMIDO 400MM', price: 9.80, category: 'Geral' },
  { ref: '023178', name: 'IBUPROFENO COMPRIMIDO 600MM', price: 12.90, category: 'Geral' },
  { ref: '023176', name: 'IBUPROFENO EM GOTAS', price: 8.90, category: 'Geral' },
  { ref: '024074', name: 'IMEGOVE 150X1', price: 94.00, category: 'Geral' },
  { ref: '021806', name: 'INFECTRIN COMPRIMIDO 20X1', price: 22.80, category: 'Geral' },
  { ref: '020517', name: 'INFECTRIN SUSPENCAO', price: 16.90, category: 'Geral' },
  { ref: '030916', name: 'INFRALAX COMPRIMIDO 100X1', price: 59.00, category: 'Geral' },
  // Pág 0026 - Chucalho/Chumbinho/Coleira/Corrente
  { ref: '023945', name: 'CHUCALHO LOTE PARA BODE GRANDE', price: 12.00, category: 'Geral' },
  { ref: '030474', name: 'CHUCALHO LOTE PARA BODE MEDIO', price: 11.00, category: 'Geral' },
  { ref: '030475', name: 'CHUCALHO LOTE PARA BODE PEQUENO', price: 10.00, category: 'Geral' },
  { ref: '022661', name: 'CHUCALHO MEIO LOTE', price: 16.00, category: 'Geral' },
  { ref: '022664', name: 'CHUCALHO PE DE SERRA', price: 36.00, category: 'Geral' },
  { ref: '022663', name: 'CHUCALHO SUPER LOTE', price: 34.00, category: 'Geral' },
  { ref: '031966', name: 'CHUMBINHO 5,5', price: 12.00, category: 'Geral' },
  { ref: '032400', name: 'CHUMBINHO 5,5 AVENTADOR', price: 20.00, category: 'Geral' },
  { ref: '032401', name: 'CHUMBINHO 5,5 CASCADOR', price: 20.00, category: 'Geral' },
  { ref: '032403', name: 'CHUMBINHO 5,5 COMANDO', price: 20.00, category: 'Geral' },
  { ref: '032399', name: 'CHUMBINHO 5,5 MAGNUM', price: 20.00, category: 'Geral' },
  { ref: '032402', name: 'CHUMBINHO 5,5 POTENCIA', price: 20.00, category: 'Geral' },
  { ref: '032398', name: 'CHUMBINHO 5,5 ROKET', price: 20.00, category: 'Geral' },
  { ref: '020124', name: 'COLEIRA PARA CACHORRO DE NAYLON DUPLA N.05', price: 23.90, category: 'Geral' },
  { ref: '026289', name: 'COLEIRA PARA CACHORRO DE NAYLON DUPLA N.06', price: 26.90, category: 'Geral' },
  { ref: '020120', name: 'COLEIRA PARA CACHORRO DE NAYLON N.01', price: 3.96, category: 'Geral' },
  { ref: '020121', name: 'COLEIRA PARA CACHORRO DE NAYLON N.02', price: 6.96, category: 'Geral' },
  { ref: '020122', name: 'COLEIRA PARA CACHORRO DE NAYLON N.03', price: 8.96, category: 'Geral' },
  { ref: '020123', name: 'COLEIRA PARA CACHORRO DE NAYLON N.04', price: 10.86, category: 'Geral' },
  { ref: '031799', name: 'CORRENTE PARA CACHORRO N.00', price: 31.90, category: 'Geral' },
  { ref: '020125', name: 'CORRENTE PARA CACHORRO N.01', price: 23.90, category: 'Geral' },
  { ref: '020126', name: 'CORRENTE PARA CACHORRO N.02', price: 19.90, category: 'Geral' },
  { ref: '020127', name: 'CORRENTE PARA CACHORRO N.03', price: 13.96, category: 'Geral' },
  { ref: '020128', name: 'CORRENTE PARA CACHORRO N.04', price: 11.96, category: 'Geral' },
  { ref: '020129', name: 'CORRENTE PARA CACHORRO N.05', price: 10.90, category: 'Geral' },
  // Pág 0011 - Fita/Flanela/Fone/Funil/Gilete/Grampo/Guarda-Chuva/Insenso/Lampada/Liga
  { ref: '032273', name: 'FITA METRICA 50 METROS', price: 49.90, category: 'Ferramenta' },
  { ref: '032336', name: 'FLANELA MULTIUSO GRANDE 49X79', price: 8.40, category: 'Limpeza' },
  { ref: '032335', name: 'FLANELA MULTIUSO MEDIA 39/59', price: 4.79, category: 'Limpeza' },
  { ref: '032334', name: 'FLANELA MULTIUSO PEQUENA 28X48', price: 3.99, category: 'Limpeza' },
  { ref: '030271', name: 'FONE DE OUVIDO ORIGINAL SANSUNG', price: 12.00, category: 'Elétrica' },
  { ref: '000248', name: 'FUNIL DE PLASTICO 12X1', price: 28.00, category: 'Plástico/Utilidade' },
  { ref: '024835', name: 'GILETE LEISE 50X1', price: 31.90, category: 'Tintura/Cosmético' },
  { ref: '030359', name: 'GILETE MAX BRONDE 50X1', price: 31.90, category: 'Tintura/Cosmético' },
  { ref: '030362', name: 'GILETE SQ 50X1', price: 27.80, category: 'Tintura/Cosmético' },
  { ref: '030476', name: 'GILETE WILSON 60X1', price: 56.00, category: 'Tintura/Cosmético' },
  { ref: '000075', name: 'GRAMPO GRANDE 100X1', price: 13.90, category: 'Papelaria' },
  { ref: '000076', name: 'GRAMPO PEQUENO 100X1', price: 6.99, category: 'Papelaria' },
  { ref: '009471', name: 'GUARDA CHUVA 16 AROS', price: 29.00, category: 'Geral' },
  { ref: '025001', name: 'GUARDA CHUVA 2 CAPA REFORCADO', price: 34.00, category: 'Geral' },
  { ref: '009472', name: 'GUARDA CHUVA GRANDE TAM FAMILIA', price: 38.00, category: 'Geral' },
  { ref: '009469', name: 'GUARDA CHUVA INFANTIL', price: 22.90, category: 'Geral' },
  { ref: '009468', name: 'GUARDA CHUVA PORTATIL C/BOLSA', price: 22.90, category: 'Geral' },
  { ref: '000097', name: 'GUARDA-CHUVA REFORCADO C/PROTECAO SOLAR', price: 29.00, category: 'Geral' },
  { ref: '032287', name: 'INSENSO PARA BARATA', price: 11.90, category: 'Limpeza' },
  { ref: '031704', name: 'INSENSO PARA MURICOCA', price: 9.80, category: 'Limpeza' },
  { ref: '017710', name: 'KIT DE REPARO PARA PNEU', price: 16.90, category: 'Ferramenta' },
  { ref: '032203', name: 'LAMPADA DE EMERGENCIA RECARREGAVEL L 15', price: 75.00, category: 'Elétrica' },
  { ref: '032489', name: 'LANTERNA SQ 4540', price: 189.00, category: 'Elétrica' },
  { ref: '021510', name: 'LAPIS DE OLHO COM APONTADOR', price: 39.80, category: 'Tintura/Cosmético' },
  { ref: '030844', name: 'LIGA PARA DINHEIRO 100X1', price: 7.40, category: 'Papelaria' },
  // Pág 0021 - Invermectina/Jalapa/Leite/Luva/etc
  { ref: '031633', name: 'INVERMECTINA COMP 4X1', price: 18.00, category: 'Geral' },
  { ref: '026295', name: 'JALAPA EM PO 60X1', price: 60.00, category: 'Geral' },
  { ref: '025174', name: 'JALAPOL 300ML 12X1', price: 68.00, category: 'Geral' },
  { ref: '017806', name: 'KAOSEC 200X1', price: 60.00, category: 'Geral' },
  { ref: '000159', name: 'LEITE DE MAGNESIO 100ML', price: 6.40, category: 'Geral' },
  { ref: '031787', name: 'LIQUIDO FAZENDEIRO', price: 12.00, category: 'Geral' },
  { ref: '030884', name: 'LOSATANA POTASSIO 50MG 30X1', price: 5.60, category: 'Geral' },
  { ref: '024637', name: 'LUVA PARA PROCEDIMENTO COM 50 PARES', price: 38.00, category: 'Geral' },
  { ref: '030933', name: 'MANTEIGA DE CACAU ROLON 36X1', price: 5.96, category: 'Tintura/Cosmético' },
  { ref: '031647', name: 'MASCARA PROTEDORA 50X1', price: 90.00, category: 'Geral' },
  { ref: '000160', name: 'MEBENDAZOL COMPRIMIDO 6X1', price: 3.79, category: 'Geral' },
  { ref: '000161', name: 'MEBENDAZOL EM GOTAS 30ML', price: 3.79, category: 'Geral' },
  { ref: '031968', name: 'MERACILINA COMPRIMIDO 12X1', price: 23.00, category: 'Geral' },
  { ref: '020114', name: 'MULTIGRIPE EM CHA 50X1', price: 120.00, category: 'Geral' },
  { ref: '025173', name: 'MULTIGRIPE XAROPE 100ML', price: 16.90, category: 'Geral' },
  { ref: '032099', name: 'NAT GEL SPREY 12X1', price: 15.90, category: 'Geral' },
  { ref: '030714', name: 'NATGEL POMADA', price: 12.00, category: 'Geral' },
  { ref: '017807', name: 'NATUCLER 60X1', price: 54.00, category: 'Geral' },
  { ref: '020518', name: 'NEOSORO SOLUCAO NASAL ADULTA', price: 6.90, category: 'Geral' },
  { ref: '026639', name: 'NEOSORO SOLUCAO NASAL INFANTIL', price: 6.90, category: 'Geral' },
  { ref: '000219', name: 'NIMESULIDA COMPRIMIDO 12X1', price: 3.98, category: 'Geral' },
  { ref: '000218', name: 'NIMESULIDA EM GOTAS', price: 6.98, category: 'Geral' },
  { ref: '030888', name: 'NOFLOXACINO 400MM 14X1', price: 19.90, category: 'Geral' },
  { ref: '031661', name: 'OLEO DE MASSAGEM CANELA DE VELHO', price: 12.00, category: 'Tintura/Cosmético' },
  { ref: '031660', name: 'OLEO DE MASSAGEM CASCAVEL', price: 12.00, category: 'Tintura/Cosmético' },
  // Pág 0013 - Meia/Naftalina/Navalhete/Oleo/Palito/Pe Cadeira/Pedra/etc
  { ref: '032478', name: 'MEIA CANO CURTO MASCULINA 12X1', price: 44.00, category: 'Geral' },
  { ref: '032477', name: 'MEIA CANO LONGO FEMININA 12X1', price: 48.00, category: 'Geral' },
  { ref: '032476', name: 'MEIA CANO LONGO MASCULINA 12X1', price: 48.00, category: 'Geral' },
  { ref: '032480', name: 'MEIA INFANTIL SORTIDA 12X1', price: 44.00, category: 'Geral' },
  { ref: '032258', name: 'MIL GATO', price: 12.00, category: 'Geral' },
  { ref: '032411', name: 'NAFTALINA 15GR', price: 2.90, category: 'Limpeza' },
  { ref: '023288', name: 'NAFTALINA 500GR', price: 4.49, category: 'Limpeza' },
  { ref: '000092', name: 'NAFTALINA KG', price: 36.00, category: 'Limpeza' },
  { ref: '031009', name: 'NAVALHETE PARA BARBEIRO REF SQ 3942', price: 23.90, category: 'Tintura/Cosmético' },
  { ref: '030413', name: 'NAVALHETE PARA BARBEIRO REF.3290', price: 6.49, category: 'Tintura/Cosmético' },
  { ref: '021809', name: 'OLEO MULTIUSO 90ML', price: 8.40, category: 'Ferramenta' },
  { ref: '022470', name: 'PALITO DE UNHA 10CM 100X1', price: 9.90, category: 'Tintura/Cosmético' },
  { ref: '022469', name: 'PALITO DE UNHA 16CM 50X1', price: 14.90, category: 'Tintura/Cosmético' },
  { ref: '023943', name: 'PALITO DENTAL GABOARDE 25X1', price: 26.90, category: 'Geral' },
  { ref: '031653', name: 'PE DE CADEIRA GRANDE 100X1', price: 1.80, category: 'Plástico/Utilidade' },
  { ref: '032366', name: 'PE DE CADEIRA PARA VERGALHAO', price: 1.00, category: 'Plástico/Utilidade' },
  { ref: '031652', name: 'PE DE CADEIRA PEQUENO 100X1', price: 1.00, category: 'Plástico/Utilidade' },
  { ref: '022668', name: 'PEDRA PARA VASO SANITARIO 12X1', price: 26.60, category: 'Limpeza' },
  { ref: '000095', name: 'PEDRA POMES 12X1', price: 13.90, category: 'Tintura/Cosmético' },
  { ref: '032075', name: 'PEGA MOSCA SQ', price: 1.80, category: 'Limpeza' },
  { ref: '032216', name: 'PNEU PARA CARRO DE MAO', price: 44.00, category: 'Ferramenta' },
  { ref: '032323', name: 'PENTE C/CABO ST REF.3558', price: 2.75, category: 'Tintura/Cosmético' },
  { ref: '032318', name: 'PENTE COLOR CABO LISTRATO REF.9322', price: 2.75, category: 'Tintura/Cosmético' },
  { ref: '032319', name: 'PENTE COLOR DENTES LARGOS SQ 952', price: 2.75, category: 'Tintura/Cosmético' },
  { ref: '031738', name: 'PENTE CRISTAL C/CABO', price: 2.19, category: 'Tintura/Cosmético' },
  // Pág 0017 - Ziper Naylon e 03-Medicamentos (início)
  { ref: '030897', name: 'ZIPER DE NAYLON 20CM', price: 14.90, category: 'Agulha/Costura' },
  { ref: '030898', name: 'ZIPER DE NAYLON 25CM 12X1', price: 18.90, category: 'Agulha/Costura' },
  { ref: '030899', name: 'ZIPER DE NAYLON 30CM 12X1', price: 24.90, category: 'Agulha/Costura' },
  { ref: '032474', name: 'ZIPER DE NAYLON 40CM 12X1', price: 28.90, category: 'Agulha/Costura' },
  { ref: '030900', name: 'ZIPER REFORCADO 18CM 12X1', price: 48.00, category: 'Agulha/Costura' },
  { ref: '000119', name: 'AAS INFANTIL 200X1', price: 28.00, category: 'Geral' },
  { ref: '020809', name: 'AGUARDENTE 19 MISTURA 300ML', price: 68.00, category: 'Geral' },
  { ref: '029760', name: 'AGUARDENTE ALEMA SOBRAZIL 100ML 12X1', price: 38.00, category: 'Geral' },
  { ref: '000122', name: 'AGUARDENTE ALEMA SOBRAZIL 200ML 12X1', price: 45.00, category: 'Geral' },
  { ref: '017590', name: 'AGUARDENTE ALEMA SOBRAZIL 300ML 12X1', price: 54.00, category: 'Geral' },
  { ref: '000124', name: 'AGUARDENTE ALEMA SOBRAZIL 30ML 12X1', price: 24.00, category: 'Geral' },
  { ref: '025686', name: 'AGUARDENTE ALEMA SOBRAZIL 500ML', price: 8.00, category: 'Geral' },
  { ref: '024073', name: 'AGUARDENTE PARA DERRAME 350ML 12X1', price: 68.00, category: 'Geral' },
  { ref: '000125', name: 'ALBENDAZOL COMPRIMIDO', price: 3.69, category: 'Geral' },
  { ref: '000126', name: 'ALBENDAZOL EM GOTAS 10ML', price: 3.69, category: 'Geral' },
  { ref: '000179', name: 'AMOXILINA COMPRIMIDO 15X1', price: 9.00, category: 'Geral' },
  { ref: '031790', name: 'AMOXILINA COMPRIMIDO 21X1', price: 26.00, category: 'Geral' },
  { ref: '031265', name: 'AMOXILINA LIQUIDA 80ML', price: 29.90, category: 'Geral' },
  { ref: '000123', name: 'AMOXILINA LIQUIDO 150ML', price: 38.90, category: 'Geral' },
  { ref: '000128', name: 'AMPICILINA COMPRIMIDO 10X1', price: 21.90, category: 'Geral' },
  { ref: '019690', name: 'ANADOR COMPRIMIDO 120X1', price: 126.00, category: 'Geral' },
  { ref: '032269', name: 'ANADOR COMPRIMIDO 20X1', price: 44.00, category: 'Geral' },
  { ref: '030886', name: 'ANBROL/AMBROXOL 30MG 100ML', price: 6.90, category: 'Geral' },
  // Pág 0040 - Copo/Cuador/Cutelo/Escorredor/Escumadeira/Espatula
  { ref: '031879', name: 'COPO TERMIO ZIP GROSSO', price: 260.00, category: 'Cozinha' },
  { ref: '032376', name: 'CUADOR DE CAFE CABO ALUMINIO GRANDE', price: 96.00, category: 'Cozinha' },
  { ref: '032375', name: 'CUADOR DE CAFE CABO ALUMINIO PEQUENO', price: 78.00, category: 'Cozinha' },
  { ref: '000050', name: 'CUADOR DE CAFE CABO DE PLASTICO 12X1 PEQUENO', price: 19.00, category: 'Cozinha' },
  { ref: '027503', name: 'CUADOR DE CAFE CABO PLASTICO TAM GRANDE 12X1', price: 22.00, category: 'Cozinha' },
  { ref: '032341', name: 'CUTELO ORIGINAL PREMIO 8 POL SL 0347', price: 48.00, category: 'Cozinha' },
  { ref: '031703', name: 'CUTELO PARA COZINHA DASMACO 9 POL', price: 169.00, category: 'Cozinha' },
  { ref: '031876', name: 'CUTELO PARA MATO 10 POLEGADA', price: 28.00, category: 'Ferramenta' },
  { ref: '031877', name: 'CUTELO PARA MATO 12 POLEGADA', price: 32.00, category: 'Ferramenta' },
  { ref: '031878', name: 'CUTELO PARA MATO 14 POLEGADA', price: 36.00, category: 'Ferramenta' },
  { ref: '032340', name: 'CUTELO PROFICIONAL CABO 6 POL SQ 4604', price: 29.00, category: 'Cozinha' },
  { ref: '032342', name: 'CUTELO TEXAS 6 POL SQ 4568', price: 36.00, category: 'Cozinha' },
  { ref: '032344', name: 'DECASCADOR DE LEGUMES SQ 3974', price: 17.80, category: 'Cozinha' },
  { ref: '029089', name: 'ESCORREDOR DE ACO TAM.GRAND 28CM', price: 18.90, category: 'Cozinha' },
  { ref: '029174', name: 'ESCORREDOR DE ACO TAM.MEDIO 25CM', price: 16.90, category: 'Cozinha' },
  { ref: '029088', name: 'ESCORREDOR DE ACO TAM.PEQUENO 22CM', price: 13.90, category: 'Cozinha' },
  { ref: '000049', name: 'ESCUMADEIRA ALUMINIO BATIDO', price: 7.90, category: 'Alumínio/Panela' },
  { ref: '032214', name: 'ESCUMADEIRA DE ALUMINIO BATIDO', price: 7.90, category: 'Alumínio/Panela' },
  { ref: '031789', name: 'ESCUMADEIRA INOX PREMIO REF.3192', price: 14.90, category: 'Cozinha' },
  { ref: '032305', name: 'ESCUMADEIRA INOX SQ REF.4245', price: 9.90, category: 'Cozinha' },
  { ref: '032238', name: 'ESCUMADEIRA SILICONE SQ 4157', price: 12.90, category: 'Cozinha' },
  { ref: '032306', name: 'ESPATULA INOX SQ RE.4247', price: 9.90, category: 'Cozinha' },
  { ref: '025798', name: 'ESPATULA PARA MISTO', price: 4.98, category: 'Cozinha' },
  { ref: '032240', name: 'ESPATULA SILICONE SQ 4160', price: 15.90, category: 'Cozinha' },
  { ref: '000234', name: 'ESPREMEDOR DE ALHO DE ALUMINIO 12X1', price: 7.50, category: 'Cozinha' },
  // Pág 0016 - Tesoura/Tintol/Touca/Unha/Vela/Xuxa
  { ref: '026179', name: 'TESOURA PARA UNHA PONTA CURVADA', price: 6.60, category: 'Tintura/Cosmético' },
  { ref: '010013', name: 'TESOURA PARA UNHA PONTA RETA', price: 6.60, category: 'Tintura/Cosmético' },
  { ref: '032088', name: 'TESOURA PREMIO PARA CABELO 7/5', price: 10.90, category: 'Tintura/Cosmético' },
  { ref: '032032', name: 'TESOURA PREMIO PARA TECIDO 8,5', price: 19.90, category: 'Agulha/Costura' },
  { ref: '032083', name: 'TESOURA PREMIO PARA TECIDO 9,5', price: 22.90, category: 'Agulha/Costura' },
  { ref: '032212', name: 'TESOURA PROFICIONAL 10,5 METAL', price: 59.00, category: 'Ferramenta' },
  { ref: '027582', name: 'TESOURA PROFICIONAL 9,5 METAL', price: 54.00, category: 'Ferramenta' },
  { ref: '032333', name: 'TESOURA PROFICIONAL PARA CABELO SQ 3333', price: 34.90, category: 'Tintura/Cosmético' },
  { ref: '030334', name: 'TINTOL PARA ROUPA COR AZUL 12X1', price: 44.00, category: 'Limpeza' },
  { ref: '025774', name: 'TINTOL PARA ROUPA COR PRETA 12X1', price: 44.00, category: 'Limpeza' },
  { ref: '025775', name: 'TINTOL PARA ROUPA COR SORTIDO 12X1', price: 44.00, category: 'Limpeza' },
  { ref: '032468', name: 'TOUCA PARA CABELO CETIM COM FAIXA', price: 7.50, category: 'Tintura/Cosmético' },
  { ref: '032467', name: 'TOUCA PARA CABELO CETIM DUPLA FACE', price: 9.90, category: 'Tintura/Cosmético' },
  { ref: '032466', name: 'TOUCA PARA CABELO CETIM SIMPLES', price: 3.90, category: 'Tintura/Cosmético' },
  { ref: '032192', name: 'UNHA PORTICA COLORIDA CARTELA', price: 55.00, category: 'Tintura/Cosmético' },
  { ref: '032193', name: 'UNHA PORTICA COM GLITER CARTELA', price: 78.00, category: 'Tintura/Cosmético' },
  { ref: '032194', name: 'UNHA PORTICA STILETO CARTELA', price: 38.00, category: 'Tintura/Cosmético' },
  { ref: '022424', name: 'UNHEQUE TAM.GRANDE 12X1 SORTIDO', price: 48.00, category: 'Tintura/Cosmético' },
  { ref: '020249', name: 'UNHEQUE TAM.PEQUENO 12X1 SORTIDO', price: 23.90, category: 'Tintura/Cosmético' },
  { ref: '023179', name: 'VELA PARA FILTRO', price: 6.90, category: 'Hidráulica' },
  { ref: '020117', name: 'XUXA COLORIDA GRANDE 24X1', price: 22.60, category: 'Tintura/Cosmético' },
  { ref: '020118', name: 'XUXA COLORIDA MEDIA 24X1', price: 16.90, category: 'Tintura/Cosmético' },
  { ref: '020119', name: 'XUXA COLORIDA PEQUENA 100X1', price: 18.00, category: 'Tintura/Cosmético' },
  { ref: '031687', name: 'XUXA MEDIA 60X1', price: 18.00, category: 'Tintura/Cosmético' },
  { ref: '032472', name: 'XUXA XD 105', price: 3.60, category: 'Tintura/Cosmético' },
];


const MEDEIROS_V2_PRODUCTS: Omit<Product, 'id' | 'createdAt'>[] = [
  { ref: '032241', name: 'COLHER ALUMINIO BATIDO GG', price: 34.00, category: 'Cozinha' },
  { ref: '022425', name: 'COLHER DE ALUMINIO BATIDO 12X1', price: 7.90, category: 'Cozinha' },
  { ref: '028214', name: 'COLHER DE ARROZ DE INOX PREMIUN REF 3191', price: 14.90, category: 'Cozinha' },
  { ref: '032422', name: 'COLHER DE MADEIRA 20CM', price: 7.40, category: 'Cozinha' },
  { ref: '032421', name: 'COLHER DE MADEIRA 33CM', price: 9.50, category: 'Cozinha' },
  { ref: '032420', name: 'COLHER DE MADEIRA 40CM', price: 11.30, category: 'Cozinha' },
  { ref: '032419', name: 'COLHER DE MADEIRA 50CM', price: 13.00, category: 'Cozinha' },
  { ref: '032418', name: 'COLHER DE MADEIRA 60CM', price: 20.00, category: 'Cozinha' },
  { ref: '032237', name: 'COLHER DE SILICONE SQ 4359', price: 11.90, category: 'Cozinha' },
  { ref: '032343', name: 'COLHER INOX PREMIO CURTA SQ 3192', price: 13.90, category: 'Cozinha' },
  { ref: '032303', name: 'COLHER INOX SQ REF.4243', price: 9.90, category: 'Cozinha' },
  { ref: '032304', name: 'COLHER INOX SQ REF.4244', price: 9.90, category: 'Cozinha' },
  { ref: '032370', name: 'COLHER KIT CABO PLASTICO HM 350', price: 14.90, category: 'Cozinha' },
  { ref: '032239', name: 'COLHER SILICONE SQ 4360', price: 12.90, category: 'Cozinha' },
  { ref: '032242', name: 'CONCHA ALUMINIO BATIDO GG', price: 34.00, category: 'Cozinha' },
  { ref: '022426', name: 'CONCHA DE ALUMINIO BATIDO 12X1', price: 7.90, category: 'Cozinha' },
  { ref: '028215', name: 'CONCHA DE FEIJAO INOX PREMIUN REF 3190', price: 14.90, category: 'Cozinha' },
  { ref: '032235', name: 'CONCHA DE SILICONE SQ 4158', price: 12.90, category: 'Cozinha' },
  { ref: '032290', name: 'CONCHA PARA CEREAIS GRANDE', price: 23.90, category: 'Cozinha' },
  { ref: '032291', name: 'CONCHA PARA CEREAIS MEDIA', price: 19.90, category: 'Cozinha' },
  { ref: '032292', name: 'CONCHA PARA CEREAIS PEQUENO', price: 15.90, category: 'Cozinha' },
  { ref: '032150', name: 'COPO DE INOX GRANDE', price: 14.90, category: 'Cozinha' },
  { ref: '032151', name: 'COPO DE INOX PEQUENO', price: 6.90, category: 'Cozinha' },
  { ref: '031881', name: 'COPO TERMICO ZIP FINO', price: 260.00, category: 'Cozinha' },
  { ref: '031880', name: 'COPO TERMICO ZIP MEDIO', price: 260.00, category: 'Cozinha' },
  { ref: '021201', name: 'ANZOL MARINE ESPORTE 100X1 Nº5/0', price: 56.00, category: 'Pesca' },
  { ref: '021202', name: 'ANZOL MARINE ESPORTE 100X1 Nº6/0', price: 68.00, category: 'Pesca' },
  { ref: '021203', name: 'ANZOL MARINE ESPORTE 100X1 Nº8/0', price: 132.00, category: 'Pesca' },
  { ref: '000181', name: 'APITO DE CORDONA', price: 5.00, category: 'Geral' },
  { ref: '000182', name: 'APITO DE JURITE 12X1', price: 5.90, category: 'Geral' },
  { ref: '000183', name: 'APITO DE NANBU 12X1', price: 5.90, category: 'Geral' },
  { ref: '031701', name: 'APITO DE NANBU TORNEADO', price: 10.00, category: 'Geral' },
  { ref: '032339', name: 'APITO DE VARA', price: 3.80, category: 'Geral' },
  { ref: '031227', name: 'APITO PARA ZABELY 12X1', price: 10.00, category: 'Geral' },
  { ref: '000190', name: 'BALADEIRA C/CABO DE MADEIRA FINA 12X1', price: 54.00, category: 'Geral' },
  { ref: '000189', name: 'BALADEIRA CABO DE MADEIRA GROSSA 12X1', price: 62.00, category: 'Geral' },
  { ref: '031972', name: 'BOMBA N.01', price: 14.90, category: 'Geral' },
  { ref: '031974', name: 'BOMBA N.04', price: 16.90, category: 'Geral' },
  { ref: '000290', name: 'CADEADO CARTELA PADROK', price: 128.00, category: 'Ferramentas' },
  { ref: '012077', name: 'CADEADO ROSSE N.25', price: 12.80, category: 'Ferramentas' },
  { ref: '012076', name: 'CADEADO ROSSE N.38', price: 19.80, category: 'Ferramentas' },
  { ref: '012075', name: 'CADEADO ROSSI N.32', price: 16.90, category: 'Ferramentas' },
  { ref: '012074', name: 'CADEADO ROSSI N.50', price: 29.90, category: 'Ferramentas' },
  { ref: '032215', name: 'CAMARA DE AR PARA CARRO DE MAO', price: 29.00, category: 'Geral' },
  { ref: '026645', name: 'CHUCALHO CAMPA', price: 30.00, category: 'Geral' },
  { ref: '021516', name: 'CHUCALHO COMUM PARA BODE', price: 10.00, category: 'Geral' },
  { ref: '021513', name: 'CHUCALHO COMUN GRANDE', price: 21.90, category: 'Geral' },
  { ref: '021514', name: 'CHUCALHO COMUN MEDIA', price: 18.60, category: 'Geral' },
  { ref: '021515', name: 'CHUCALHO COMUN PEQUENO', price: 15.90, category: 'Geral' },
  { ref: '022662', name: 'CHUCALHO LOTE', price: 28.00, category: 'Geral' },
  { ref: '030197', name: 'PIRANHA GRANDE 12X1', price: 12.60, category: 'Geral' },
  { ref: '030198', name: 'PIRANHA LARGA 6X1', price: 14.50, category: 'Geral' },
  { ref: '030196', name: 'PIRANHA MEDIA 12X1', price: 10.90, category: 'Geral' },
  { ref: '030195', name: 'PIRANHA PEQUENA 12X1', price: 8.96, category: 'Geral' },
  { ref: '000107', name: 'PRENDEDOR DE ROUPA DE MADEIRA 12X1', price: 2.90, category: 'Geral' },
  { ref: '000108', name: 'PRENDEDOR DE ROUPA DE PLASTICO 12X1', price: 3.90, category: 'Geral' },
  { ref: '032373', name: 'RAQUETE ELETRICA', price: 36.00, category: 'Geral' },
  { ref: '000112', name: 'SABONETEIRA COMUN 12X1', price: 37.90, category: 'Geral' },
  { ref: '000113', name: 'SABONETEIRA CRISTAL 12X1', price: 43.80, category: 'Geral' },
  { ref: '032162', name: 'SANDALIA DE MARCAS ALTO RELEVO', price: 26.00, category: 'Calçados' },
  { ref: '032109', name: 'SANDALIA DE MARCAS SORTIDAS', price: 23.90, category: 'Calçados' },
  { ref: '032141', name: 'SANDALIA FEMININA INFANTIL', price: 21.90, category: 'Calçados' },
  { ref: '032108', name: 'SANDALIA HAVAIANAS ALTO RELEVO', price: 23.90, category: 'Calçados' },
  { ref: '032159', name: 'SANDALIA HAVAIANAS BORBOLETA', price: 23.90, category: 'Calçados' },
  { ref: '032161', name: 'SANDALIA HAVAIANAS C/RABICHO', price: 23.90, category: 'Calçados' },
  { ref: '032107', name: 'SANDALIA HAVAIANAS DECORADA', price: 21.90, category: 'Calçados' },
  { ref: '032160', name: 'SANDALIA HAVAIANAS GLITER', price: 22.90, category: 'Calçados' },
  { ref: '032164', name: 'SANDALIA HAVAIANAS INFANTIL ESTRELA', price: 21.90, category: 'Calçados' },
  { ref: '032163', name: 'SANDALIA HAVAIANAS INFANTIL MINE', price: 21.90, category: 'Calçados' },
  { ref: '032106', name: 'SANDALIA HAVAIANAS LISA', price: 21.90, category: 'Calçados' },
  { ref: '032142', name: 'SANDALIA MASCULINA INFANTIL', price: 21.90, category: 'Calçados' },
  { ref: '032143', name: 'SANDALIA SANTA LOLA SORTIDA', price: 23.90, category: 'Calçados' },
  { ref: '000347', name: 'TESOURA P/CABELEREIRO SQ 7/5 COLORIDA', price: 8.90, category: 'Geral' },
  { ref: '000348', name: 'TESOURA P/TECIDOS SQ 8.5 COLORIDA', price: 15.90, category: 'Geral' },
  { ref: '017155', name: 'TESOURA PARA TECIDO SQ 9.5 COLORIDA', price: 19.90, category: 'Geral' },
  { ref: '032426', name: 'GRELHA PARA CHURRASCO CRS 2313', price: 24.90, category: 'Cozinha' },
  { ref: '032427', name: 'GRELHA PARA CHURRASCO CRS 2314', price: 26.90, category: 'Cozinha' },
  { ref: '032428', name: 'GRELHA PARA CHURRASCO CRS 2316', price: 36.99, category: 'Cozinha' },
  { ref: '032429', name: 'GRELHA PARA CHURRASCO CRS 2317', price: 42.90, category: 'Cozinha' },
  { ref: '032434', name: 'GRELHA PARA CHURRASCO GALVANIZADA 30X20', price: 39.00, category: 'Cozinha' },
  { ref: '032433', name: 'GRELHA PARA CHURRASCO GALVANIZADA 40X23', price: 47.00, category: 'Cozinha' },
  { ref: '032347', name: 'KIT DE CHURRASCO 2 PECAS SQ 4259', price: 25.60, category: 'Cozinha' },
  { ref: '032348', name: 'KIT DE CHURRASCO 3 PECAS SQ 4258', price: 39.80, category: 'Cozinha' },
  { ref: '030140', name: 'KIT DE COLHER DE INOX 6X1 REF 3455', price: 23.60, category: 'Cozinha' },
  { ref: '030142', name: 'KIT DE FACA DE INOX 6X1 REF 3457', price: 23.60, category: 'Cozinha' },
  { ref: '030141', name: 'KIT DE GARFO DE INOX 6X1 REF 3456', price: 23.60, category: 'Cozinha' },
  { ref: '022468', name: 'PEDRA DE AFIAR CANOA', price: 5.80, category: 'Ferramentas' },
  { ref: '024851', name: 'PEDRA DE AFIAR MODELO QUADRADA', price: 5.80, category: 'Ferramentas' },
  { ref: '024965', name: 'PEGADOR DE MACARRAO', price: 6.80, category: 'Cozinha' },
  { ref: '032300', name: 'PENEIRA C/ABAS DE PLASTICO 20CM', price: 9.80, category: 'Cozinha' },
  { ref: '032301', name: 'PENEIRA C/ABAS DE PLASTICO 22CM', price: 10.90, category: 'Cozinha' },
  { ref: '032302', name: 'PENEIRA C/ABAS DE PLASTICO 25CM', price: 11.90, category: 'Cozinha' },
  { ref: '032260', name: 'PENEIRA CABO MADEIRA 20CM', price: 46.00, category: 'Cozinha' },
  { ref: '032262', name: 'PENEIRA CABO MADEIRA 24CM', price: 52.00, category: 'Cozinha' },
  { ref: '032261', name: 'PENEIRA CABO MADEIRA FUNDA 18CM', price: 48.00, category: 'Cozinha' },
  { ref: '032263', name: 'PENEIRA CABO MADEIRA FUNDA 20CM', price: 54.00, category: 'Cozinha' },
  { ref: '032312', name: 'PENEIRA DE INOX 10CM SQ 3697', price: 5.90, category: 'Cozinha' },
  { ref: '032313', name: 'PENEIRA DE INOX 12CM SQ 3698', price: 6.90, category: 'Cozinha' },
  { ref: '032314', name: 'PENEIRA DE INOX 14CM SQ 3699', price: 9.60, category: 'Cozinha' },
  { ref: '032315', name: 'PENEIRA DE INOX 16CM SQ 3700', price: 11.60, category: 'Cozinha' },
  { ref: '025779', name: 'ANTE-ALERGICO XAROPE DEXAMETAZONA', price: 6.98, category: 'Medicamentos' },
  { ref: '031634', name: 'AZITROMICINA COMP 3X1', price: 11.00, category: 'Medicamentos' },
  { ref: '031207', name: 'BACSULFAPRIN 100ML', price: 14.90, category: 'Medicamentos' },
  { ref: '020807', name: 'BACSULFAPRIN INFECTRIN', price: 5.90, category: 'Medicamentos' },
  { ref: '021808', name: 'BANDEIDE 120X1', price: 48.00, category: 'Medicamentos' },
  { ref: '021807', name: 'BANDEIDE 40X1', price: 17.00, category: 'Medicamentos' },
  { ref: '020804', name: 'BATON MANTEIGA DE CACAU 50X1', price: 3.46, category: 'Medicamentos' },
  { ref: '021883', name: 'BERITIM BC 240ML', price: 10.90, category: 'Medicamentos' },
  { ref: '031635', name: 'BICARBONATO DE SIDIO', price: 6.00, category: 'Medicamentos' },
  { ref: '031964', name: 'BICO DOCE 250ML', price: 12.00, category: 'Medicamentos' },
  { ref: '031965', name: 'BICO DOCE 500ML', price: 24.00, category: 'Medicamentos' },
  { ref: '030934', name: 'BISALAK LAXANTE 20X1', price: 9.60, category: 'Medicamentos' },
  { ref: '000134', name: 'BUCATONICO 400ML', price: 7.90, category: 'Medicamentos' },
  { ref: '026324', name: 'BULQUINA COMPRIMIDO 30X1', price: 21.00, category: 'Medicamentos' },
  { ref: '029594', name: 'BUSCOPAN COMPRIMIDO 20X1', price: 23.90, category: 'Medicamentos' },
  { ref: '029595', name: 'BUSCOPAN LIQUIDO', price: 23.90, category: 'Medicamentos' },
  { ref: '000135', name: 'BUTAZONA 200X1', price: 186.00, category: 'Medicamentos' },
  { ref: '020907', name: 'CALCIO VITAL 250ML', price: 10.00, category: 'Medicamentos' },
  { ref: '032167', name: 'CANELA DE VELHO POMADA 150GR', price: 12.00, category: 'Medicamentos' },
  { ref: '022400', name: 'CAPTOPRIL COMPRIMIDO 30X1', price: 3.90, category: 'Medicamentos' },
  { ref: '026296', name: 'CARAMELONE EM PO 60X1', price: 60.00, category: 'Medicamentos' },
  { ref: '000136', name: 'CARRO SANTO', price: 20.00, category: 'Medicamentos' },
  { ref: '000138', name: 'CATUABA 50X1', price: 9.80, category: 'Medicamentos' },
  { ref: '020802', name: 'CEFALEXINA COMPRIMIDO 12X1', price: 19.90, category: 'Medicamentos' },
  { ref: '020803', name: 'CEFALEXINA EM GOTAS', price: 16.40, category: 'Medicamentos' },
  { ref: '030882', name: 'CELESTIL XAROPE 120ML', price: 9.60, category: 'Medicamentos' },
  { ref: '021805', name: 'CELESTONE COMPRIMIDO 20X1', price: 18.60, category: 'Medicamentos' },
  { ref: '030883', name: 'CELESTRAT XAROPE 120ML', price: 13.40, category: 'Medicamentos' },
  { ref: '000139', name: 'CERVEJA PRETA 300ML', price: 68.00, category: 'Medicamentos' },
  { ref: '021884', name: 'CICLO 21 COMPRIMIDO', price: 18.90, category: 'Medicamentos' },
  { ref: '031208', name: 'CIDENAFILA COMPRIMIDO 4X1', price: 4.90, category: 'Medicamentos' },
  { ref: '031646', name: 'CIMETICONA ANTES GASES', price: 4.90, category: 'Medicamentos' },
  { ref: '030889', name: 'CIPROFLOXACINO 500MG 14X1', price: 19.90, category: 'Medicamentos' },
  { ref: '030885', name: 'CITOMICOSS CETOCONAZOL 200MG 10X1', price: 6.90, category: 'Medicamentos' },
  { ref: '030887', name: 'COLETOR DE FESES E URINA 100X1', price: 116.00, category: 'Medicamentos' },
  { ref: '020909', name: 'COMPLEXO B COMPRIMIDO 50X1', price: 7.50, category: 'Medicamentos' },
  { ref: '023944', name: 'CONTONETE 12X1', price: 27.00, category: 'Medicamentos' },
  { ref: '030842', name: 'CURA TUDO 500ML', price: 7.96, category: 'Medicamentos' },
  { ref: '000145', name: 'DENOGRIPE COMPRIMIDO 120X1', price: 89.00, category: 'Medicamentos' },
  { ref: '023729', name: 'DICLOFENACO COMPRIMIDO 20X1', price: 4.00, category: 'Medicamentos' },
  { ref: '026325', name: 'DICLOFENADO EM GEL', price: 9.60, category: 'Medicamentos' },
  { ref: '000150', name: 'DIPIRONA COMPRIMIDO SOBRAL 200X1', price: 109.00, category: 'Medicamentos' },
  { ref: '000151', name: 'DIPIRONA EM GOTAS 12X1', price: 47.00, category: 'Medicamentos' },
  { ref: '000152', name: 'DORALFLEX COMPRIMIDO 200X1', price: 89.00, category: 'Medicamentos' },
  { ref: '030917', name: 'DORALGINA COMPRIMIDO 100X1', price: 99.00, category: 'Medicamentos' },
  { ref: '030918', name: 'DORALGINA COMPRIMIDO 20X1', price: 22.00, category: 'Medicamentos' },
  { ref: '021885', name: 'ELIXIR 914 150ML', price: 27.80, category: 'Medicamentos' },
  { ref: '000153', name: 'ELIXIR PAREGORICO 30ML', price: 44.00, category: 'Medicamentos' },
  { ref: '031786', name: 'ESPESIFICO PESSOA', price: 12.00, category: 'Medicamentos' },
  { ref: '021107', name: 'EXTRATO DE GUARANA 500ML', price: 12.80, category: 'Medicamentos' },
  { ref: '032204', name: 'FRIGIDEIRA CERAMICA ANTEADERENTE 28CM', price: 87.00, category: 'Cozinha' },
  { ref: '032208', name: 'FRIGIDEIRA CERAMICA ANTEADERENTE C/TAMPA 24CM', price: 98.00, category: 'Cozinha' },
  { ref: '032207', name: 'FRIGIDEIRA CERAMICA ANTEADERENTE C/TAMPA 28CM', price: 126.00, category: 'Cozinha' },
  { ref: '032248', name: 'FRIGIDEIRA CERAMICA ANTI ADERENTE 16CM', price: 44.00, category: 'Cozinha' },
  { ref: '032247', name: 'FRIGIDEIRA CERAMICA ANTI ADERENTE 17CM', price: 46.00, category: 'Cozinha' },
  { ref: '032246', name: 'FRIGIDEIRA CERAMICA ANTI ADERENTE 20CM', price: 55.00, category: 'Cozinha' },
  { ref: '031900', name: 'FUNIL DE PLASTICO MEDIO', price: 3.98, category: 'Cozinha' },
  { ref: '032299', name: 'FUNIL DE PLASTICO SQ REF.3786', price: 14.90, category: 'Cozinha' },
  { ref: '000249', name: 'FUNIL DE ZINCO PEQUENO 12X1', price: 3.00, category: 'Cozinha' },
  { ref: '032249', name: 'GARFO DE ALUMINIO BATIDO', price: 7.90, category: 'Cozinha' },
  { ref: '032369', name: 'GARFO KIT CABO PLASTICO HM.351', price: 14.90, category: 'Cozinha' },
  { ref: '032257', name: 'GARRAFA 750ML HM 375', price: 37.00, category: 'Cozinha' },
  { ref: '032470', name: 'GARRAFA ISOTERMICA HM 218', price: 44.00, category: 'Cozinha' },
  { ref: '032469', name: 'GARRAFA ISOTERMICA HM 245', price: 44.00, category: 'Cozinha' },
  { ref: '031875', name: 'GARRAFA ISOTERMICA SPORTE N.01 FINO', price: 49.00, category: 'Cozinha' },
  { ref: '031882', name: 'GARRAFA ISOTERMICA SPORTE N.03 FINO', price: 240.00, category: 'Cozinha' },
  { ref: '031883', name: 'GARRAFA ISOTERMICA SPORTE N.04 FINO', price: 240.00, category: 'Cozinha' },
  { ref: '031884', name: 'GARRAFA ISOTERMICA SPORTE N.05 FINO', price: 240.00, category: 'Cozinha' },
  { ref: '031792', name: 'GARRAFA TERMICA DE LUXO N.01 GROSSO', price: 240.00, category: 'Cozinha' },
  { ref: '031793', name: 'GARRAFA TERMICA DE LUXO N.02 GROSSO', price: 240.00, category: 'Cozinha' },
  { ref: '031794', name: 'GARRAFA TERMICA DE LUXO N.03 GROSSO', price: 240.00, category: 'Cozinha' },
  { ref: '031901', name: 'GARRAFA TERMICA DIGITAL GRANDE', price: 360.00, category: 'Cozinha' },
  { ref: '032156', name: 'GARRAFA TERMICA DIGITAL PEQUENA', price: 180.00, category: 'Cozinha' },
  { ref: '032436', name: 'GRELHA PARA CHURRASCO ALUMINIO BATIDO 36X20', price: 29.00, category: 'Cozinha' },
  { ref: '032435', name: 'GRELHA PARA CHURRASCO ALUMINIO BATIDO 40X23', price: 39.00, category: 'Cozinha' },
  { ref: '031976', name: 'PUNHAL SLK A120 C/BAINHA', price: 149.00, category: 'Ferramentas' },
  { ref: '031971', name: 'PUNHAL SLK A126', price: 110.00, category: 'Ferramentas' },
  { ref: '031977', name: 'PUNHAL SLK A126 C/BAINHA', price: 149.00, category: 'Ferramentas' },
  { ref: '031975', name: 'PUNHAL SLK A82', price: 110.00, category: 'Ferramentas' },
  { ref: '031978', name: 'PUNHAL SLK A82 C/BAINHA', price: 149.00, category: 'Ferramentas' },
  { ref: '032030', name: 'PUNHAL SQ C/METAL', price: 110.00, category: 'Ferramentas' },
  { ref: '032031', name: 'PUNHAL SQ C/METAL C/BAINHA', price: 149.00, category: 'Ferramentas' },
  { ref: '029175', name: 'RALO DE INOX PARA LEGUMES', price: 9.60, category: 'Cozinha' },
  { ref: '032351', name: 'RALO PARA LEGUMES 4 FACES SAQ 2309', price: 11.99, category: 'Cozinha' },
  { ref: '032350', name: 'RALO PARA LEGUMES 4 FACES SAQ 4833', price: 12.40, category: 'Cozinha' },
  { ref: '032352', name: 'RALO PARA LEGUMES 4 FACES SQ 4835', price: 14.96, category: 'Cozinha' },
  { ref: '032349', name: 'RALO PARA LEGUMES SQ 3717', price: 11.90, category: 'Cozinha' },
  { ref: '032112', name: 'RODO 40CM', price: 11.40, category: 'Geral' },
  { ref: '030276', name: 'SACA ROLHA 3 FUNCOES', price: 5.96, category: 'Cozinha' },
  { ref: '032148', name: 'SACA ROLHA COMUN', price: 4.96, category: 'Cozinha' },
  { ref: '030893', name: 'SELO PARA PANELA CLOCK', price: 2.96, category: 'Cozinha' },
  { ref: '030892', name: 'SELO PARA PANELA ROCHEDO', price: 4.69, category: 'Cozinha' },
  { ref: '025704', name: 'TABUA DE CORTA CARNE DE VIDRO 20X30', price: 19.90, category: 'Cozinha' },
  { ref: '025705', name: 'TABUA DE CORTA CARNE DE VIDRO 25X35', price: 24.90, category: 'Cozinha' },
  { ref: '025706', name: 'TABUA DE CORTA CARNE DE VIDRO 28X38', price: 28.80, category: 'Cozinha' },
  { ref: '025707', name: 'TABUA DE CORTA CARNE DE VIDRO 30X40', price: 32.80, category: 'Cozinha' },
  { ref: '032327', name: 'TABUA DE PLASTICO SQ 2030', price: 25.90, category: 'Cozinha' },
  { ref: '032326', name: 'TABUA DE PLASTICO SQ 2854', price: 22.90, category: 'Cozinha' },
  { ref: '032328', name: 'TABUA DE PLASTICO SQ 3463', price: 21.90, category: 'Cozinha' },
  { ref: '032345', name: 'TESOURA PARA FRANGO SL 107', price: 66.00, category: 'Cozinha' },
  { ref: '031868', name: 'PILAO DE MADEIRA MEDIO', price: 21.90, category: 'Cozinha' },
  { ref: '031867', name: 'PILAO DE MADEIRA PEQUENO', price: 18.40, category: 'Cozinha' },
  { ref: '024836', name: 'RATOEIRA TAM.PEQUENO 12X1', price: 7.30, category: 'Geral' },
  { ref: '023536', name: 'RATOEIRA TAM.GRANDE 12X1', price: 8.90, category: 'Geral' },
  { ref: '023538', name: 'REGISTRO PARA GAS YANES', price: 28.90, category: 'Hidráulica' },
  { ref: '032437', name: 'SERROTE PARA FOLDA REF.74005', price: 19.00, category: 'Ferramentas' },
  { ref: '000279', name: 'SORO DE BALADEIRA FINO', price: 55.00, category: 'Geral' },
  { ref: '000003', name: 'SORO DE BALADEIRA GROSSO', price: 79.00, category: 'Geral' },
  { ref: '032297', name: 'TALCO 100GR PRETO', price: 6.00, category: 'Tintura/Cosmético' },
  { ref: '032296', name: 'TALCO 200GR BRANCO', price: 25.00, category: 'Tintura/Cosmético' },
  { ref: '032298', name: 'TALCO 200GR FOX', price: 70.00, category: 'Tintura/Cosmético' },
  { ref: '032033', name: 'TESOURA PREMIO PARA TECIDO', price: 0.00, category: 'Geral' },
  { ref: '032337', name: 'TRAQUE CAIXA', price: 7.16, category: 'Geral' },
  { ref: '000350', name: 'TRENA METRICA 10 METROS LARGA', price: 29.90, category: 'Ferramentas' },
  { ref: '000351', name: 'TRENA METRICA 3 METROS LARGA', price: 9.90, category: 'Ferramentas' },
  { ref: '000352', name: 'TRENA METRICA 5 METROS LARGA', price: 14.90, category: 'Ferramentas' },
  { ref: '032272', name: 'TRENA METRICA 7 METROS LARGA', price: 21.90, category: 'Ferramentas' },
  { ref: '032442', name: 'ALICATE DE BICO GP 4031', price: 16.00, category: 'Ferramentas' },
  { ref: '032443', name: 'ALICATE DE CORTE GP 4029', price: 16.00, category: 'Ferramentas' },
  { ref: '032444', name: 'ALICATE DE PRESSAO HM 453', price: 43.90, category: 'Ferramentas' },
  { ref: '032446', name: 'ALICATE PARA BOMBA DAGUA REF.0101', price: 55.00, category: 'Ferramentas' },
  { ref: '032441', name: 'ALICATE UNIVERSAL HM 215', price: 28.00, category: 'Ferramentas' },
  { ref: '032283', name: 'ANZOL MARINE ESPORTE 100X1', price: 79.00, category: 'Pesca' },
];

const MEDEIROS_V3_PRODUCTS: Omit<Product, 'id' | 'createdAt'>[] = [
  // Pág 0045 - Cozinha / Cutelaria
  { ref: '032316', name: 'PENEIRA DE INOX 18CM SQ 3701', price: 14.90, category: 'Cozinha' },
  { ref: '032317', name: 'PENEIRA DE INOX 20CM SQ 3702', price: 15.90, category: 'Cozinha' },
  { ref: '032311', name: 'PENEIRA DE INOX 22CM SQ 3703', price: 17.90, category: 'Cozinha' },
  { ref: '031871', name: 'PENEIRA PLASTICO SABRISA TAM.GRANDE', price: 7.45, category: 'Cozinha' },
  { ref: '031872', name: 'PENEIRA PLASTICO SABRISA TAM.MEDIA', price: 5.90, category: 'Cozinha' },
  { ref: '031873', name: 'PENEIRA PLASTICO SABRISA TAM.PEQUENA', price: 3.90, category: 'Cozinha' },
  { ref: '030890', name: 'PESO PARA PANELA COLORIDO', price: 4.65, category: 'Cozinha' },
  { ref: '030891', name: 'PESO PARA PANELA CROMADO', price: 6.69, category: 'Cozinha' },
  { ref: '032413', name: 'PESO PARA PANELA GRANDE', price: 7.90, category: 'Cozinha' },
  { ref: '032432', name: 'PILAO DE ALUMINIO GRANDE', price: 23.90, category: 'Cozinha' },
  { ref: '032236', name: 'PINCEL DE SILICONE SQ 4162', price: 11.90, category: 'Cozinha' },
  { ref: '032353', name: 'PLAINA PARA QUEIJO SQ 3976', price: 25.90, category: 'Cozinha' },
  { ref: '032244', name: 'PRATO ESCOLAR REF 1026', price: 3.67, category: 'Cozinha' },
  { ref: '032114', name: 'PRATO QUADRADO', price: 3.90, category: 'Cozinha' },
  { ref: '032113', name: 'PRATO REDONDO', price: 3.55, category: 'Cozinha' },
  { ref: '031797', name: 'PROCESSADOR DE ALIMENTOS SQ', price: 47.90, category: 'Cozinha' },
  { ref: '032145', name: 'PROTETOR DE ALIMENTOS 27CM', price: 19.90, category: 'Cozinha' },
  { ref: '032146', name: 'PROTETOR DE ALIMENTOS 30CM', price: 22.90, category: 'Cozinha' },
  { ref: '032147', name: 'PROTETOR DE ALIMENTOS 35CM', price: 28.40, category: 'Cozinha' },
  { ref: '028986', name: 'PUNHAL IDEA C/BAINHA', price: 8.90, category: 'Cutelaria' },
  { ref: '032028', name: 'PUNHAL SLK A 118', price: 110.00, category: 'Cutelaria' },
  { ref: '032029', name: 'PUNHAL SLK A 118 C/BAINHA', price: 149.00, category: 'Cutelaria' },
  { ref: '032026', name: 'PUNHAL SLK A 78', price: 110.00, category: 'Cutelaria' },
  { ref: '032027', name: 'PUNHAL SLK A 78 C/BAINHA', price: 149.00, category: 'Cutelaria' },
  { ref: '031970', name: 'PUNHAL SLK A120', price: 110.00, category: 'Cutelaria' },
  // Pág 0023 - Medicamentos / Xaropes
  { ref: '032218', name: 'SIMETICONA ANTIGASES', price: 6.00, category: 'Medicamentos' },
  { ref: '019689', name: 'SONRISAL COMPRIMIDO 60X1', price: 96.00, category: 'Medicamentos' },
  { ref: '031645', name: 'SULFATO FERROSO 50X1', price: 6.90, category: 'Medicamentos' },
  { ref: '024069', name: 'SULFERBEL OU SULFATO FERROSO 100ML', price: 6.96, category: 'Medicamentos' },
  { ref: '000177', name: 'TANDENE COMPRIMIDO 30X1', price: 17.00, category: 'Medicamentos' },
  { ref: '000164', name: 'TETRACICLINA 300X1', price: 298.00, category: 'Medicamentos' },
  { ref: '023763', name: 'TETRACICLINA COMPRIMIDO 100X1', price: 96.00, category: 'Medicamentos' },
  { ref: '031209', name: 'TODELAFILA COMPRIMIDO 4X1', price: 6.90, category: 'Medicamentos' },
  { ref: '032158', name: 'TORCILAX COMPRIMIDO 200X1', price: 105.00, category: 'Medicamentos' },
  { ref: '025565', name: 'TORSILAX 100X1', price: 54.00, category: 'Medicamentos' },
  { ref: '024638', name: 'TOUCA DESCARTAVEL 100X1', price: 38.00, category: 'Medicamentos' },
  { ref: '032268', name: 'VITAMINA C EFERVECENTE', price: 9.90, category: 'Medicamentos' },
  { ref: '031638', name: 'XANTINON COMPRIMIDO 100X1', price: 48.00, category: 'Medicamentos' },
  { ref: '030961', name: 'XAROPE COM HORTELAN 200ML', price: 5.39, category: 'Medicamentos' },
  { ref: '030964', name: 'XAROPE COM RUMAN 200ML', price: 5.39, category: 'Medicamentos' },
  { ref: '030962', name: 'XAROPE COM VICK 200ML', price: 5.39, category: 'Medicamentos' },
  { ref: '030966', name: 'XAROPE COMPOSTO AGRIAO CEBOLA BCA GENGIBRE', price: 8.90, category: 'Medicamentos' },
  { ref: '021108', name: 'XAROPE COMPOSTO BABOSA/AROEIRA/AMEIXA 300ML', price: 8.89, category: 'Medicamentos' },
  { ref: '030968', name: 'XAROPE COMPOSTO FORTE BRAVO 300ML', price: 8.90, category: 'Medicamentos' },
  { ref: '030967', name: 'XAROPE COMPOSTO HORTELAN COM MALVA 300ML', price: 8.90, category: 'Medicamentos' },
  { ref: '030965', name: 'XAROPE COMPOSTO LIMAO E ALHO 300ML', price: 8.90, category: 'Medicamentos' },
  { ref: '030960', name: 'XAROPE CURA GRIPE 220ML', price: 5.90, category: 'Medicamentos' },
  { ref: '030957', name: 'XAROPE DE EUCALIPTO 220ML', price: 5.90, category: 'Medicamentos' },
  { ref: '031739', name: 'XAROPE DEXAMETASONA', price: 10.00, category: 'Medicamentos' },
  // Pág 0037 - Bacia / Bainha
  { ref: '032117', name: 'BACIA SILICONE 25CM', price: 8.96, category: 'Cozinha' },
  { ref: '032118', name: 'BACIA SILICONE 30CM', price: 11.96, category: 'Cozinha' },
  { ref: '032119', name: 'BACIA SILICONE 33CM', price: 12.70, category: 'Cozinha' },
  { ref: '032120', name: 'BACIA SILICONE 37CM', price: 16.80, category: 'Cozinha' },
  { ref: '000185', name: 'BAINHA P/FACA SQ N.07 POLEGADA', price: 14.00, category: 'Cutelaria' },
  { ref: '000186', name: 'BAINHA P/FACA SQ N.08 POLEGADA', price: 15.00, category: 'Cutelaria' },
  { ref: '032211', name: 'BAINHA PARA CANIVETE CAPA GARROTE', price: 29.00, category: 'Cutelaria' },
  { ref: '032134', name: 'BAINHA PARA FACA N.05', price: 12.00, category: 'Cutelaria' },
  { ref: '032135', name: 'BAINHA PARA FACA N.06', price: 12.00, category: 'Cutelaria' },
  { ref: '032136', name: 'BAINHA PARA FACA N.07', price: 14.00, category: 'Cutelaria' },
  { ref: '032137', name: 'BAINHA PARA FACA N.08', price: 15.00, category: 'Cutelaria' },
  { ref: '032138', name: 'BAINHA PARA FACA N.09', price: 17.00, category: 'Cutelaria' },
  { ref: '032139', name: 'BAINHA PARA FACA N.10', price: 18.00, category: 'Cutelaria' },
  { ref: '032140', name: 'BAINHA PARA FACA N.12', price: 25.00, category: 'Cutelaria' },
  { ref: '000089', name: 'BAINHA PARA FACA SQ N.05 POLEGADA', price: 12.00, category: 'Cutelaria' },
  { ref: '030860', name: 'BAINHA PARA FACAO MONALIZA PONTA RETA 10 POL', price: 34.00, category: 'Cutelaria' },
  { ref: '031699', name: 'BAINHA PARA FACAO MONALIZA PONTA RETA 12 POL', price: 34.00, category: 'Cutelaria' },
  { ref: '022656', name: 'BAINHA PARA FACAO MONALIZA PONTA RETA 14 POL', price: 30.00, category: 'Cutelaria' },
  { ref: '022657', name: 'BAINHA PARA FACAO MONALIZA PONTA RETA 16 POL', price: 34.00, category: 'Cutelaria' },
  { ref: '022658', name: 'BAINHA PARA FACAO MONALIZA PONTA RETA 18 POL', price: 30.00, category: 'Cutelaria' },
  { ref: '022659', name: 'BAINHA PARA FACAO MONALIZA PONTA RETA 20 POL', price: 34.00, category: 'Cutelaria' },
  { ref: '030770', name: 'BAINHA PARA FACAO MONALIZA PONTA RETA 22 POL', price: 34.00, category: 'Cutelaria' },
  { ref: '030863', name: 'BAINHA PARA FACAO MONALIZA PONTA VIRADA 10 POL', price: 34.00, category: 'Cutelaria' },
  { ref: '030865', name: 'BAINHA PARA FACAO MONALIZA PONTA VIRADA 12 POL', price: 34.00, category: 'Cutelaria' },
  { ref: '023783', name: 'BAINHA PARA FACAO MONALIZA PONTA VIRADA 14 POL', price: 34.00, category: 'Cutelaria' },
  // Pág 0027
  { ref: '020130', name: 'CORRENTE PARA CACHORRO N.06', price: 8.96, category: 'Geral' },
  { ref: '020131', name: 'CORRENTE PARA CACHORRO N.07', price: 7.69, category: 'Geral' },
  { ref: '000233', name: 'ESPORA DE FERRO 12X1', price: 245.00, category: 'Geral' },
  { ref: '032338', name: 'ESTALO CAIXA', price: 4.00, category: 'Geral' },
  { ref: '000244', name: 'FECHADURA 2 VOLTA C/PARAFUSO 12X1', price: 16.90, category: 'Ferramentas' },
  { ref: '032277', name: 'KIT DE CHAVE CATRACA SQ 4399', price: 39.00, category: 'Ferramentas' },
  { ref: '000253', name: 'LAMPARINA GRANDE DE ZINCO 12X1', price: 16.00, category: 'Geral' },
  { ref: '000254', name: 'LAMPARINA PEQUENA DE ZINCO 12X1', price: 14.00, category: 'Geral' },
  { ref: '000338', name: 'LINHA P/PESCA CAICARA N.50', price: 9.90, category: 'Pesca' },
  { ref: '000339', name: 'LINHA P/PESCA CAICARA N.60', price: 12.90, category: 'Pesca' },
  { ref: '000340', name: 'LINHA P/PESCA CAICARA N.70', price: 16.90, category: 'Pesca' },
  { ref: '000341', name: 'LINHA P/PESCA CAICARA N.80', price: 19.90, category: 'Pesca' },
  { ref: '031202', name: 'LINHA P/PESCA CAICARA N.90', price: 22.90, category: 'Pesca' },
  { ref: '032080', name: 'PAR DE LIXO DE ZINCO CABO 30CM', price: 9.90, category: 'Geral' },
  { ref: '032081', name: 'PAR DE LIXO DE ZINCO CABO 60CM', price: 10.98, category: 'Geral' },
  { ref: '032074', name: 'PAR DE LIXO PLASTICO CABO 85CM', price: 6.96, category: 'Geral' },
  { ref: '030850', name: 'PEITORAL PARA CAO Nº05', price: 21.90, category: 'Geral' },
  { ref: '030851', name: 'PEITORAL PARA CAO Nº06', price: 29.00, category: 'Geral' },
  { ref: '030852', name: 'PEITORAL PARA CAO Nº07', price: 31.90, category: 'Geral' },
  { ref: '023765', name: 'PEITORAL PARA CAO Nº1', price: 14.96, category: 'Geral' },
  { ref: '023766', name: 'PEITORAL PARA CAO Nº2', price: 15.96, category: 'Geral' },
  { ref: '023767', name: 'PEITORAL PARA CAO Nº3', price: 16.96, category: 'Geral' },
  { ref: '023768', name: 'PEITORAL PARA CAO Nº4', price: 19.96, category: 'Geral' },
  { ref: '031637', name: 'PILAO DE ALUMINIO MEDIO', price: 21.90, category: 'Cozinha' },
  { ref: '031636', name: 'PILAO DE ALUMINIO PEQUENO', price: 19.60, category: 'Cozinha' },
  // Pág 0029
  { ref: '032439', name: 'ARCO DE SERRA REF.44001', price: 19.90, category: 'Ferramentas' },
  { ref: '032332', name: 'CADEADO PARA BICICLETA SQ 1719', price: 13.90, category: 'Ferramentas' },
  { ref: '032440', name: 'CADEADO PARA MOTO REF.34004', price: 39.90, category: 'Ferramentas' },
  { ref: '032457', name: 'CALCULADORA A BATERIA CRS 185A', price: 25.00, category: 'Geral' },
  { ref: '032459', name: 'CALCULADORA A BATERIA CRS 268A', price: 25.00, category: 'Geral' },
  { ref: '032456', name: 'CALCULADORA A BATERIA CRS 800A', price: 25.00, category: 'Geral' },
  { ref: '032462', name: 'CALCULADORA A PILHA CRS 2155', price: 25.00, category: 'Geral' },
  { ref: '032458', name: 'CALCULADORA A PILHA CRS 3122A', price: 25.00, category: 'Geral' },
  { ref: '032463', name: 'CALCULADORA A PILHA CRS 3851', price: 25.00, category: 'Geral' },
  { ref: '032455', name: 'CALCULADORA A PILHA CRS 3871B', price: 25.00, category: 'Geral' },
  { ref: '032461', name: 'CALCULADORA A PILHA CRS 65137', price: 25.00, category: 'Geral' },
  { ref: '032464', name: 'CALCULADORA A PILHA CRS 837C', price: 25.00, category: 'Geral' },
  { ref: '032465', name: 'CALCULADORA A PILHA CRS 9136B', price: 25.00, category: 'Geral' },
  { ref: '032460', name: 'CALCULADORA A PILHA CRS 9838A', price: 25.00, category: 'Geral' },
  { ref: '031210', name: 'CHUMBADA PARA ANZOL N.0KG', price: 86.00, category: 'Pesca' },
  { ref: '031211', name: 'CHUMBADA PARA ANZOL N.1KG', price: 69.00, category: 'Pesca' },
  { ref: '031212', name: 'CHUMBADA PARA ANZOL N.2KG', price: 69.00, category: 'Pesca' },
  { ref: '031213', name: 'CHUMBADA PARA ANZOL N.3KG', price: 69.00, category: 'Pesca' },
  { ref: '031214', name: 'CHUMBADA PARA ANZOL N.4KG', price: 69.00, category: 'Pesca' },
  { ref: '031215', name: 'CHUMBADA PARA ANZOL N.5KG', price: 69.00, category: 'Pesca' },
  { ref: '031216', name: 'CHUMBADA PARA ANZOL N.7KG', price: 69.00, category: 'Pesca' },
  { ref: '032438', name: 'ESGUINCHO PARA MANGUEIRA ID070315', price: 23.90, category: 'Geral' },
  { ref: '030935', name: 'ESTROVO PARA ANZOL 100X1 N.03', price: 62.00, category: 'Pesca' },
  { ref: '030936', name: 'ESTROVO PARA ANZOL 100X1 N.05', price: 62.00, category: 'Pesca' },
  { ref: '030937', name: 'ESTROVO PARA ANZOL 100X1 N.07', price: 69.90, category: 'Pesca' },
  // Pág 0031 - Lanternas
  { ref: '029091', name: 'LANTERNA LED A PILHA C.M 1601', price: 15.90, category: 'Geral' },
  { ref: '031686', name: 'LANTERNA LED A PILHA C.M 1602', price: 14.90, category: 'Geral' },
  { ref: '030846', name: 'LANTERNA LED A PILHA COLORIDA', price: 17.90, category: 'Geral' },
  { ref: '030516', name: 'LANTERNA LED A PILHA METAL', price: 17.96, category: 'Geral' },
  { ref: '032412', name: 'LANTERNA LED A PILHA METAL C/GRANDE', price: 17.90, category: 'Geral' },
  { ref: '030722', name: 'LANTERNA LED A PILHA PRETA', price: 17.96, category: 'Geral' },
  { ref: '031264', name: 'LANTERNA LED A PILHA REF.189', price: 17.90, category: 'Geral' },
  { ref: '031969', name: 'LANTERNA LUA TEK LT 436', price: 196.00, category: 'Geral' },
  { ref: '032153', name: 'LANTERNA MAGLITE 2 ELEMENTO', price: 198.00, category: 'Geral' },
  { ref: '030571', name: 'LANTERNA MAX REF.1001', price: 52.00, category: 'Geral' },
  { ref: '030853', name: 'LANTERNA MAX REF.1906', price: 27.60, category: 'Geral' },
  { ref: '030849', name: 'LANTERNA MEGA NAGHT CAMUFLADA', price: 89.00, category: 'Geral' },
  { ref: '023806', name: 'LANTERNA PARA CABECA SQ ELETRICA', price: 48.00, category: 'Geral' },
  { ref: '032087', name: 'LANTERNA PARA MERGULHO MANUAL', price: 38.90, category: 'Geral' },
  { ref: '031798', name: 'LANTERNA SILINBRIN CAIRUS 3252', price: 139.00, category: 'Geral' },
  { ref: '032488', name: 'LANTERNA SQ 4541', price: 155.00, category: 'Geral' },
  { ref: '032449', name: 'LIMA PARA ENCHADA STARTOOS 0222', price: 18.60, category: 'Ferramentas' },
  { ref: '031203', name: 'LINHA P/PESCA CAICARA N.100', price: 26.90, category: 'Pesca' },
  { ref: '031200', name: 'LINHA P/PESCA CAICARA N.20', price: 4.60, category: 'Pesca' },
  { ref: '000335', name: 'LINHA P/PESCA CAICARA N.25', price: 4.90, category: 'Pesca' },
  { ref: '000336', name: 'LINHA P/PESCA CAICARA N.30', price: 5.60, category: 'Pesca' },
  { ref: '031201', name: 'LINHA P/PESCA CAICARA N.35', price: 6.56, category: 'Pesca' },
  { ref: '000337', name: 'LINHA P/PESCA CAICARA N.40', price: 6.90, category: 'Pesca' },
  { ref: '030049', name: 'LINHA P/PESCA CAICARA N.45', price: 7.16, category: 'Pesca' },
  { ref: '032451', name: 'MASSARICO GRANDE CRS 2547', price: 39.80, category: 'Ferramentas' },
  // Pág 0022 - Medicamentos
  { ref: '000163', name: 'OMEPRAZOL 28X1', price: 6.89, category: 'Medicamentos' },
  { ref: '000165', name: 'PARACETAMOL COMPRIMIDO 200X1', price: 91.00, category: 'Medicamentos' },
  { ref: '000166', name: 'PARACETAMOL EM GOTAS 10ML', price: 7.60, category: 'Medicamentos' },
  { ref: '020407', name: 'PETIVIT B+C VITAMINA', price: 12.00, category: 'Medicamentos' },
  { ref: '000168', name: 'PILULA CONTRA ESTUPOR LAFARMA', price: 14.00, category: 'Medicamentos' },
  { ref: '000169', name: 'PILULA CONTRA JALAPIAO LAFARMA', price: 14.00, category: 'Medicamentos' },
  { ref: '032104', name: 'PILULA DE CRIOLINA', price: 6.00, category: 'Medicamentos' },
  { ref: '000170', name: 'PILULA QUATRO HUMORES LAFARMA', price: 14.00, category: 'Medicamentos' },
  { ref: '000171', name: 'PIROXICAN COMPRIMIDO 15X1', price: 7.90, category: 'Medicamentos' },
  { ref: '000172', name: 'POMADA BETACORTAZOL COCEIRA 30GR', price: 11.00, category: 'Medicamentos' },
  { ref: '032309', name: 'POMADA CANELA DE VELHO BISNAGA', price: 12.00, category: 'Medicamentos' },
  { ref: '024640', name: 'POMADA DE ALEGRIN 150ML', price: 15.00, category: 'Medicamentos' },
  { ref: '000173', name: 'PRAMIL COMPRIMIDO 20X1', price: 39.80, category: 'Medicamentos' },
  { ref: '000174', name: 'PRESERVATIVO PROSEX 3X1', price: 3.19, category: 'Medicamentos' },
  { ref: '023539', name: 'REGISTRO PARA GAS YANES C/MANGUEIRA', price: 39.90, category: 'Geral' },
  { ref: '019693', name: 'REMALZIN COMPRIMIDO 20X1', price: 30.00, category: 'Medicamentos' },
  { ref: '031012', name: 'REPELENTE XO INSETO SPREY', price: 19.90, category: 'Medicamentos' },
  { ref: '020521', name: 'RIFORTRATE', price: 19.90, category: 'Medicamentos' },
  { ref: '026297', name: 'RUAN EM PO 10X1', price: 10.00, category: 'Medicamentos' },
  { ref: '000175', name: 'SABONETE DE AROEIRA 90GR', price: 3.48, category: 'Medicamentos' },
  { ref: '031662', name: 'SAL AMARGO', price: 6.99, category: 'Medicamentos' },
  { ref: '020111', name: 'SAL DE ANDREWS 60X1', price: 126.00, category: 'Medicamentos' },
  { ref: '020801', name: 'SAL DE ENO 60X1', price: 114.00, category: 'Medicamentos' },
  { ref: '031226', name: 'SAL DE FRUTAS 60X1', price: 64.00, category: 'Medicamentos' },
  { ref: '020808', name: 'SAUDE DA MULHER 300ML', price: 68.00, category: 'Medicamentos' },
  // Pág 0048 - Sorvetes
  { ref: '030301', name: 'ESPALHADOR CONTINENTAL VILAGE PEQUENO C.06', price: 2.96, category: 'Geral' },
  { ref: '030307', name: 'ESPALHADOR ESMALTEC BALI GRANDE C.80', price: 3.75, category: 'Geral' },
  { ref: '030309', name: 'ESPALHADOR ESMALTEC BALI PEQUENO C.1440', price: 2.69, category: 'Geral' },
  { ref: '030310', name: 'SORVETE ATLAS GRANDE C 240', price: 3.69, category: 'Geral' },
  { ref: '030312', name: 'SORVETE ATLAS PEQUENO C.239', price: 3.52, category: 'Geral' },
  { ref: '030318', name: 'SORVETE CANOA GRANDE C.242', price: 4.69, category: 'Geral' },
  { ref: '030319', name: 'SORVETE CANOA PEQUENO C.241', price: 3.78, category: 'Geral' },
  { ref: '030320', name: 'SORVETE CONSUL CANO LONGO GRANDE C.497', price: 4.90, category: 'Geral' },
  { ref: '030321', name: 'SORVETE CONSUL CANO LONGO PEQUENO C.582', price: 3.79, category: 'Geral' },
  { ref: '030322', name: 'SORVETE CONSUL ESENCIAL GRANDE C.859', price: 4.53, category: 'Geral' },
  { ref: '030323', name: 'SORVETE CONSUL ESENCIAL PEQUENO C.858', price: 3.79, category: 'Geral' },
  { ref: '030324', name: 'SORVETE CONSUL GRANDE C.15', price: 4.50, category: 'Geral' },
  { ref: '030325', name: 'SORVETE CONSUL PEQUENO C.14', price: 3.69, category: 'Geral' },
  { ref: '030298', name: 'SORVETE CONTINENTAL VILAGE GRANDE C.05', price: 4.75, category: 'Geral' },
  { ref: '030300', name: 'SORVETE CONTINENTAL VILAGE PEQUENO C.06', price: 4.48, category: 'Geral' },
  { ref: '030306', name: 'SORVETE ESMALTEC BALI GRANDE C.909', price: 4.36, category: 'Geral' },
  { ref: '030308', name: 'SORVETE ESMALTEC BALI PEQUENO C.910', price: 3.90, category: 'Geral' },
  { ref: '030302', name: 'SORVETE IBIZA GRANDE C.244', price: 4.18, category: 'Geral' },
  { ref: '030304', name: 'SORVETE IBIZA PEQUENA C.243', price: 3.71, category: 'Geral' },
  { ref: '030316', name: 'SORVETE MONTRIAL GRAMDE C.580', price: 4.68, category: 'Geral' },
  { ref: '030317', name: 'SORVETE MONTRIAL PEQUENO C.581', price: 3.94, category: 'Geral' },
  { ref: '030314', name: 'SORVETE XINGU GRANDE C.08', price: 4.79, category: 'Geral' },
  { ref: '030315', name: 'SORVETE XINGU PEQUENO C.07', price: 3.75, category: 'Geral' },
  // Pág 0033 - Encanamento / Lâmpadas / Luvas
  { ref: '032039', name: 'JOELHO COM ROSCA 25MM 30X1', price: 5.50, category: 'Geral' },
  { ref: '032036', name: 'JOELHO DE ESGOTO 40MM 50X1', price: 1.98, category: 'Geral' },
  { ref: '032037', name: 'JOELHO DE ESGOTO 50MM 25X1', price: 3.96, category: 'Geral' },
  { ref: '032040', name: 'JOELHO SOLDAVEL 20MM 50X1', price: 0.88, category: 'Geral' },
  { ref: '032041', name: 'JOELHO SOLDAVEL 25MM 50X1', price: 1.21, category: 'Geral' },
  { ref: '032000', name: 'LAMPADA FLORECENTE MAX 15W', price: 11.90, category: 'Geral' },
  { ref: '032001', name: 'LAMPADA FLORECENTE MAX 20W', price: 14.90, category: 'Geral' },
  { ref: '032002', name: 'LAMPADA FLORECENTE MAX 25W', price: 16.40, category: 'Geral' },
  { ref: '032078', name: 'LAMPADA LED 12W ELGIN', price: 10.90, category: 'Geral' },
  { ref: '032077', name: 'LAMPADA LED 9W ELGIN', price: 6.49, category: 'Geral' },
  { ref: '032047', name: 'LUVA COM ROSCA 20MM 50X1', price: 2.49, category: 'Geral' },
  { ref: '032048', name: 'LUVA COM ROSCA 25MM 50X1', price: 2.97, category: 'Geral' },
  { ref: '032042', name: 'LUVA DE ESGOTO 40MM 25X1', price: 2.42, category: 'Geral' },
  { ref: '032043', name: 'LUVA DE ESGOTO 50MM 25X1', price: 5.50, category: 'Geral' },
  { ref: '032044', name: 'LUVA DE REDUCAO SOLDAVEL 25X20MM 50X1', price: 2.42, category: 'Geral' },
  { ref: '032046', name: 'LUVA DE REDUCAO SOLDAVEL 32X25MM 20X1', price: 5.72, category: 'Geral' },
  { ref: '032072', name: 'LUVA PIGIMENTADA BRANCA', price: 5.96, category: 'Geral' },
  { ref: '032071', name: 'LUVA PIGIMENTADA PRETA', price: 5.96, category: 'Geral' },
  { ref: '032354', name: 'LUVA PIGIMENTADA VERDE', price: 6.90, category: 'Geral' },
  { ref: '032049', name: 'LUVA SOLDAVEL 20MM 50X1', price: 0.99, category: 'Geral' },
  { ref: '032050', name: 'LUVA SOLDAVEL 25MM 50X1', price: 1.10, category: 'Geral' },
  { ref: '032054', name: 'MASSA EPOX 100GRA 12X1', price: 9.80, category: 'Geral' },
  { ref: '032053', name: 'MASSA EPOX 50 GRA 12X1', price: 6.80, category: 'Geral' },
  { ref: '031870', name: 'OCULOS DE PROTECAO FUME', price: 8.90, category: 'Ferramentas' },
  // Pág 0044 - Churrasco / Cozinha
  { ref: '032426', name: 'GRELHA PARA CHURRASCO CRS 2313', price: 24.90, category: 'Cozinha' },
  { ref: '032427', name: 'GRELHA PARA CHURRASCO CRS 2314', price: 26.90, category: 'Cozinha' },
  { ref: '032428', name: 'GRELHA PARA CHURRASCO CRS 2316', price: 36.99, category: 'Cozinha' },
  { ref: '032429', name: 'GRELHA PARA CHURRASCO CRS 2317', price: 42.90, category: 'Cozinha' },
  { ref: '032434', name: 'GRELHA PARA CHURRASCO GALVANIZADA 30X20', price: 39.00, category: 'Cozinha' },
  { ref: '032433', name: 'GRELHA PARA CHURRASCO GALVANIZADA 40X23', price: 47.00, category: 'Cozinha' },
  { ref: '032347', name: 'KIT DE CHURRASCO 2 PECAS SQ 4259', price: 25.60, category: 'Cozinha' },
  { ref: '032348', name: 'KIT DE CHURRASCO 3 PECAS SQ 4258', price: 39.80, category: 'Cozinha' },
  { ref: '030140', name: 'KIT DE COLHER DE INOX 6X1 REF 3455', price: 23.60, category: 'Cozinha' },
  { ref: '030142', name: 'KIT DE FACA DE INOX 6X1 REF 3457', price: 23.60, category: 'Cozinha' },
  { ref: '030141', name: 'KIT DE GARFO DE INOX 6X1 REF 3456', price: 23.60, category: 'Cozinha' },
  { ref: '022468', name: 'PEDRA DE AFIAR CANOA', price: 5.80, category: 'Cutelaria' },
  { ref: '024851', name: 'PEDRA DE AFIAR MODELO QUADRADA', price: 5.80, category: 'Cutelaria' },
  { ref: '024965', name: 'PEGADOR DE MACARRAO', price: 6.80, category: 'Cozinha' },
  { ref: '032300', name: 'PENEIRA C/ABAS DE PLASTICO 20CM', price: 9.80, category: 'Cozinha' },
  { ref: '032301', name: 'PENEIRA C/ABAS DE PLASTICO 22CM', price: 10.90, category: 'Cozinha' },
  { ref: '032302', name: 'PENEIRA C/ABAS DE PLASTICO 25CM', price: 11.90, category: 'Cozinha' },
  { ref: '032260', name: 'PENEIRA CABO MADEIRA 20CM', price: 46.00, category: 'Cozinha' },
  { ref: '032262', name: 'PENEIRA CABO MADEIRA 24CM', price: 52.00, category: 'Cozinha' },
  { ref: '032261', name: 'PENEIRA CABO MADEIRA FUNDA 18CM', price: 48.00, category: 'Cozinha' },
  { ref: '032263', name: 'PENEIRA CABO MADEIRA FUNDA 20CM', price: 54.00, category: 'Cozinha' },
  { ref: '032312', name: 'PENEIRA DE INOX 10CM SQ 3697', price: 5.90, category: 'Cozinha' },
  { ref: '032313', name: 'PENEIRA DE INOX 12CM SQ 3698', price: 6.90, category: 'Cozinha' },
  { ref: '032314', name: 'PENEIRA DE INOX 14CM SQ 3699', price: 9.60, category: 'Cozinha' },
  { ref: '032315', name: 'PENEIRA DE INOX 16CM SQ 3700', price: 11.60, category: 'Cozinha' },
];

const MEDEIROS_V4_PRODUCTS: Omit<Product, 'id' | 'createdAt'>[] = [
  // Pág 0032
  { ref: '032450', name: 'MASSARICO PEQUENO REF.0389', price: 35.90, category: 'Ferramentas' },
  { ref: '032452', name: 'PRUMO DE PAREDE REF.2704', price: 62.90, category: 'Ferramentas' },
  { ref: '032445', name: 'REBITADOR MANUAL SQ 3309', price: 35.00, category: 'Ferramentas' },
  { ref: '000319', name: 'SUPORTE PARA LANTERNA', price: 5.96, category: 'Ferramentas' },
  { ref: '032447', name: 'TURQUESA HM 451', price: 19.99, category: 'Ferramentas' },
  { ref: '032190', name: 'BARBANTE PARA CUSTURA SACO 100X1', price: 9.90, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032065', name: 'BOCAL C/RABICHO', price: 3.78, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032073', name: 'BOCAL PARA TESTE', price: 5.50, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032066', name: 'BOCAL S/RABICHO', price: 3.58, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032084', name: 'CAPS SOLDAVEL 20MM 50X1', price: 1.41, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032085', name: 'CHUVEIRO COM REGISTRO', price: 11.60, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032086', name: 'CHUVEIRO SEM REGISTRO', price: 9.90, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032034', name: 'COLA PARA CANO 17 GR 48X1', price: 3.74, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032035', name: 'CURVA 90GR 20MM X20X1', price: 4.40, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032068', name: 'DIJUNTOR 15 AMPERES', price: 12.90, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032069', name: 'DIJUNTOR 20 AMPERES', price: 14.90, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032070', name: 'DIJUNTOR 25 AMPERES', price: 16.90, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032189', name: 'FETILHO ROLO', price: 8.90, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032064', name: 'FITA ISOLANTE 10X1', price: 22.00, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032063', name: 'FITA ISOLANTE COLORIDA 10X1', price: 26.00, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '023574', name: 'FITA ISOLANTE COLORIDA 19MMX54 POTE 50X1', price: 2.19, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032007', name: 'INTERRUPTOR COMUM CX 50X1', price: 5.80, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032038', name: 'JOELHO COM ROSCA 20MM 30X1', price: 3.52, category: 'Mat. Eletrico/Hidraulico' },
  // Pág 0034
  { ref: '031869', name: 'OCULOS DE PROTECAO TRANSPARENTE', price: 7.90, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032067', name: 'PERA MEIO FIO', price: 5.60, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032056', name: 'PINO FEMIA 2P+T', price: 4.62, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032058', name: 'PINO FEMIA 50X1', price: 3.40, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032055', name: 'PINO MACHO 2P+T', price: 4.62, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032057', name: 'PINO MACHO 50X1', price: 3.40, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032059', name: 'REGISTRO DE ESFERA SOLDAVEL 20MM 10X1', price: 8.78, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032060', name: 'REGISTRO DE ESFERA SOLDAVEL 25MM 10X1', price: 10.78, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032061', name: 'REGISTRO DE PRESSAO 20MM 12X1', price: 8.87, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032062', name: 'TAMPA PARA PIA 100X1', price: 0.59, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032017', name: 'TER COM ROSCA 20MMX20X1', price: 5.72, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032018', name: 'TER COM ROSCA 25MMX20X1', price: 6.93, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032013', name: 'TER DE ESGOTO 40MMX25X1', price: 4.62, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032014', name: 'TER DE ESGOTO 50MMX25X1', price: 11.65, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032009', name: 'TER ELETRICO COLORIDO CX 50X1', price: 4.90, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032008', name: 'TER ELETRICO CUBO CX 50X1', price: 5.90, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032003', name: 'TER ELETRICO LUSTER 2P+T 50X1', price: 6.96, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032004', name: 'TER ELETRICO LUSTER CX 50X1', price: 5.40, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032015', name: 'TER SOLDAVEL 20MMX50X1', price: 1.54, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032016', name: 'TER SOLDAVEL 25MMX50X1', price: 1.98, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032082', name: 'TESOURA PREMIO PARA CABELO 7', price: 10.96, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032006', name: 'TOMADA COMUM CX 50X1', price: 3.96, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032005', name: 'TOMADA DE SOBREPOR LUSTER 60X1', price: 4.80, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032025', name: 'TORNEIRA ALAVANCA 12X1', price: 8.59, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032023', name: 'TORNEIRA CURTA 12X1', price: 4.35, category: 'Mat. Eletrico/Hidraulico' },
  // Pág 0035
  { ref: '032024', name: 'TORNEIRA LONGA 12X1', price: 4.79, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032020', name: 'TORNEIRA PARA CHUVEIRO 12X1', price: 7.57, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032021', name: 'TORNEIRA PARA FILTRO C/CHAVE', price: 4.95, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032022', name: 'TORNEIRA PARA FILTRO C/PRESSAO', price: 5.45, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032276', name: 'TORNEIRA PARA JARDIM COR PRETA', price: 3.90, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032271', name: 'VEDA ROSCA 10 METROS', price: 2.99, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032270', name: 'VEDA ROSCA 5 METROS', price: 1.99, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '000024', name: 'APONTADOR SIMPLES 12X1', price: 9.40, category: 'Material Escolar' },
  { ref: '023946', name: 'BORRACHA PONTEIRA 100X1', price: 31.00, category: 'Material Escolar' },
  { ref: '000093', name: 'LAPIS C/TABUADA 144X1', price: 79.00, category: 'Material Escolar' },
  { ref: '031262', name: 'LAPIS PRETO 144X1', price: 69.00, category: 'Material Escolar' },
  { ref: '032284', name: 'LAPIS VERDE 72X1', price: 41.90, category: 'Material Escolar' },
  { ref: '000111', name: 'REGUA ESCOLAR 25X1 COLORIDA', price: 17.40, category: 'Material Escolar' },
  { ref: '000110', name: 'REGUA ESCOLAR 25X1 CRISTAL', price: 17.40, category: 'Material Escolar' },
  { ref: '025776', name: 'TESOURA PARA PAPEL 12X1', price: 11.80, category: 'Material Escolar' },
  { ref: '023733', name: 'BATERIA PARA CELULAR LG', price: 19.90, category: 'Acessorio Eletronico' },
  { ref: '023732', name: 'BATERIA PARA CELULAR MOTOROLA', price: 19.90, category: 'Acessorio Eletronico' },
  { ref: '023731', name: 'BATERIA PARA CELULAR NOKIA', price: 19.90, category: 'Acessorio Eletronico' },
  { ref: '023734', name: 'BATERIA PARA CELULAR SANSUNG', price: 19.90, category: 'Acessorio Eletronico' },
  { ref: '023735', name: 'BATERIA PARA CELULAR SORTIDO', price: 19.90, category: 'Acessorio Eletronico' },
  { ref: '025057', name: 'BATERIA PARA LANTERNA DA POLICIA', price: 14.90, category: 'Acessorio Eletronico' },
  // Pág 0036
  { ref: '023741', name: 'CARREGADOR UNIVERSAL PARA BATERIA P/CELULAR', price: 9.90, category: 'Acessorio Eletronico' },
  { ref: '023804', name: 'CARTAO DE MEMORIA 4GB', price: 26.00, category: 'Acessorio Eletronico' },
  { ref: '023748', name: 'CONTROLE PARA RECEPTOR CENTURE', price: 8.40, category: 'Acessorio Eletronico' },
  { ref: '023749', name: 'CONTROLE PARA RECEPTOR HOT SAT', price: 8.40, category: 'Acessorio Eletronico' },
  { ref: '023751', name: 'CONTROLE PARA TV CCE', price: 5.90, category: 'Acessorio Eletronico' },
  { ref: '023753', name: 'CONTROLE PARA TV GRADIENTE', price: 5.90, category: 'Acessorio Eletronico' },
  { ref: '023752', name: 'CONTROLE PARA TV LG', price: 5.90, category: 'Acessorio Eletronico' },
  { ref: '023755', name: 'CONTROLE PARA TV PHILCO', price: 5.90, category: 'Acessorio Eletronico' },
  { ref: '023754', name: 'CONTROLE PARA TV PHILIPS', price: 5.90, category: 'Acessorio Eletronico' },
  { ref: '023757', name: 'CONTROLE PARA TV SEMP TOSHIBA', price: 5.90, category: 'Acessorio Eletronico' },
  { ref: '023756', name: 'CONTROLE PARA TV UNIVERSAL', price: 9.60, category: 'Acessorio Eletronico' },
  { ref: '029354', name: 'DUCHA HIGIENICA', price: 27.62, category: 'Acessorio Eletronico' },
  { ref: '023742', name: 'MULTI CABO COM 10 ENTRADA PARA CELULAR', price: 16.00, category: 'Acessorio Eletronico' },
  { ref: '023802', name: 'PENDRAIV 4GB', price: 31.00, category: 'Acessorio Eletronico' },
  { ref: '000015', name: 'ABRIDOR DE LATA', price: 14.90, category: 'Cozinha' },
  { ref: '029241', name: 'ABRIDOR MULTIUSO 4 FUNCOES', price: 5.90, category: 'Cozinha' },
  { ref: '032380', name: 'ABRIDOR MULTIUSO 4X1 SQ 3249', price: 14.90, category: 'Cozinha' },
  { ref: '021106', name: 'ACENDEDOR PARA FOGAO', price: 6.90, category: 'Cozinha' },
  { ref: '026640', name: 'AFIADOR DE FACA 08', price: 11.80, category: 'Cozinha' },
  { ref: '031796', name: 'AFIADOR DE FACA E TESOURA', price: 29.80, category: 'Cozinha' },
  { ref: '032169', name: 'BACIA PLASTICA CANEL 28CM', price: 27.90, category: 'Cozinha' },
  { ref: '032170', name: 'BACIA PLASTICA CANEL 36CM', price: 42.90, category: 'Cozinha' },
  { ref: '032171', name: 'BACIA PLASTICA CANEL 41CM', price: 57.40, category: 'Cozinha' },
  // Pág 0038
  { ref: '023784', name: 'BAINHA PARA FACAO MONALIZA PONTA VIRADA 16 POLEGA', price: 34.00, category: 'Cutelaria' },
  { ref: '023785', name: 'BAINHA PARA FACAO MONALIZA PONTA VIRADA 18 POLEGA', price: 34.00, category: 'Cutelaria' },
  { ref: '023786', name: 'BAINHA PARA FACAO MONALIZA PONTA VIRADA 20 POLEGA', price: 34.00, category: 'Cutelaria' },
  { ref: '030769', name: 'BAINHA PARA FACAO MONALIZA PONTA VIRADA 22 POLEGA', price: 34.00, category: 'Cutelaria' },
  { ref: '032346', name: 'BATEDOR DE CLARAS SQ 3978', price: 25.90, category: 'Cozinha' },
  { ref: '032233', name: 'BATEDOR DE OVO INOX HM 315', price: 15.90, category: 'Cozinha' },
  { ref: '023750', name: 'BATEDOR DE OVOS 12X1', price: 21.00, category: 'Cozinha' },
  { ref: '032149', name: 'BATEDOR DE OVOS TRADICIONAL', price: 7.90, category: 'Cozinha' },
  { ref: '018789', name: 'BORRACHA PARA PANELA SILICONE 10LT', price: 5.65, category: 'Cozinha' },
  { ref: '031902', name: 'BORRACHA PARA PANELA SILICONE 2.5LT', price: 2.49, category: 'Cozinha' },
  { ref: '018787', name: 'BORRACHA PARA PANELA SILICONE 4.LITRO', price: 2.96, category: 'Cozinha' },
  { ref: '018788', name: 'BORRACHA PARA PANELA SILICONE 7.LITRO', price: 4.69, category: 'Cozinha' },
  { ref: '032245', name: 'CANECA ESCOLAR REF.1134', price: 3.68, category: 'Cozinha' },
  { ref: '030328', name: 'CANIVETE AUTOMATICO CABO DE MADEIRA 20CM', price: 42.00, category: 'Cutelaria' },
  { ref: '030329', name: 'CANIVETE AUTOMATICO CABO DE MADEIRA 21CM', price: 44.00, category: 'Cutelaria' },
  { ref: '030716', name: 'CANIVETE AUTOMATICO CABO DE METAL 24CM', price: 48.00, category: 'Cutelaria' },
  { ref: '032209', name: 'CANIVETE CAPA GARROTE PONTA FINA', price: 29.00, category: 'Cutelaria' },
  { ref: '032210', name: 'CANIVETE CAPA GARROTE PONTA RETA', price: 29.00, category: 'Cutelaria' },
  { ref: '032094', name: 'CANIVETE SLK D03', price: 59.90, category: 'Cutelaria' },
  { ref: '030845', name: 'CANIVETE SLK D12', price: 44.00, category: 'Cutelaria' },
  { ref: '031651', name: 'CANIVETE SLK D13', price: 44.00, category: 'Cutelaria' },
  { ref: '032093', name: 'CANIVETE SLK D19', price: 44.00, category: 'Cutelaria' },
  { ref: '031920', name: 'CANIVETE SLK D20', price: 59.90, category: 'Cutelaria' },
  { ref: '032453', name: 'CHAIRA N.08 ORIGINAL SLO 1700', price: 29.80, category: 'Cutelaria' },
  { ref: '032454', name: 'CHAIRA N.10 ORIGINAL SLO 1710', price: 49.90, category: 'Cutelaria' },
  // Faca / Facao
  { ref: '032123', name: 'FACA PEXEIRA N.07', price: 15.00, category: 'Cutelaria' },
  { ref: '032124', name: 'FACA PEXEIRA N.08', price: 19.00, category: 'Cutelaria' },
  { ref: '032125', name: 'FACA PEXEIRA N.09', price: 22.00, category: 'Cutelaria' },
  { ref: '032126', name: 'FACA PEXEIRA N.10', price: 24.00, category: 'Cutelaria' },
  { ref: '032127', name: 'FACA PEXEIRA N.12', price: 36.00, category: 'Cutelaria' },
  { ref: '012244', name: 'FACA SQ 5 POLEGADA C/BAINHA', price: 23.90, category: 'Cutelaria' },
  { ref: '007506', name: 'FACA SQ 7 POLEGADA C/BAINHA', price: 29.00, category: 'Cutelaria' },
  { ref: '006153', name: 'FACA SQ 8 POLEGADA C/BAINHA', price: 32.00, category: 'Cutelaria' },
  { ref: '030326', name: 'FACA SQ CABO BRANCO 08 POLEGADA REF 2953', price: 24.90, category: 'Cutelaria' },
  { ref: '028475', name: 'FACA SQ CABO BRANCO 6 POLEGADA', price: 21.90, category: 'Cutelaria' },
  { ref: '029759', name: 'FACA SQ CABO BRANCO 7 POLEGADA 2954', price: 22.90, category: 'Cutelaria' },
  { ref: '029147', name: 'FACA SQ CABO COLORIDO 08 POL', price: 14.90, category: 'Cutelaria' },
  { ref: '006639', name: 'FACA SQ CABO DE BORRACHA 5 POLEGADA', price: 10.90, category: 'Cutelaria' },
  { ref: '003040', name: 'FACA SQ CABO DE BORRACHA 7 POLEGADA', price: 13.50, category: 'Cutelaria' },
  { ref: '032079', name: 'FACAO ESPORTIVO SQ 4100 12 POL', price: 96.00, category: 'Cutelaria' },
  { ref: '031689', name: 'FACAO PONTA VIRADA 10 POLEGADA', price: 25.90, category: 'Cutelaria' },
  { ref: '031688', name: 'FACAO PONTA VIRADA 12 POLEGADA', price: 26.90, category: 'Cutelaria' },
  { ref: '031378', name: 'FACAO PONTA VIRADA N.14 POLEGADA', price: 27.90, category: 'Cutelaria' },
  { ref: '031379', name: 'FACAO PONTA VIRADA N.16 POLEGADA', price: 28.90, category: 'Cutelaria' },
  { ref: '031380', name: 'FACAO PONTA VIRADA N.18 POLEGADA', price: 29.90, category: 'Cutelaria' },
  { ref: '031381', name: 'FACAO PONTA VIRADA N.20 POLEGADA', price: 44.90, category: 'Cutelaria' },
  { ref: '026416', name: 'FACAO XINGU', price: 89.00, category: 'Cutelaria' },
  { ref: '032206', name: 'FRIGIDEIRA CERAMICA ANTEADERENTE 24CM', price: 66.00, category: 'Cozinha' },
  { ref: '032205', name: 'FRIGIDEIRA CERAMICA ANTEADERENTE 26CM', price: 74.00, category: 'Cozinha' },
  // Pág 0047
  { ref: '000281', name: 'TORNEIRA P/FILTRO BRANCA', price: 7.45, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '000282', name: 'TORNEIRA P/FILTRO VERMELHA', price: 7.45, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032019', name: 'TORNEIRA PARA JARDIM 12X1', price: 3.63, category: 'Mat. Eletrico/Hidraulico' },
  { ref: '032105', name: 'VASSOURA CONDOR', price: 11.40, category: 'Cozinha' },
  { ref: '032394', name: 'XICARA 110ML REF.18143', price: 6.25, category: 'Cozinha' },
  { ref: '032395', name: 'XICARA 195ML REF.15742', price: 6.49, category: 'Cozinha' },
  { ref: '032388', name: 'XICARA 220ML REF.18081', price: 6.49, category: 'Cozinha' },
  { ref: '032387', name: 'XICARA 220ML REF.18091', price: 6.49, category: 'Cozinha' },
  { ref: '032389', name: 'XICARA 220ML REF.18099', price: 6.49, category: 'Cozinha' },
  { ref: '032391', name: 'XICARA PERA ANBAR', price: 6.39, category: 'Cozinha' },
  { ref: '032390', name: 'XICARA PERA CRISTAL', price: 6.39, category: 'Cozinha' },
  { ref: '032393', name: 'XICARA SINO ANBAR', price: 6.39, category: 'Cozinha' },
  { ref: '032392', name: 'XICARA SINO CRISTAL', price: 6.39, category: 'Cozinha' },
  { ref: '032414', name: 'LAMPADA DE EMERGENCIA RECARREGAVEL ISA L85', price: 66.00, category: 'Perfumaria Linha Fashion' },
  { ref: '030296', name: 'BACIA DAKO GRANDE C.17', price: 4.50, category: 'Pecas e Acessorio para Fogoes' },
  { ref: '030297', name: 'BACIA DAKO PEQUENA C.16', price: 3.60, category: 'Pecas e Acessorio para Fogoes' },
  { ref: '030303', name: 'BACIA IBIZA GRANDE C.253', price: 4.35, category: 'Pecas e Acessorio para Fogoes' },
  { ref: '030305', name: 'BACIA IBIZA PEQUENA C.253', price: 3.59, category: 'Pecas e Acessorio para Fogoes' },
  { ref: '030311', name: 'ESPALHADOR ATLAS GRANDE C.248', price: 2.96, category: 'Pecas e Acessorio para Fogoes' },
  { ref: '030313', name: 'ESPALHADOR ATLAS PEQUENO C.247', price: 2.66, category: 'Pecas e Acessorio para Fogoes' },
  { ref: '030299', name: 'ESPALHADOR CONTINENTAL VILAGE GRANDE C.246', price: 3.68, category: 'Pecas e Acessorio para Fogoes' },
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

  // Additive seed: Distribuidora Medeiros tables (only inserts products whose ref is not present yet)
  const MEDEIROS_FLAG = 'cv_seed_medeiros_v1';
  if (!localStorage.getItem(MEDEIROS_FLAG)) {
    const existing = await db.products.toArray();
    const existingRefs = new Set(existing.map(p => (p.ref || '').trim()).filter(Boolean));
    const now = new Date();
    const toAdd = MEDEIROS_PRODUCTS
      .filter(p => !existingRefs.has(p.ref))
      .map(p => ({ ...p, createdAt: now }));
    if (toAdd.length > 0) {
      const chunk = 200;
      for (let i = 0; i < toAdd.length; i += chunk) {
        await db.products.bulkAdd(toAdd.slice(i, i + chunk));
      }
    }
    localStorage.setItem(MEDEIROS_FLAG, '1');
  }

  // Additive seed v2: extra Distribuidora Medeiros tables
  const MEDEIROS_V2_FLAG = 'cv_seed_medeiros_v2';
  if (!localStorage.getItem(MEDEIROS_V2_FLAG)) {
    const existingV2 = await db.products.toArray();
    const existingRefsV2 = new Set(existingV2.map(p => (p.ref || '').trim()).filter(Boolean));
    const nowV2 = new Date();
    const toAddV2 = MEDEIROS_V2_PRODUCTS
      .filter(p => !existingRefsV2.has(p.ref))
      .map(p => ({ ...p, createdAt: nowV2 }));
    if (toAddV2.length > 0) {
      const chunkV2 = 200;
      for (let i = 0; i < toAddV2.length; i += chunkV2) {
        await db.products.bulkAdd(toAddV2.slice(i, i + chunkV2));
      }
    }
    localStorage.setItem(MEDEIROS_V2_FLAG, '1');
  }

  // Additive seed v3: extra Distribuidora Medeiros tables (10 new pages)
  const MEDEIROS_V3_FLAG = 'cv_seed_medeiros_v3';
  if (!localStorage.getItem(MEDEIROS_V3_FLAG)) {
    const existingV3 = await db.products.toArray();
    const existingRefsV3 = new Set(existingV3.map(p => (p.ref || '').trim()).filter(Boolean));
    const nowV3 = new Date();
    const seen = new Set<string>();
    const toAddV3 = MEDEIROS_V3_PRODUCTS
      .filter(p => {
        if (existingRefsV3.has(p.ref)) return false;
        if (seen.has(p.ref)) return false;
        seen.add(p.ref);
        return true;
      })
      .map(p => ({ ...p, createdAt: nowV3 }));
    if (toAddV3.length > 0) {
      const chunkV3 = 200;
      for (let i = 0; i < toAddV3.length; i += chunkV3) {
        await db.products.bulkAdd(toAddV3.slice(i, i + chunkV3));
      }
    }
    localStorage.setItem(MEDEIROS_V3_FLAG, '1');
  }

  // Additive seed v4: novas tabelas Distribuidora Medeiros (8 páginas)
  const MEDEIROS_V4_FLAG = 'cv_seed_medeiros_v4';
  if (!localStorage.getItem(MEDEIROS_V4_FLAG)) {
    const existingV4 = await db.products.toArray();
    const existingRefsV4 = new Set(existingV4.map(p => (p.ref || '').trim()).filter(Boolean));
    const nowV4 = new Date();
    const seenV4 = new Set<string>();
    const toAddV4 = MEDEIROS_V4_PRODUCTS
      .filter(p => {
        if (!p.ref || p.price <= 0) return false;
        if (existingRefsV4.has(p.ref)) return false;
        if (seenV4.has(p.ref)) return false;
        seenV4.add(p.ref);
        return true;
      })
      .map(p => ({ ...p, createdAt: nowV4 }));
    if (toAddV4.length > 0) {
      const chunkV4 = 200;
      for (let i = 0; i < toAddV4.length; i += chunkV4) {
        await db.products.bulkAdd(toAddV4.slice(i, i + chunkV4));
      }
    }
    localStorage.setItem(MEDEIROS_V4_FLAG, '1');
  }

  const clientCount = await db.clients.count();
  if (clientCount === 0) {
    await db.clients.bulkAdd([
      { name: 'Maria Silva', phone: '(11) 99999-1234', city: 'São Paulo', bairro: 'Centro', commerceName: 'Mercearia da Maria', referencePoint: 'Próximo à praça', createdAt: new Date() },
      { name: 'João Santos', phone: '(11) 98888-5678', city: 'São Paulo', bairro: 'Jardim', commerceName: 'Loja do João', referencePoint: 'Em frente ao mercado', createdAt: new Date() },
    ]);
  }
}
