/**
 * Test Supabase Connection
 * Run this script to verify your Supabase configuration is correct
 * 
 * Note: Bun automatically loads .env.local files, no dotenv needed!
 */

const supabase = require('../supabaseClient');

async function testConnection() {
    console.log('\n🧪 Testing Supabase Connection...\n');

    try {
        // Test 1: Check environment variables
        console.log('✓ Step 1: Checking environment variables...');
        if (!process.env.SUPABASE_URL) {
            throw new Error('SUPABASE_URL not found in .env.local');
        }
        if (!process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_SERVICE_KEY) {
            throw new Error('SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY not found in .env.local');
        }
        console.log('  ✅ Environment variables are set\n');

        // Test 2: Query users table
        console.log('✓ Step 2: Querying users table...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .limit(5);

        if (usersError) {
            throw new Error(`Users query failed: ${usersError.message}`);
        }
        console.log(`  ✅ Successfully queried users table (${users.length} users found)\n`);

        // Test 3: Query locations table
        console.log('✓ Step 3: Querying locations table...');
        const { data: locations, error: locationsError } = await supabase
            .from('locations')
            .select('*')
            .limit(5);

        if (locationsError) {
            throw new Error(`Locations query failed: ${locationsError.message}`);
        }
        console.log(`  ✅ Successfully queried locations table (${locations.length} locations found)\n`);

        // Test 4: Query members table
        console.log('✓ Step 4: Querying members table...');
        const { data: members, error: membersError } = await supabase
            .from('members')
            .select('*')
            .limit(5);

        if (membersError) {
            throw new Error(`Members query failed: ${membersError.message}`);
        }
        console.log(`  ✅ Successfully queried members table (${members.length} members found)\n`);

        // Summary
        console.log('═══════════════════════════════════════');
        console.log('✅ ALL TESTS PASSED!');
        console.log('═══════════════════════════════════════');
        console.log('Your Supabase connection is working correctly.');
        console.log('Database summary:');
        console.log(`  - Users: ${users.length}`);
        console.log(`  - Locations: ${locations.length}`);
        console.log(`  - Members: ${members.length}`);
        console.log('\nYou can now start the backend server.');
        console.log('\n');

    } catch (error) {
        console.error('\n❌ CONNECTION TEST FAILED\n');
        console.error('Error:', error.message);
        console.error('\nPlease check:');
        console.error('1. Are your Supabase credentials correct in .env.local?');
        console.error('2. Did you run the schema.sql in Supabase SQL Editor?');
        console.error('3. Is your Supabase project active and running?');
        console.error('\nSee api/supabase/README.md for setup instructions.\n');
        process.exit(1);
    }
}

testConnection();
