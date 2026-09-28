const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let db;
let isFallbackMode = false;

// Check if Firebase credentials are present in env
const hasFirebaseCredentials = process.env.FIREBASE_SERVICE_ACCOUNT || 
  (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

if (hasFirebaseCredentials) {
  try {
    let credential;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } else {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
    }

    if (!admin.apps.length) {
      admin.initializeApp({ credential });
    }
    db = admin.firestore();
    console.log('Successfully initialized Firebase Admin SDK (Firestore live mode)');
  } catch (error) {
    console.warn('Failed to initialize Firebase Admin SDK, falling back to local database engine:', error.message);
    isFallbackMode = true;
  }
} else {
  console.log('No Firebase credentials found in environment. Running in local Fallback DB mode.');
  isFallbackMode = true;
}

if (isFallbackMode) {
  // Local JSON-backed Firestore Emulator / Fallback Engine
  const dataDir = path.join(__dirname, '../../data');
  const dataFile = path.join(dataDir, 'fallback_db.json');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  let store = { items: {}, transactions: {} };

  if (fs.existsSync(dataFile)) {
    try {
      const raw = fs.readFileSync(dataFile, 'utf-8');
      store = JSON.parse(raw);
    } catch (e) {
      console.error('Error reading fallback db file, starting fresh:', e.message);
    }
  }

  const saveStore = () => {
    try {
      fs.writeFileSync(dataFile, JSON.stringify(store, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving fallback DB file:', e.message);
    }
  };

  const generateId = () => 'doc_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

  const createDocWrapper = (colName, id, data) => ({
    id,
    exists: !!data,
    data: () => (data ? { ...data } : undefined),
    ref: { id }
  });

  db = {
    collection: (colName) => {
      if (!store[colName]) store[colName] = {};

      const createQuery = (filters = [], sortOrder = null) => ({
        where: (field, op, val) => {
          return createQuery([...filters, { field, op, val }], sortOrder);
        },
        orderBy: (field, direction = 'asc') => {
          return createQuery(filters, { field, direction });
        },
        get: async () => {
          let docs = Object.keys(store[colName]).map(id => createDocWrapper(colName, id, store[colName][id]));

          // Apply filters
          for (const f of filters) {
            docs = docs.filter(doc => {
              const docData = doc.data();
              if (!docData) return false;
              const val = docData[f.field];
              if (f.op === '==') return val === f.val;
              if (f.op === '<=') return val <= f.val;
              if (f.op === '>=') return val >= f.val;
              if (f.op === '<') return val < f.val;
              if (f.op === '>') return val > f.val;
              return true;
            });
          }

          // Apply sorting
          if (sortOrder) {
            docs.sort((a, b) => {
              const valA = a.data()[sortOrder.field];
              const valB = b.data()[sortOrder.field];
              const dateA = new Date(valA).getTime() || valA;
              const dateB = new Date(valB).getTime() || valB;
              if (dateA < dateB) return sortOrder.direction === 'desc' ? 1 : -1;
              if (dateA > dateB) return sortOrder.direction === 'desc' ? -1 : 1;
              return 0;
            });
          }

          return {
            empty: docs.length === 0,
            docs,
            forEach: (cb) => docs.forEach(cb)
          };
        }
      });

      return {
        get: async () => {
          const docs = Object.keys(store[colName]).map(id => createDocWrapper(colName, id, store[colName][id]));
          return {
            empty: docs.length === 0,
            docs,
            forEach: (cb) => docs.forEach(cb)
          };
        },
        doc: (id) => ({
          get: async () => createDocWrapper(colName, id, store[colName][id]),
          set: async (data, options) => {
            if (options && options.merge && store[colName][id]) {
              store[colName][id] = { ...store[colName][id], ...data };
            } else {
              store[colName][id] = { ...data };
            }
            saveStore();
            return true;
          },
          update: async (data) => {
            if (!store[colName][id]) {
              throw new Error(`Document ${id} does not exist in collection ${colName}`);
            }
            store[colName][id] = { ...store[colName][id], ...data };
            saveStore();
            return true;
          },
          delete: async () => {
            delete store[colName][id];
            saveStore();
            return true;
          }
        }),
        add: async (data) => {
          const id = generateId();
          store[colName][id] = { ...data };
          saveStore();
          return { id };
        },
        where: (field, op, val) => createQuery().where(field, op, val),
        orderBy: (field, direction) => createQuery().orderBy(field, direction)
      };
    }
  };
}

module.exports = { db, isFallbackMode };
