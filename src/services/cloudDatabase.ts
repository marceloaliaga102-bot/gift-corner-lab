// Centralized Cloud Database Service (Firebase Firestore + Local Fallback Cache)
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch
} from 'firebase/firestore';
import { 
  getFirestoreInstance, 
  isFirebaseConfigured, 
  FirebaseConfigData,
  initFirebase 
} from './firebaseConfig';
import { Product, Order, PaymentConfig, User } from '../types';
import { 
  getStoredProducts, 
  saveProducts as saveLocalProducts, 
  getStoredOrders, 
  saveOrders as saveLocalOrders,
  getStoredUsers,
  saveUser as saveLocalUser
} from '../utils/storage';
import { getPaymentConfig, savePaymentConfig as saveLocalPaymentConfig } from '../utils/database';

// Helper to remove any undefined fields or oversized binary blobs that exceed Firestore's 1MB limit
const sanitizeProductForFirestore = (prod: Product): any => {
  const sanitized: any = { ...prod };
  
  // Remove undefined values
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });

  // If download file has an excessively large dataUrl (> 600KB), strip the dataUrl for cloud sync
  // and preserve the metadata so the document doesn't exceed Firestore's 1MB limit.
  if (sanitized.downloadFile && sanitized.downloadFile.dataUrl) {
    if (sanitized.downloadFile.dataUrl.length > 600000) {
      sanitized.downloadFile = {
        name: sanitized.downloadFile.name,
        type: sanitized.downloadFile.type,
        size: sanitized.downloadFile.size,
        isHtml: sanitized.downloadFile.isHtml,
        dataUrl: '' // Stored locally in IndexedDB
      };
    }
  }

  return sanitized;
};

/* ==========================================================================
   PRODUCTS SYNCHRONIZATION
   ========================================================================== */

/**
 * Subscribes to real-time updates for products.
 * If Firebase is configured, all clients around the world receive updates instantly.
 * If not, falls back to local storage and syncs across browser tabs.
 */
export const subscribeToProducts = (onUpdate: (products: Product[]) => void): (() => void) => {
  const db = getFirestoreInstance();

  if (db && isFirebaseConfigured()) {
    try {
      const productsCol = collection(db, 'products');
      const unsubscribe = onSnapshot(
        productsCol,
        (snapshot) => {
          const list: Product[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Product);
          });

          // If the cloud collection is brand new (first time setup)
          if (snapshot.empty && localStorage.getItem('gc_cloud_seeded') !== 'true') {
            localStorage.setItem('gc_cloud_seeded', 'true');
            const initial = getStoredProducts();
            if (initial && initial.length > 0) {
              cloudBulkUploadProducts(initial);
              onUpdate(initial);
              return;
            }
          }

          localStorage.setItem('gc_cloud_seeded', 'true');
          saveLocalProducts(list);
          onUpdate(list);
        },
        (error) => {
          console.warn('Firestore products listener error, falling back to local:', error);
          onUpdate(getStoredProducts());
        }
      );
      return unsubscribe;
    } catch (err) {
      console.error('Error attaching Firestore products listener:', err);
    }
  }

  // Fallback: Initial local load
  onUpdate(getStoredProducts());

  // Cross-tab synchronization
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === 'gc_boutique_products') {
      onUpdate(getStoredProducts());
    }
  };
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
  };
};

/**
 * Adds or updates a product in the Cloud (Firestore) and in LocalStorage.
 */
export const cloudAddProduct = async (product: Product): Promise<{ success: boolean; error?: string }> => {
  // 1. Always update local storage first for zero-latency UI
  const currentLocal = getStoredProducts();
  const existingIdx = currentLocal.findIndex(p => p.id === product.id);
  let updatedLocal: Product[];
  if (existingIdx >= 0) {
    updatedLocal = currentLocal.map(p => p.id === product.id ? product : p);
  } else {
    updatedLocal = [product, ...currentLocal];
  }
  saveLocalProducts(updatedLocal);

  // 2. Sync to Cloud
  const db = getFirestoreInstance();
  if (db && isFirebaseConfigured()) {
    try {
      const sanitized = sanitizeProductForFirestore(product);
      await setDoc(doc(db, 'products', product.id), sanitized);
      return { success: true };
    } catch (err: any) {
      console.error('Error saving product to Firebase:', err);
      return { success: false, error: err.message || 'Error guardando en la nube' };
    }
  }

  return { success: true };
};

