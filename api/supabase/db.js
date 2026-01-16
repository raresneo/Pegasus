/**
 * Supabase Database Layer
 * Replaces the JSON file-based database with Supabase PostgreSQL
 */

const supabase = require('../supabaseClient');

/**
 * Generic database operations for any table
 */
const db = {
    /**
     * Read all documents from a collection (table)
     * @param {string} collectionName - Table name
     * @param {object} options - Query options (filter, sort, limit, etc.)
     * @returns {Promise<Array>} Array of documents
     */
    read: async (collectionName, options = {}) => {
        try {
            let query = supabase.from(collectionName).select('*');

            // Apply filters
            if (options.filter) {
                Object.entries(options.filter).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            // Apply sorting
            if (options.sort) {
                const { column, ascending = true } = options.sort;
                query = query.order(column, { ascending });
            }

            // Apply limit
            if (options.limit) {
                query = query.limit(options.limit);
            }

            // Apply range/pagination
            if (options.range) {
                const { from, to } = options.range;
                query = query.range(from, to);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error(`Error reading from ${collectionName}:`, error);
            throw error;
        }
    },

    /**
     * Get a single document by ID
     * @param {string} collection - Table name
     * @param {string} id - Document ID
     * @returns {Promise<object|null>} Document or null
     */
    get: async (collection, id) => {
        try {
            const { data, error } = await supabase
                .from(collection)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return data;
        } catch (error) {
            console.error(`Error getting ${id} from ${collection}:`, error);
            throw error;
        }
    },

    /**
     * Add a new document to a collection
     * @param {string} collection - Table name
     * @param {object} data - Document data
     * @returns {Promise<object>} Created document
     */
    add: async (collection, data) => {
        try {
            const { data: newItem, error } = await supabase
                .from(collection)
                .insert([data])
                .select()
                .single();

            if (error) throw error;
            return newItem;
        } catch (error) {
            console.error(`Error adding to ${collection}:`, error);
            throw error;
        }
    },

    /**
     * Update a document
     * @param {string} collection - Table name
     * @param {string} id - Document ID
     * @param {object} data - Updated fields
     * @returns {Promise<object>} Updated document
     */
    update: async (collection, id, data) => {
        try {
            const { data: updatedItem, error } = await supabase
                .from(collection)
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return updatedItem;
        } catch (error) {
            console.error(`Error updating ${id} in ${collection}:`, error);
            throw error;
        }
    },

    /**
     * Delete a document
     * @param {string} collection - Table name
     * @param {string} id - Document ID
     * @returns {Promise<boolean>} Success status
     */
    delete: async (collection, id) => {
        try {
            const { error } = await supabase
                .from(collection)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error(`Error deleting ${id} from ${collection}:`, error);
            throw error;
        }
    },

    /**
     * Advanced query with custom select and joins
     * @param {string} collection - Table name
     * @param {string} select - Select statement (can include joins)
     * @param {object} options - Additional query options
     * @returns {Promise<Array>} Query results
     */
    query: async (collection, select = '*', options = {}) => {
        try {
            let query = supabase.from(collection).select(select);

            // Apply filters
            if (options.filter) {
                Object.entries(options.filter).forEach(([key, value]) => {
                    if (typeof value === 'object' && value.operator) {
                        // Advanced filters with operators
                        const { operator, val } = value;
                        query = query[operator](key, val);
                    } else {
                        query = query.eq(key, value);
                    }
                });
            }

            // Apply sorting
            if (options.sort) {
                const { column, ascending = true } = options.sort;
                query = query.order(column, { ascending });
            }

            // Apply limit
            if (options.limit) {
                query = query.limit(options.limit);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error(`Error querying ${collection}:`, error);
            throw error;
        }
    },

    /**
     * Count documents in a collection
     * @param {string} collection - Table name
     * @param {object} filter - Optional filter
     * @returns {Promise<number>} Count
     */
    count: async (collection, filter = {}) => {
        try {
            let query = supabase.from(collection).select('*', { count: 'exact', head: true });

            Object.entries(filter).forEach(([key, value]) => {
                query = query.eq(key, value);
            });

            const { count, error } = await query;

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error(`Error counting ${collection}:`, error);
            throw error;
        }
    },

    /**
     * Execute a raw SQL query (use with caution)
     * @param {string} sql - SQL query
     * @returns {Promise<any>} Query result
     */
    raw: async (sql) => {
        try {
            const { data, error } = await supabase.rpc('exec_sql', { query: sql });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error executing raw SQL:', error);
            throw error;
        }
    },

    // Direct access to Supabase client for advanced operations
    client: supabase
};

console.log('✅ Supabase Database Layer Initialized');

module.exports = db;
