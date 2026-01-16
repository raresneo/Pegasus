# Supabase Setup Guide for Pegasus Elite Hub

This guide will help you set up Supabase as the database backend for the Pegasus application.

## Prerequisites

- A Supabase account (free tier works fine)
- Node.js or Bun installed
- The Pegasus project cloned locally

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in/sign up
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: Pegasus Elite Hub
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest to your location
   - **Plan**: Free tier is sufficient for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to initialize

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL** (something like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`, keep this secret!)

## Step 3: Configure Environment Variables

1. Open your `.env.local` file in the project root
2. Replace the placeholder values with your actual Supabase credentials:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

⚠️ **Important**: Never commit the `.env.local` file to Git. It's already in `.gitignore`.

## Step 4: Run the Database Schema

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Open the file `api/supabase/schema.sql` from this project
4. Copy the **entire contents** of `schema.sql`
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Cmd+Enter)
7. You should see: `Success. No rows returned`

This will create all 21 tables, indexes, RLS policies, and triggers.

## Step 5: Verify Tables Were Created

1. In Supabase dashboard, click **Table Editor**
2. You should see all tables in the sidebar:
   - users
   - members
   - locations
   - bookings
   - payments
   - products
   - tasks
   - prospects
   - assets
   - ... and more

## Step 6: Create Your First Admin User

### Option A: Through Supabase Auth Dashboard

1. Go to **Authentication** → **Users** in Supabase
2. Click **"Add user"** → **"Create new user"**
3. Enter email and password
4. Click **"Create user"**
5. Copy the user's UUID (you'll need this)

### Option B: Through SQL Editor

Run this SQL (replace with your details):

```sql
-- First, create the auth user (Supabase handles this)
-- Then, insert into users table with the auth_id from above
INSERT INTO users (auth_id, email, name, role)
VALUES (
  'uuid-from-auth-user',
  'admin@pegasus.ro',
  'Administrator',
  'admin'
);
```

## Step 7: Test the Connection

1. Install dependencies:
   ```bash
   bun install
   ```

2. Start the backend server:
   ```bash
   bun run start:backend
   ```

3. You should see:
   ```
   ✅ Supabase connected successfully
   🛡️  PEGASUS BACKEND API INITIALIZED
   ```

4. Test the health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

## Step 8: Enable Row Level Security

The schema already includes RLS policies, but verify they're enabled:

1. In Supabase, go to **Authentication** → **Policies**
2. Check that policies exist for:
   - users
   - members
   - bookings
   - payments
   - tasks
   - products
   - prospects
   - assets

## Optional: Migrate Existing JSON Data

If you have existing data in `api/data/*.json` files, you can migrate it:

1. Create a migration script (we can help with this)
2. Read JSON files
3. Insert data into Supabase using the API

## Troubleshooting

### Connection Errors

**Error**: "Missing Supabase configuration"
- Check that `.env.local` has all three variables set
- Restart the backend server after changing `.env.local`

**Error**: "Invalid API key"
- Double-check you copied the entire key (they're very long)
- Make sure there are no extra spaces

### RLS Policy Errors

**Error**: "Row level security policy violation"
- You might be trying to access data without proper authentication
- Check that your user has the correct role in the `users` table

### SQL Errors

**Error**: "relation already exists"
- Tables already created, safe to ignore
- To start fresh: drop all tables and re-run schema.sql

## Next Steps

1. ✅ Database is set up
2. Update API routes to use Supabase (we'll do this next)
3. Test all CRUD operations
4. Deploy to production

## Useful Supabase Features

- **Table Editor**: View and edit data directly
- **SQL Editor**: Run custom queries
- **Database** → **Replication**: Set up backups
- **Auth**: Built-in authentication system
- **Storage**: File uploads (for avatars, progress photos)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
