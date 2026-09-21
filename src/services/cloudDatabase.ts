import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { 
  getFirestoreInstance, 
  isFirebaseConfigured, 
  FirebaseConfigData,
  initFirebase 
} from './firebaseConfig';
import { Product, Order, PaymentConfig, User, ProductComment, ProductRating, MusicConfig } from '../types';
import { 
  getStoredProducts, 
  saveProducts as saveLocalProducts, 
  getStoredOrders, 
  saveOrders as saveLocalOrders,
  getStoredUsers,
  saveUser as saveLocalUser,
  getStoredComments,
  saveStoredComment,
  deleteStoredComment,
  getStoredRatings,
  saveStoredRating,
  getStoredMusicConfig,
  saveStoredMusicConfig
} from '../utils/storage';
import { getPaymentConfig, savePaymentConfig as saveLocalPaymentConfig } from '../utils/database';

// Deep sanitize helper to eliminate ANY undefined values or illegal Firestore types recursively
export const deepSanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitizeForFirestore(item)).filter(item => item !== undefined);
  }
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        sanitized[key] = deepSanitizeForFirestore(val);
      }
    }
    return sanitized;
  }
  return obj;
};

// Helper specifically for Orders to ensure 100% valid Firestore document
export const sanitizeOrderForFirestore = (order: Order): any => {
  const sanitized = deepSanitizeForFirestore(order);
  if (!sanitized.createdAt) sanitized.createdAt = Date.now();
  if (!sanitized.paymentStatus) sanitized.paymentStatus = 'pendiente';
  if (!sanitized.status) sanitized.status = 'En preparación';
  if (!sanitized.customerName) sanitized.customerName = 'Cliente';
  if (sanitized.customerEmail === undefined) sanitized.customerEmail = '';
  return sanitized;
};

// Helper to remove any undefined fields or oversized binary blobs that exceed Firestore's 1MB limit
const sanitizeProductForFirestore = (prod: Product): any => {
  const sanitized = deepSanitizeForFirestore(prod);

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

  // Helper to merge local orders with cloud orders safely so newly created local orders are NEVER lost
  const handleIncomingOrders = (cloudOrders: Order[]) => {
    const local = getStoredOrders();
    const map = new Map<string, Order>();

    // 1. Seed with local orders first
    local.forEach(o => { if (o && o.id) map.set(o.id, o); });

    // 2. Merge cloud orders (ensuring latest paymentStatus & details)
    cloudOrders.forEach(co => {
      if (co && co.id) {
        const existing = map.get(co.id);
        if (!existing) {
          map.set(co.id, co);
        } else {
          map.set(co.id, { ...existing, ...co });
        }
      }
    });

    const merged = Array.from(map.values());
    merged.sort((a, b) => {
      const timeA = a.createdAt || (a.date ? new Date(a.date).getTime() : 0) || 0;
      const timeB = b.createdAt || (b.date ? new Date(b.date).getTime() : 0) || 0;
      return timeB - timeA;
    });

    saveLocalOrders(merged);
    onUpdate(merged);
  };

  // Cross-tab storage synchronization
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === 'gift_corner_orders') {
      try {
        const fresh = e.newValue ? JSON.parse(e.newValue) : [];
        if (Array.isArray(fresh)) {
          fresh.sort((a: Order, b: Order) => {
            const timeA = a.createdAt || (a.date ? new Date(a.date).getTime() : 0) || 0;
            const timeB = b.createdAt || (b.date ? new Date(b.date).getTime() : 0) || 0;
            return timeB - timeA;
          });
          onUpdate(fresh);
        }
      } catch (err) {
        console.warn('Error reading fresh orders from storage event:', err);
      }
    }
  };
  window.addEventListener('storage', handleStorageEvent);

  if (db && isFirebaseConfigured()) {
    try {
      const ordersCol = collection(db, 'orders');
      const unsubscribe = onSnapshot(
        ordersCol,
        (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as Order;
            if (data && data.id) {
              list.push(data);
            }
          });
          handleIncomingOrders(list);
        },
        (error) => {
          console.warn('Firestore orders listener error:', error);
          onUpdate(getStoredOrders());
        }
      );
      return () => {
        unsubscribe();
        window.removeEventListener('storage', handleStorageEvent);
      };
    } catch (err) {
      console.error('Error attaching orders listener:', err);
    }
  }

  onUpdate(getStoredOrders());
  return () => {
    window.removeEventListener('storage', handleStorageEvent);
  };
};

