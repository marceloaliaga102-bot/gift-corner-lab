import { User, Product, Order, ProductComment, ProductRating, MusicConfig } from '../types';
import { PRODUCTS } from '../data/products';

// Default creator credentials
export const CREATOR_CREDENTIALS = {
  username: 'marcelo',
  email: 'marceloaliaga102@gmail.com',
  password: 'marcelo2025',
  name: 'Marcelo Aliaga (Creador & Fundador)'
};

const STORAGE_KEYS = {
  USERS: 'gc_boutique_users',
  CURRENT_USER: 'gc_boutique_session',
  PRODUCTS: 'gc_boutique_products',
  ORDERS: 'gc_boutique_orders'
};

// Seed default creator account
const defaultUsers: User[] = [
  {
    id: 'user-creator-marcelo',
    name: CREATOR_CREDENTIALS.name,
    email: CREATOR_CREDENTIALS.email,
    password: CREATOR_CREDENTIALS.password,
    role: 'creator',
    createdAt: '2025-01-01'
  }
];

export const getStoredUsers = (): User[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    const parsed = JSON.parse(saved);
    // Ensure creator is present
    if (!parsed.some((u: User) => u.email.toLowerCase() === CREATOR_CREDENTIALS.email.toLowerCase())) {
      parsed.push(defaultUsers[0]);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return defaultUsers;
  }
};

export const saveUser = (user: User): void => {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const getStoredProducts = (): Product[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved === null) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(PRODUCTS));
      return PRODUCTS;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed.map((p, idx) => {
        if (!p.code) {
          const matched = PRODUCTS.find(dp => dp.id === p.id);
          return {
            ...p,
            code: matched?.code || `GCL-${p.category === 'virtuales' ? 'VIR' : 'FIS'}-${String(idx + 1).padStart(2, '0')}`
          };
        }
        return p;
      });
    }
    return PRODUCTS;
  } catch {
    return PRODUCTS;
  }
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const getStoredOrders = (): Order[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const saveOrders = (orders: Order[]): void => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const getStoredComments = (productId: string): ProductComment[] => {
  try {
    const saved = localStorage.getItem(`gc_product_comments_${productId}`);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const saveStoredComment = (productId: string, comment: ProductComment): ProductComment[] => {
  const existing = getStoredComments(productId);
  const updated = [comment, ...existing];
  localStorage.setItem(`gc_product_comments_${productId}`, JSON.stringify(updated));
  return updated;
};

export const getStoredRatings = (productId: string): ProductRating[] => {
  try {
    const saved = localStorage.getItem(`gc_product_ratings_${productId}`);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const saveStoredRating = (productId: string, rating: ProductRating): ProductRating[] => {
  const existing = getStoredRatings(productId);
  const filtered = existing.filter(r => r.userId !== rating.userId);
  const updated = [...filtered, rating];
  localStorage.setItem(`gc_product_ratings_${productId}`, JSON.stringify(updated));
  return updated;
};

export const deleteStoredComment = (productId: string, commentId: string): ProductComment[] => {
  const existing = getStoredComments(productId);
  const updated = existing.filter(c => c.id !== commentId);
  localStorage.setItem(`gc_product_comments_${productId}`, JSON.stringify(updated));
  return updated;
};

export const getStoredMusicConfig = (): MusicConfig => {
  try {
    const saved = localStorage.getItem('gc_music_config');
    if (!saved) {
      return {
        enabled: false,
        youtubeUrl: '',
        playlist: [],
        title: 'Música de Fondo Gift Corner',
        defaultVolume: 35,
        loop: true
      };
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.playlist)) {
      parsed.playlist = parsed.youtubeUrl ? [{ id: 'track-1', url: parsed.youtubeUrl, title: parsed.title || 'Canción 1' }] : [];
    }
    return parsed;
  } catch {
    return {
      enabled: false,
      youtubeUrl: '',
      playlist: [],
      title: 'Música de Fondo Gift Corner',
      defaultVolume: 35,
      loop: true
    };
  }
};

export const saveStoredMusicConfig = (config: MusicConfig): void => {
  localStorage.setItem('gc_music_config', JSON.stringify(config));
};