/**
 * Deletes a product from the Cloud (Firestore) and LocalStorage.
 * Broadcasts deletion to all active clients.
 */
export const cloudDeleteProduct = async (productId: string): Promise<{ success: boolean; error?: string }> => {
  // 1. Update local storage immediately
  const currentLocal = getStoredProducts();
  const updatedLocal = currentLocal.filter(p => p.id !== productId);
  saveLocalProducts(updatedLocal);

  // 2. Delete from Cloud
  const db = getFirestoreInstance();
  if (db && isFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'products', productId));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting product from Firebase:', err);
      return { success: false, error: err.message || 'Error eliminando en la nube' };
    }
  }

  return { success: true };
};

/**
 * Updates stock for a product in Cloud and Local.
 */
export const cloudUpdateStock = async (productId: string, newStock: number): Promise<{ success: boolean; error?: string }> => {
  // 1. Update local
  const currentLocal = getStoredProducts();
  const updatedLocal = currentLocal.map(p => p.id === productId ? { ...p, stock: newStock } : p);
  saveLocalProducts(updatedLocal);

  // 2. Update cloud
  const db = getFirestoreInstance();
  if (db && isFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'products', productId), { stock: newStock });
      return { success: true };
    } catch (err: any) {
      console.error('Error updating stock in Firebase:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

/**
 * Bulk upload all local products to the cloud database.
 * Used by the Admin to seed or sync their existing catalog to Firebase in one click.
 */
export const cloudBulkUploadProducts = async (products: Product[]): Promise<{ count: number; error?: string }> => {
  const db = getFirestoreInstance();
  if (!db || !isFirebaseConfigured()) {
    return { count: 0, error: 'Firebase no está configurado.' };
  }

  try {
    const batch = writeBatch(db);
    let count = 0;
    for (const prod of products) {
      const prodRef = doc(db, 'products', prod.id);
      const sanitized = sanitizeProductForFirestore(prod);
      batch.set(prodRef, sanitized);
      count++;
    }
    await batch.commit();
    return { count };
  } catch (err: any) {
    console.error('Error in bulk upload:', err);
    return { count: 0, error: err.message || 'Error en la subida masiva' };
  }
};

/* ==========================================================================
   PAYMENT CONFIG SYNCHRONIZATION
   ========================================================================== */

/**
 * Subscribes to real-time changes to payment settings (Yape phone, QR, etc.)
 */
export const subscribeToPaymentConfig = (onUpdate: (config: PaymentConfig) => void): (() => void) => {
  const db = getFirestoreInstance();

  if (db && isFirebaseConfigured()) {
    try {
      const configDoc = doc(db, 'settings', 'payment');
      const unsubscribe = onSnapshot(
        configDoc,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as PaymentConfig;
            saveLocalPaymentConfig(data);
            onUpdate(data);
          } else {
            onUpdate(getPaymentConfig());
          }
        },
        (error) => {
          console.warn('Firestore payment listener error:', error);
          onUpdate(getPaymentConfig());
        }
      );
      return unsubscribe;
    } catch (err) {
      console.error('Error attaching payment listener:', err);
    }
  }

  onUpdate(getPaymentConfig());
  return () => {};
};

/**
 * Saves payment configuration to Cloud and Local.
 */
