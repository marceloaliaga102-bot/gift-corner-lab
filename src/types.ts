export type ProductCategory = 'todos' | 'fisicos' | 'virtuales' | 'porquesi';

export type AppView = 
  | 'catalogo'
  | 'porque-si'
  | 'nosotros'
  | 'preguntas-faq'
  | 'politicas'
  | 'admin-panel'
  | 'mi-cuenta';

export interface ProductDownloadFile {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  isHtml?: boolean;
}

export interface ProductComment {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  timestamp?: number;
}

export interface ProductRating {
  productId: string;
  userId: string;
  rating: number;
}

export interface PlaylistItem {
  id: string;
  url: string;
  title?: string;
}

export interface MusicConfig {
  enabled: boolean;
  youtubeUrl: string;
  playlist?: PlaylistItem[];
  title?: string;
  defaultVolume?: number; // 0 - 100
  loop?: boolean;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: 'fisicos' | 'virtuales' | 'porquesi';
  productType?: 'virtual' | 'fisico' | 'porquesi';
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  badgeLabel: string;
  badgeType: 'virtual' | 'fisico' | 'porquesi';
  secondaryBadge?: string;
  imageUrl: string;
  thumbnailUrl: string;
  altText: string;
  description: string;
  fullDetails: string;
  deliveryInfo: string;
  stock?: number;
  has3DPreview?: boolean;
  videoUrl?: string;
  downloadFile?: ProductDownloadFile;
  pickupLocations?: string[];
  features: string[];
  ratings?: ProductRating[];
  comments?: ProductComment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'creator' | 'customer';
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PaymentConfig {
  yapePhone: string;
  yapeName: string;
  yapeQrUrl: string;
  mercadopagoPublicKey?: string;
  stripePublicKey?: string;
  autoApproveYape?: boolean;
  // PagoEfectivo integration
  pagoEfectivoEnabled?: boolean;
  pagoEfectivoServiceCode?: string;  // Código de servicio (proporcionado por PagoEfectivo)
  pagoEfectivoInstructions?: string; // Instrucciones personalizadas
}

export interface Order {
  id: string;
  createdAt?: number; // Timestamp numérico milisegundos para ordenamiento exacto
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'Completado' | 'En preparación' | 'Enviado' | 'Cancelado';
  shippingAddress?: string;
  pickupLocation?: string;
  paymentMethod?: 'yape' | 'efectivo' | 'pagoefectivo';
  yapeOpNumber?: string;
  pagoEfectivoCip?: string; // CIP code generado para PagoEfectivo
  paymentStatus?: 'aprobado' | 'pendiente' | 'rechazado';
}
