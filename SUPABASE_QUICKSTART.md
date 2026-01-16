# Supabase Integration - Quick Start Guide

## ⚡ Quick Setup (5 Minutes)

### 1. Create Supabase Project
- Go to https://supabase.com → **New Project**
- Name: **Pegasus Elite Hub**
- Save your database password!

### 2. Get API Keys
- Settings → API
- Copy: **Project URL**, **anon key**, **service_role key**

### 3. Configure `.env.local`
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
```

### 4. Run Database Schema
- Supabase dashboard → **SQL Editor** → **New Query**
- Copy ALL of `api/supabase/schema.sql`
- Paste and **Run** ▶️

### 5. Install & Start
```bash
# Install dependency (choose one based on your package manager)
npm install @supabase/supabase-js
# or
bun install @supabase/supabase-js
# or
yarn add @supabase/supabase-js

# Start backend
npm run start:backend
```

### 6. Create Admin User
Option A - Supabase Dashboard:
1. Authentication → Users → **Add user**
2. Enter email/password
3. Copy the user UUID
4. SQL Editor → Run:
```sql
INSERT INTO users (auth_id, email, name, role)
VALUES ('paste-uuid-here', 'admin@pegasus.ro', 'Admin', 'admin');
```

Option B - Let the app create it on first login (if you implement signup)

---

## 📁 What Was Changed

**Created Files:**
- `api/supabase/schema.sql` - Database schema (21 tables)
- `api/supabaseClient.js` - Supabase connection
- `api/supabase/db.js` - Database operations layer
- `api/supabase/README.md` - Detailed setup guide
- `api/supabase/test-connection.js` - Connection tester

**Updated Files:**
- `package.json` - Added Supabase dependency
- `.env.local` - Added Supabase config
- All 8 API routes now use Supabase

**Migration:** JSON files → PostgreSQL database

---

## 🧪 Quick Test

After setup, test the connection:
```bash
node api/supabase/test-connection.js
```

Should see: ✅ ALL TESTS PASSED!

---

## 🗄️ Database Tables

**Users & Auth:**
- users, members, memberships, membership_tiers

**Operations:**
- locations, bookings, payments, products, tasks, assets, prospects, resources

**Supporting:**
- access_logs, loyalty_history, member_communications, progress_photos, reviews, notification_templates, activity_logs, task_checklist_items, task_comments

---

## 🔒 Security (RLS Policies)

- ✅ Admins: Full access
- ✅ Trainers: View members, manage assigned items
- ✅ Members: View own data only
- ✅ All policies automatically enforced by Supabase

---

## ❓ Troubleshooting

**"Missing Supabase configuration"**
→ Check `.env.local` has all 3 variables

**"Row level security policy violation"**
→ Make sure you created an admin user in the `users` table

**"Table doesn't exist"**
→ Run the schema.sql in Supabase SQL Editor

---

## 📖 Full Documentation

See: `api/supabase/README.md` for detailed instructions

## 🎯 Next Steps

1. ✅ Complete Supabase setup
2. Test API endpoints with Postman/curl
3. Verify RLS policies work correctly
4. (Optional) Migrate existing JSON data
5. Deploy to production!
