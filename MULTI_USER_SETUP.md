# Multi-User Setup Guide

This document explains the multi-user authentication system that has been implemented.

## Overview

The backend now supports multiple users with:

- User registration and login
- JWT-based authentication
- Data isolation (each user can only see their own data)
- Secure password hashing with bcrypt

## Database Changes

### New Tables

- **users**: Stores user accounts with email and hashed passwords
- Foreign keys added to **profiles** and **transactions** tables to link data to users

### Migration Notes

⚠️ **Important**: If you have existing data, you'll need to:

1. Export your existing data
2. Start fresh (existing data won't have user_id associated)
3. Or manually assign user_ids to existing records

## Installation

### Backend Dependencies

New packages required:

```bash
cd server
npm install bcrypt jsonwebtoken
```

### Environment Variables

Add to your `.env` file:

```env
JWT_SECRET=your-secret-key-change-in-production-use-random-string
JWT_EXPIRES_IN=7d  # Optional, default is 7 days
```

## API Changes

### Public Endpoints (No Auth Required)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/health` - Health check

### Protected Endpoints (Auth Required)

All other endpoints now require authentication:

- All `/api/profile/*` endpoints
- All `/api/transactions/*` endpoints
- All `/api/analytics/*` endpoints
- All `/api/stats` endpoints

### Authentication Header

Include JWT token in requests:

```
Authorization: Bearer <token>
```

## Frontend Changes

### New Components

- `Login.jsx` - Login/Signup page
- Auth utilities in `utils/auth.js`

### Updated Components

- `App.jsx` - Now checks for authentication instead of profile
- `Layout.jsx` - Shows logged-in user and logout button
- All API calls now include authentication token

### User Flow

1. User visits app → redirected to login if not authenticated
2. User can register new account or login
3. After login, token stored in localStorage
4. Token included in all API requests
5. On logout, token removed and user redirected to login

## Testing

1. Start the backend server:

   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend:

   ```bash
   cd client
   npm run dev
   ```

3. Create a new account:

   - Email: test@example.com
   - Password: password123
   - Name: Test User

4. Login and verify data isolation:
   - Create transactions as one user
   - Logout and create another user
   - Login as first user - should only see first user's data

## Security Notes

- Passwords are hashed using bcrypt (10 salt rounds)
- JWT tokens expire after 7 days (configurable)
- All protected routes verify token before processing
- User data is isolated by user_id in database queries
