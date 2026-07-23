// ─── IndexedDB Offline Cache for Wakeely Pro ───────────────────────────
// Caches cases, documents, tasks, and clients for offline access

const DB_NAME = 'wakeely-offline';
const DB_VERSION = 1;
const STALE_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  key: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction('cache', mode).objectStore('cache');
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const req = tx(db, 'readonly').get(key);
      req.onsuccess = () => {
        const entry: CacheEntry<T> | undefined = req.result;
        if (!entry) return resolve(null);
        if (Date.now() - entry.cachedAt > STALE_MS) return resolve(null);
        resolve(entry.data);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const req = tx(db, 'readwrite').put({ key, data, cachedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Silently fail if IndexedDB not available
  }
}

export async function clearCache(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const req = tx(db, 'readwrite').clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Silently fail
  }
}

// Fetch with offline fallback
export async function fetchWithCache<T>(url: string, fetcher?: () => Promise<T>): Promise<{ data: T | null; fromCache: boolean; isOnline: boolean }> {
  const isOnline = navigator.onLine;

  // If offline, return cached data
  if (!isOnline) {
    const cached = await getCached<T>(url);
    return { data: cached, fromCache: true, isOnline: false };
  }

  // If online, try to fetch and cache
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Cache the response
    await setCache(url, data);
    return { data, fromCache: false, isOnline: true };
  } catch {
    // Fetch failed — try cache as fallback
    const cached = await getCached<T>(url);
    return { data: cached, fromCache: !!cached, isOnline: true };
  }
}

// Preload critical data for offline
export async function preloadOfflineData() {
  const endpoints = [
    '/api/cases?limit=100',
    '/api/tasks?limit=100',
    '/api/clients?limit=100',
    '/api/documents?limit=100',
    '/api/dashboard',
    '/api/team?limit=50',
  ];

  await Promise.allSettled(
    endpoints.map(async (url) => {
      const { data } = await fetchWithCache(url);
      return data;
    })
  );
}

// Search cached data locally
export async function searchCached(query: string): Promise<any[]> {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: any[] = [];

  const searches: Promise<void>[] = [
    getCached<any>('/api/cases?limit=100').then((data) => {
      const cases = Array.isArray(data) ? data : (data?.cases || []);
      cases.forEach((c: any) => {
        if (
          c.title?.toLowerCase().includes(q) ||
          c.caseNumber?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
        ) {
          results.push({ type: 'case', id: c.id, title: c.title, subtitle: c.caseNumber, status: c.status });
        }
      });
    }),
    getCached<any>('/api/tasks?limit=100').then((data) => {
      const tasks = Array.isArray(data) ? data : (data?.tasks || []);
      tasks.forEach((t: any) => {
        if (t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
          results.push({ type: 'task', id: t.id, title: t.title, subtitle: t.status, status: t.priority });
        }
      });
    }),
    getCached<any>('/api/clients?limit=100').then((data) => {
      const clients = Array.isArray(data) ? data : (data?.clients || []);
      clients.forEach((c: any) => {
        if (
          c.fullName?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q)
        ) {
          results.push({ type: 'client', id: c.id, title: c.fullName, subtitle: c.email || c.company, status: c.type });
        }
      });
    }),
    getCached<any>('/api/documents?limit=100').then((data) => {
      const docs = Array.isArray(data) ? data : [];
      docs.forEach((d: any) => {
        if (d.fileName?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)) {
          results.push({ type: 'document', id: d.id, title: d.fileName, subtitle: d.category, status: d.fileType });
        }
      });
    }),
  ];

  await Promise.allSettled(searches);
  return results.slice(0, 20);
}
