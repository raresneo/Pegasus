/**
 * JSON File-based Database (Temporary Development Solution)
 * Will be migrated to MySQL in production
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Helper to ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

// Helper to read JSON file
const readJSON = async (filename) => {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Helper to write JSON file
const writeJSON = async (filename, data) => {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

const db = {
  // Generic helper to get all docs from a collection
  read: async (collectionName) => {
    return await readJSON(collectionName);
  },

  // Helper for single document
  get: async (collection, id) => {
    const items = await readJSON(collection);
    return items.find(item => item.id === id) || null;
  },

  // Add new document
  add: async (collection, data) => {
    const items = await readJSON(collection);
    const newItem = {
      ...data,
      id: data.id || `${collection}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    await writeJSON(collection, items);
    return newItem;
  },

  // Update document
  update: async (collection, id, data) => {
    const items = await readJSON(collection);
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error(`Document ${id} not found in ${collection}`);
    }

    items[index] = {
      ...items[index],
      ...data,
      id, // Preserve ID
      updatedAt: new Date().toISOString()
    };

    await writeJSON(collection, items);
    return items[index];
  },

  // Delete document
  delete: async (collection, id) => {
    const items = await readJSON(collection);
    const filtered = items.filter(item => item.id !== id);

    if (filtered.length === items.length) {
      throw new Error(`Document ${id} not found in ${collection}`);
    }

    await writeJSON(collection, filtered);
    return true;
  },

  // For compatibility with Firestore code (no-op)
  client: {
    collection: () => ({
      get: async () => ({ docs: [] }),
      doc: () => ({
        get: async () => ({ exists: false }),
        set: async () => { },
        update: async () => { },
        delete: async () => { }
      })
    })
  }
};

console.log('✅ JSON File Database Initialized (Development Mode)');
console.log('📁 Data Directory:', DATA_DIR);

module.exports = db;