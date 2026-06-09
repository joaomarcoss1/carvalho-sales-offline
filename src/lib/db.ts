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

  const clientCount = await db.clients.count();
  if (clientCount === 0) {
    await db.clients.bulkAdd([
      { name: 'Maria Silva', phone: '(11) 99999-1234', city: 'São Paulo', bairro: 'Centro', commerceName: 'Mercearia da Maria', referencePoint: 'Próximo à praça', createdAt: new Date() },
      { name: 'João Santos', phone: '(11) 98888-5678', city: 'São Paulo', bairro: 'Jardim', commerceName: 'Loja do João', referencePoint: 'Em frente ao mercado', createdAt: new Date() },
    ]);
  }
}
