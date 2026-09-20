import { User, Product, Order } from '../types';
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