/**
 * Creates or updates an order in Cloud and Local.
 */
export const cloudSubmitOrder = async (order: Order): Promise<{ success: boolean; error?: string }> => {
  const completeOrder: Order = {
    ...order,
    createdAt: order.createdAt || Date.now(),
    paymentStatus: order.paymentStatus || 'pendiente'
  };

  const local = getStoredOrders();
  const existingIdx = local.findIndex(o => o.id === completeOrder.id);
  let updatedLocal: Order[];
  if (existingIdx >= 0) {
    updatedLocal = local.map(o => o.id === completeOrder.id ? completeOrder : o);
  } else {
    updatedLocal = [completeOrder, ...local];
  }
  updatedLocal.sort((a, b) => {
    const timeA = a.createdAt || (a.date ? new Date(a.date).getTime() : 0) || 0;
    const timeB = b.createdAt || (b.date ? new Date(b.date).getTime() : 0) || 0;
    return timeB - timeA;
  });
  saveLocalOrders(updatedLocal);

  const db = getFirestoreInstance();
  if (db && isFirebaseConfigured()) {
    try {
      const sanitized = sanitizeOrderForFirestore(completeOrder);
      await setDoc(doc(db, 'orders', completeOrder.id), sanitized);
      return { success: true };
    } catch (err: any) {
      console.error('Error saving order to Firebase:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

/**
 * Deletes an order permanently from Cloud (Firestore) and LocalStorage.
 */
export const cloudDeleteOrder = async (orderId: string): Promise<{ success: boolean; error?: string }> => {
  // 1. Delete from local storage immediately
  const local = getStoredOrders();
  const updatedLocal = local.filter(o => o.id !== orderId);
  saveLocalOrders(updatedLocal);

  // 2. Delete from Firestore if configured
  const db = getFirestoreInstance();
  if (db && isFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting order from Firebase:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

/**
 * Clears all orders from Cloud (Firestore) and LocalStorage.
 */
export const cloudClearAllOrders = async (): Promise<{ success: boolean; error?: string }> => {
  // 1. Clear local
  saveLocalOrders([]);

  // 2. Clear Firestore
  const db = getFirestoreInstance();
  if (db && isFirebaseConfigured()) {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const batch = writeBatch(db);
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
      return { success: true };
    } catch (err: any) {
      console.error('Error clearing orders from Firebase:', err);
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

/* ==========================================================================
   PRODUCT COMMENTS SYNCHRONIZATION
   ========================================================================== */

export const subscribeToProductComments = (
  productId: string, 
  onUpdate: (comments: ProductComment[]) => void
): (() => void) => {
  const db = getFirestoreInstance();

  if (db && isFirebaseConfigured()) {
    try {
      const commentsCol = collection(db, 'comments');
      const q = query(commentsCol, where('productId', '==', productId));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: ProductComment[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as ProductComment;
            if (data && data.id) {
              list.push(data);
            }
          });
          list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          localStorage.setItem(`gc_product_comments_${productId}`, JSON.stringify(list));
          onUpdate(list);
        },
        (error) => {
          console.warn('Firestore comments listener error:', error);
          onUpdate(getStoredComments(productId));
        }
      );
      return unsubscribe;
    } catch (err) {
      console.error('Error attaching comments listener:', err);
    }
  }

  onUpdate(getStoredComments(productId));
  return () => {};
};

export const cloudAddComment = async (
  productId: string,
  comment: ProductComment
): Promise<{ success: boolean; error?: string }> => {
  saveStoredComment(productId, comment);

  const db = getFirestoreInstance();
  if (db && isFirebaseConfigured()) {
    try {
      const sanitized = deepSanitizeForFirestore(comment);
      await setDoc(doc(db, 'comments', comment.id), sanitized);
      return { success: true };
    } catch (err: any) {
      console.error('Error saving comment to Firebase:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

export const cloudDeleteComment = async (
  productId: string,
  commentId: string
): Promise<{ success: boolean; error?: string }> => {
  deleteStoredComment(productId, commentId);

  const db = getFirestoreInstance();
  if (db && isFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting comment from Firebase:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

/* ==========================================================================
   PRODUCT RATINGS SYNCHRONIZATION
   ========================================================================== */

export const subscribeToProductRatings = (
  productId: string,
  onUpdate: (ratings: ProductRating[]) => void
): (() => void) => {
  const db = getFirestoreInstance();

  if (db && isFirebaseConfigured()) {
    try {
      const ratingsCol = collection(db, 'ratings');
      const q = query(ratingsCol, where('productId', '==', productId));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: ProductRating[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as ProductRating;
            if (data && data.userId && data.rating) {
              list.push(data);
            }
          });
          localStorage.setItem(`gc_product_ratings_${productId}`, JSON.stringify(list));
          onUpdate(list);
        },
        (error) => {
          console.warn('Firestore ratings listener error:', error);
          onUpdate(getStoredRatings(productId));
        }
      );
      return unsubscribe;
    } catch (err) {
      console.error('Error attaching ratings listener:', err);
    }
  }

  onUpdate(getStoredRatings(productId));
  return () => {};
};

export const cloudAddRating = async (
  productId: string,
  rating: ProductRating
): Promise<{ success: boolean; error?: string }> => {
  saveStoredRating(productId, rating);

  const db = getFirestoreInstance();
  if (db && isFirebaseConfigured()) {
    try {
      const docId = `${productId}_${rating.userId}`;
      const sanitized = deepSanitizeForFirestore({
        ...rating,
        productId,
        updatedAt: Date.now()
      });
      await setDoc(doc(db, 'ratings', docId), sanitized);
      return { success: true };
    } catch (err: any) {
      console.error('Error saving rating to Firebase:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

/* ==========================================================================
   BACKGROUND MUSIC CONFIG SYNCHRONIZATION
   ========================================================================== */

export const subscribeToMusicConfig = (
  onUpdate: (config: MusicConfig) => void
): (() => void) => {
  const db = getFirestoreInstance();

  if (db && isFirebaseConfigured()) {
    try {
      const musicDoc = doc(db, 'settings', 'music');
      const unsubscribe = onSnapshot(
        musicDoc,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as MusicConfig;
            if (!Array.isArray(data.playlist)) {
              data.playlist = data.youtubeUrl ? [{ id: 'track-1', url: data.youtubeUrl, title: data.title || 'Canción 1' }] : [];
            }
            saveStoredMusicConfig(data);
            onUpdate(data);
          } else {
            onUpdate(getStoredMusicConfig());
          }
        },
        (error) => {
          console.warn('Firestore music listener error:', error);
          onUpdate(getStoredMusicConfig());
        }
      );
      return unsubscribe;
    } catch (err) {
      console.error('Error attaching music listener:', err);
    }
  }

  onUpdate(getStoredMusicConfig());
  return () => {};
};

export const cloudSaveMusicConfig = async (
  config: MusicConfig
): Promise<{ success: boolean; error?: string }> => {
  const normalizedPlaylist = Array.isArray(config.playlist) ? config.playlist : [];
  const primaryUrl = config.youtubeUrl || (normalizedPlaylist.length > 0 ? normalizedPlaylist[0].url : '');
  
  const normalizedConfig: MusicConfig = {
    ...config,
    youtubeUrl: primaryUrl,
    playlist: normalizedPlaylist
  };

  saveStoredMusicConfig(normalizedConfig);

  const db = getFirestoreInstance();
  if (db && isFirebaseConfigured()) {
    try {
      const sanitized = deepSanitizeForFirestore(normalizedConfig);
      await setDoc(doc(db, 'settings', 'music'), sanitized);
      return { success: true };
    } catch (err: any) {
      console.error('Error saving music config to Firebase:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