export const cloudSavePaymentConfig = async (config: PaymentConfig): Promise<{ success: boolean; error?: string }> => {
  saveLocalPaymentConfig(config);

  const db = getFirestoreInstance();
  if (db && isFirebaseConfigured()) {
    try {
      await setDoc(doc(db, 'settings', 'payment'), config);
      return { success: true };
    } catch (err: any) {
      console.error('Error saving payment config to Firebase:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

/* ==========================================================================
   ORDERS SYNCHRONIZATION
   ========================================================================== */

/**
 * Subscribes to client orders in real time. Admin will see client purchases instantly.
 */
export const subscribeToOrders = (onUpdate: (orders: Order[]) => void): (() => void) => {
  const db = getFirestoreInstance();

  if (db && isFirebaseConfigured()) {
    try {
      const ordersCol = collection(db, 'orders');
      const unsubscribe = onSnapshot(
        ordersCol,
        (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((d) => list.push(d.data() as Order));
          // Sort descending by date
          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          saveLocalOrders(list);
          onUpdate(list);
        },
        (error) => {
          console.warn('Firestore orders listener error:', error);
          onUpdate(getStoredOrders());
        }
      );
      return unsubscribe;
    } catch (err) {
      console.error('Error attaching orders listener:', err);
    }
  }

  onUpdate(getStoredOrders());
  return () => {};
};

/**
 * Creates an order in Cloud and Local.
 */
export const cloudSubmitOrder = async (order: Order): Promise<{ success: boolean; error?: string }> => {
  const local = getStoredOrders();
  saveLocalOrders([order, ...local]);

  const db = getFirestoreInstance();
  if (db && isFirebaseConfigured()) {
    try {
      await setDoc(doc(db, 'orders', order.id), order);
      return { success: true };
    } catch (err: any) {
      console.error('Error saving order to Firebase:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

/* ==========================================================================
   USERS / CUSTOMER ACCOUNTS SYNCHRONIZATION
   ========================================================================== */

/**
 * Saves a registered customer user to Cloud and LocalStorage.
 */
export const cloudSaveUser = async (user: User): Promise<void> => {
  saveLocalUser(user);

  const db = getFirestoreInstance();
  if (db && isFirebaseConfigured()) {
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch (err) {
      console.warn('Error saving user to Firebase:', err);
    }
  }
};

/**
 * Subscribes to customer users in real time.
 */
export const subscribeToUsers = (onUpdate: (users: User[]) => void): (() => void) => {
  const db = getFirestoreInstance();

  if (db && isFirebaseConfigured()) {
    try {
      const usersCol = collection(db, 'users');
      const unsubscribe = onSnapshot(
        usersCol,
        (snapshot) => {
          const list: User[] = [];
          snapshot.forEach((d) => list.push(d.data() as User));
          if (list.length > 0) {
            localStorage.setItem('gc_boutique_users', JSON.stringify(list));
            onUpdate(list);
          }
        },
        (err) => console.warn('Firestore users listener error:', err)
      );
      return unsubscribe;
    } catch (e) {
      console.warn('Error attaching users listener:', e);
    }
  }

  onUpdate(getStoredUsers());
  return () => {};
};

/* ==========================================================================
   TEST CONNECTION UTILITY
   ========================================================================== */

export const testCloudConnection = async (customConfig?: FirebaseConfigData): Promise<{ success: boolean; message: string }> => {
  try {
    const init = initFirebase(customConfig);
    if (!init) {
      return { success: false, message: 'La configuración de Firebase está incompleta (faltan apiKey, projectId o appId).' };
    }

    const testDocRef = doc(init.db, '_system_health', 'ping');
    await setDoc(testDocRef, { 
      ping: true, 
      timestamp: new Date().toISOString(),
      app: 'Gift Corner Lab' 
    });
    await deleteDoc(testDocRef);

    return { 
      success: true, 
      message: '¡Conexión exitosa con Firestore! Tu tienda ahora sincroniza en tiempo real con todos los clientes.' 
    };
  } catch (err: any) {
    console.error('Firebase test failed:', err);
    if (err.code === 'permission-denied') {
      return { 
        success: false, 
        message: 'Permiso denegado: Revisa las "Reglas de Firestore" en tu consola de Firebase. Deben permitir lectura y escritura en modo de prueba.' 
      };
    }
    return { 
      success: false, 
      message: `Error al conectar: ${err.message || 'Error desconocido'}` 
    };
  }
};
