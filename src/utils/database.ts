import { PaymentConfig, Product, Order, User } from '../types';

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  yapePhone: '+51 921 617 882',
  yapeName: 'Gift Corner Lab',
  yapeQrUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%237c3aed"/><rect x="20" y="20" width="260" height="260" rx="20" fill="%23ffffff"/><text x="150" y="60" font-family="sans-serif" font-weight="bold" font-size="22" fill="%237c3aed" text-anchor="middle">YAPE - GIFT CORNER LAB</text><rect x="50" y="80" width="70" height="70" fill="%237c3aed"/><rect x="60" y="90" width="50" height="50" fill="%23ffffff"/><rect x="70" y="100" width="30" height="30" fill="%237c3aed"/><rect x="180" y="80" width="70" height="70" fill="%237c3aed"/><rect x="190" y="90" width="50" height="50" fill="%23ffffff"/><rect x="200" y="100" width="30" height="30" fill="%237c3aed"/><rect x="50" y="180" width="70" height="70" fill="%237c3aed"/><rect x="60" y="190" width="50" height="50" fill="%23ffffff"/><rect x="70" y="200" width="30" height="30" fill="%237c3aed"/><rect x="140" y="140" width="20" height="20" fill="%2303b5d3"/><rect x="180" y="180" width="40" height="40" fill="%237c3aed"/><text x="150" y="275" font-family="sans-serif" font-size="14" font-weight="bold" fill="%237c3aed" text-anchor="middle">Gift Corner Lab Oficial</text></svg>',
  mercadopagoPublicKey: 'APP_USR-789456123-DEMO-PUBLIC-KEY',
  stripePublicKey: 'pk_test_51GiftCornerLabDemoKey99',
  autoApproveYape: true,
  // PagoEfectivo defaults
  pagoEfectivoEnabled: true,
  pagoEfectivoServiceCode: 'GIFT-CORNER-PEN',
  pagoEfectivoInstructions: 'Paga con tu código CIP en cualquier agente BCP, Interbank, Banco de la Nación, BBVA, CMAC, o desde la app o banca por internet de tu banco.'
};

const PAYMENT_CONFIG_KEY = 'gift_corner_payment_config';

export function getPaymentConfig(): PaymentConfig {
  try {
    const raw = localStorage.getItem(PAYMENT_CONFIG_KEY);
    if (!raw) return DEFAULT_PAYMENT_CONFIG;
    const parsed = { ...DEFAULT_PAYMENT_CONFIG, ...JSON.parse(raw) };
    if (parsed.yapeName === 'Marcelo Aliaga' || !parsed.yapeName) {
      parsed.yapeName = 'Gift Corner Lab';
    }
    if (parsed.pagoEfectivoEnabled === undefined) {
      parsed.pagoEfectivoEnabled = true;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading payment config:', err);
    return DEFAULT_PAYMENT_CONFIG;
  }
}

export function savePaymentConfig(config: PaymentConfig): void {
  try {
    localStorage.setItem(PAYMENT_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving payment config:', err);
  }
}

/* ================= INDEXEDDB PERSISTENT STORAGE MANAGER ================= */
const DB_NAME = 'GiftCornerLabDB';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('media_files')) {
        db.createObjectStore('media_files', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaFileToDB(id: string, fileData: { name: string; type: string; dataUrl: string; size: number }): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('media_files', 'readwrite');
      const store = tx.objectStore('media_files');
      store.put({ id, ...fileData, updatedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB write fallback:', err);
  }
}

export async function getMediaFileFromDB(id: string): Promise<{ name: string; type: string; dataUrl: string; size: number } | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('media_files', 'readonly');
      const store = tx.objectStore('media_files');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB read fallback:', err);
    return null;
  }
}

export async function calculateDatabaseStorageUsage(): Promise<{ mbUsed: number; totalMediaCount: number }> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('media_files', 'readonly');
      const store = tx.objectStore('media_files');
      const request = store.getAll();
      request.onsuccess = () => {
        const records = request.result || [];
        let totalBytes = 0;
        records.forEach(r => {
          totalBytes += r.size || (r.dataUrl ? r.dataUrl.length : 0);
        });
        const mb = parseFloat((totalBytes / (1024 * 1024)).toFixed(2));
        resolve({ mbUsed: mb, totalMediaCount: records.length });
      };
      request.onerror = () => resolve({ mbUsed: 0, totalMediaCount: 0 });
    });
  } catch (err) {
    return { mbUsed: 0, totalMediaCount: 0 };
  }
}

export async function exportDatabaseBackup(): Promise<string> {
  const paymentConfig = getPaymentConfig();
  const products = localStorage.getItem('gift_corner_products');
  const orders = localStorage.getItem('gift_corner_orders');
  const users = localStorage.getItem('gift_corner_users');

  let mediaFiles: any[] = [];
  try {
    const db = await openDatabase();
    mediaFiles = await new Promise((resolve) => {
      const tx = db.transaction('media_files', 'readonly');
      const store = tx.objectStore('media_files');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    mediaFiles = [];
  }

  const backupData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    paymentConfig,
    products: products ? JSON.parse(products) : [],
    orders: orders ? JSON.parse(orders) : [],
    users: users ? JSON.parse(users) : [],
    mediaFiles
  };

  return JSON.stringify(backupData, null, 2);
}

export async function importDatabaseBackup(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (data.paymentConfig) savePaymentConfig(data.paymentConfig);
    if (data.products) localStorage.setItem('gift_corner_products', JSON.stringify(data.products));
    if (data.orders) localStorage.setItem('gift_corner_orders', JSON.stringify(data.orders));
    if (data.users) localStorage.setItem('gift_corner_users', JSON.stringify(data.users));

    if (Array.isArray(data.mediaFiles) && data.mediaFiles.length > 0) {
      const db = await openDatabase();
      const tx = db.transaction('media_files', 'readwrite');
      const store = tx.objectStore('media_files');
      data.mediaFiles.forEach((file: any) => store.put(file));
    }
    return true;
  } catch (err) {
    console.error('Import database backup failed:', err);
    return false;
  }
}
