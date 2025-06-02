// filepath: e:/hesh/printdoot/src/lib/utils/indexedDB.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'PrintdootDesignsDB';
const DB_VERSION = 1;
const STORE_NAME = 'userDesigns';

export interface DesignData {
  id: string; // Unique ID for the design, could be timestamp or generated
  productId: string;
  timestamp: number;
  fullDesignImage: string; // Data URL of the full canvas
  uploadedImages: Array<{ id: string; dataUrl: string; name?: string }>; // Original uploaded images
  textImages: Array<{ id: string; dataUrl: string; text: string }>; // Text rendered as images
}

interface PrintdootDB extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: DesignData;
    indexes: { 'productId': string; 'timestamp': number };
  };
}

let dbPromise: Promise<IDBPDatabase<PrintdootDB>> | null = null;

const getDb = (): Promise<IDBPDatabase<PrintdootDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<PrintdootDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('productId', 'productId');
          store.createIndex('timestamp', 'timestamp');
        }
        // Handle future upgrades here if needed
        // if (oldVersion < 2) { /* upgrade to version 2 */ }
      },
    });
  }
  return dbPromise;
};

export const saveDesignToDB = async (design: DesignData): Promise<string> => {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.put(design);
  await tx.done;
  console.log(`Design ${design.id} successfully saved to IndexedDB for product ${design.productId}.`);
  return design.id;
};

export const getDesignFromDB = async (id: string): Promise<DesignData | undefined> => {
  const db = await getDb();
  return db.get(STORE_NAME, id);
};

export const getAllDesignsForProductFromDB = async (productId: string): Promise<DesignData[]> => {
  const db = await getDb();
  return db.getAllFromIndex(STORE_NAME, 'productId', productId);
};

export const getAllDesignsFromDB = async (): Promise<DesignData[]> => {
  const db = await getDb();
  return db.getAll(STORE_NAME);
};

export const clearAllDesignsFromDB = async (): Promise<void> => {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).clear();
  await tx.done;
  console.log('All designs cleared from IndexedDB.');
};
