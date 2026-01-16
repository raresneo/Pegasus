# Supabase Auth Integration Guide

## 🔐 How Authentication Works

The Pegasus platform now uses **Supabase Auth** for secure user management.

### For Clients (Gym Members)

#### 1. Registration (`POST /api/register`)
```javascript
// Request
{
  "name": "Ion Popescu",
  "email": "ion@example.com",
  "password": "SecurePassword123"
}

// Response
{
  "token": "eyJhbGci...", // Supabase access token
  "refreshToken": "...",  // For refreshing sessions
  "user": {
    "id": "uuid",
    "name": "Ion Popescu",
    "role": "member",
    "email": "ion@example.com",
    "avatar": "IP"
  }
}
```

**What happens:**
1. ✅ Account created in Supabase Auth
2. ✅ User profile created in `users` table
3. ✅ Member profile created in `members` table
4. ✅ Session token returned for immediate login

#### 2. Login (`POST /api/login`)
```javascript
// Request
{
  "email": "ion@example.com",
  "password": "SecurePassword123"
}

// Response
{
  "token": "eyJhbGci...",
  "refreshToken": "...",
  "user": { /* user info */ }
}
```

### For Staff (Admin/Trainers)

Staff accounts must be created by an administrator through the `/api/staff` endpoint (requires admin token).

### Token Usage

All authenticated requests must include the token:
```javascript
headers: {
  'Authorization': 'Bearer eyJhbGci...'
}
```

### Row Level Security (RLS)

Supabase automatically enforces access control based on the authenticated user:

- **Members** can only see their own data
- **Trainers** can see members and their assigned tasks
- **Admins** have full access to everything

### Email Verification (Optional)

By default, email verification is **disabled** for faster onboarding. To enable it:

1. Go to Supabase Dashboard → Authentication → Email Templates  
2. Enable "Confirm signup" email
3. Users will need to verify their email before logging in

### Session Management

- **Access tokens** expire after 1 hour
- **Refresh tokens** can be used to get new access tokens
- Frontend should implement token refresh logic

## 📝 Testing

### Register a new member:
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Access protected endpoint:
```bash
curl http://localhost:30000/api/members \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔄 Migration from Old System

The old JWT-based authentication has been replaced. If you have existing users:

1. They need to re-register through the new system
2. OR: Manually create their accounts in Supabase Auth and link to existing profiles

## 🛡️ Security Features

✅ **Encrypted passwords** - Supabase handles password hashing  
✅ **Secure sessions** - JWT tokens with short expiration  
✅ **Row Level Security** - Database-level access control  
✅ **Email uniqueness** - No duplicate accounts  
✅ **Token verification** - Every request is validated

## 🚨 Troubleshooting

**"Invalid login credentials"** → Email or password is incorrect  
**"Profil utilizator negăsit"** → User exists in Auth but not in database (contact support)  
**"Acest email este deja utilizat"** → Account already exists, use login instead  
**"Sesiune expirată"** → Token expired, login again or use refresh token
