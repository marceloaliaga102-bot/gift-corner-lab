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

export interface Product {
  id: string;
  code: string;
  name: string;
  category: 'fisicos' | 'virtuales' | 'porquesi';
  productType?: 'virtual' | 'fisico';
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
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'Completado' | 'En preparación' | 'Enviado';
  shippingAddress?: string;
  pickupLocation?: string;
  paymentMethod?: 'yape' | 'card' | 'mercadopago' | 'transfer';
  yapeOpNumber?: string;
  paymentStatus?: 'aprobado' | 'pendiente' | 'rechazado';
}
