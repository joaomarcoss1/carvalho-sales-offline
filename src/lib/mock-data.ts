export interface Post {
  id: string;
  businessName: string;
  businessAvatar: string;
  businessVerified: boolean;
  category: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  saved: boolean;
  createdAt: string;
  distance: string;
  type: 'promo' | 'event' | 'product';
}

export interface Event {
  id: string;
  title: string;
  businessName: string;
  businessAvatar: string;
  image: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: string;
  attendees: number;
  description: string;
  ticketsAvailable: number;
}

export interface ChatConversation {
  id: string;
  businessName: string;
  businessAvatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  { id: 'all', name: 'Todos', icon: '🔥', color: 'from-purple-500 to-pink-500' },
  { id: 'food', name: 'Gastronomia', icon: '🍔', color: 'from-orange-500 to-red-500' },
  { id: 'fashion', name: 'Moda', icon: '👗', color: 'from-pink-500 to-rose-500' },
  { id: 'beauty', name: 'Beleza', icon: '💅', color: 'from-fuchsia-500 to-purple-500' },
  { id: 'tech', name: 'Tecnologia', icon: '💻', color: 'from-blue-500 to-cyan-500' },
  { id: 'fitness', name: 'Fitness', icon: '💪', color: 'from-green-500 to-emerald-500' },
  { id: 'entertainment', name: 'Entretenimento', icon: '🎭', color: 'from-yellow-500 to-orange-500' },
  { id: 'services', name: 'Serviços', icon: '🔧', color: 'from-slate-500 to-gray-500' },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    businessName: 'Burger House',
    businessAvatar: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop',
    businessVerified: true,
    category: 'food',
    content: '🔥 MEGA PROMOÇÃO! Combo duplo por apenas R$ 29,90. Válido somente hoje! Corre que é por tempo limitado! 🍔🍟',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop',
    likes: 234,
    comments: 45,
    shares: 12,
    liked: false,
    saved: false,
    createdAt: '2h',
    distance: '1.2 km',
    type: 'promo',
  },
  {
    id: '2',
    businessName: 'Studio Bella',
    businessAvatar: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop',
    businessVerified: true,
    category: 'beauty',
    content: '✨ Novo pacote de tratamento facial com 40% OFF na primeira sessão. Agende já!',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop',
    likes: 187,
    comments: 23,
    shares: 8,
    liked: true,
    saved: false,
    createdAt: '4h',
    distance: '3.5 km',
    type: 'promo',
  },
  {
    id: '3',
    businessName: 'TechStore',
    businessAvatar: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100&h=100&fit=crop',
    businessVerified: false,
    category: 'tech',
    content: '📱 iPhone 15 Pro com desconto exclusivo para seguidores do Points! Use o cupom POINTS15',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=400&fit=crop',
    likes: 456,
    comments: 89,
    shares: 34,
    liked: false,
    saved: true,
    createdAt: '6h',
    distance: '800 m',
    type: 'product',
  },
  {
    id: '4',
    businessName: 'CrossFit Arena',
    businessAvatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop',
    businessVerified: true,
    category: 'fitness',
    content: '💪 Aula experimental GRÁTIS! Venha conhecer nosso box e comece sua transformação.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop',
    likes: 98,
    comments: 15,
    shares: 6,
    liked: false,
    saved: false,
    createdAt: '8h',
    distance: '2.1 km',
    type: 'promo',
  },
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival Gastronômico 2026',
    businessName: 'Prefeitura Municipal',
    businessAvatar: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
    date: '15 Abr',
    time: '18:00 - 23:00',
    location: 'Praça Central',
    price: 0,
    category: 'food',
    attendees: 1250,
    description: 'O maior festival gastronômico da região com mais de 50 restaurantes, food trucks e atrações musicais.',
    ticketsAvailable: 500,
  },
  {
    id: '2',
    title: 'Show ao Vivo - Rock Night',
    businessName: 'Club Noite',
    businessAvatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
    date: '22 Abr',
    time: '21:00 - 04:00',
    location: 'Club Noite - Centro',
    price: 45,
    category: 'entertainment',
    attendees: 340,
    description: 'Uma noite inesquecível com as melhores bandas de rock da cidade.',
    ticketsAvailable: 160,
  },
  {
    id: '3',
    title: 'Feira de Moda Sustentável',
    businessName: 'EcoFashion Coletivo',
    businessAvatar: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
    date: '28 Abr',
    time: '10:00 - 18:00',
    location: 'Parque das Artes',
    price: 15,
    category: 'fashion',
    attendees: 890,
    description: 'Moda consciente, brechós, workshops de upcycling e palestras sobre sustentabilidade.',
    ticketsAvailable: 300,
  },
];

export const mockChats: ChatConversation[] = [
  {
    id: '1',
    businessName: 'Burger House',
    businessAvatar: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop',
    lastMessage: 'Seu pedido está sendo preparado! 🍔',
    timestamp: '14:30',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    businessName: 'Studio Bella',
    businessAvatar: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop',
    lastMessage: 'Confirmamos seu agendamento para amanhã às 15h.',
    timestamp: '12:15',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    businessName: 'TechStore',
    businessAvatar: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100&h=100&fit=crop',
    lastMessage: 'O produto já está disponível para retirada!',
    timestamp: 'Ontem',
    unread: 1,
    online: true,
  },
];
