/**
 * Supabase Client Configuration
 * Centralized database connection for Pegasus Elite Hub
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: Missing Supabase configuration!');
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env.local file');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});

// Test database connection
const testConnection = async () => {
    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
            console.warn('⚠️  Supabase connection test warning:', error.message);
            console.warn('This is normal if tables haven\'t been created yet.');
        } else {
            console.log('✅ Supabase connected successfully');
        }
    } catch (err) {
        console.error('❌ Supabase connection failed:', err.message);
    }
};

// Run connection test on startup
testConnection();

module.exports = supabase;
