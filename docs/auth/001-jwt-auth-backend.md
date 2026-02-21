# Task 1: JWT Auth Backend

## Goal

Implement JWT-based authentication backend with login endpoint and token validation.

## Dependencies

- `@nestjs/jwt`
- `@nestjs/passport`
- `passport`
- `passport-jwt`
- `bcrypt`

## Files to Create

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── interfaces/
│       └── auth.interface.ts
```

## Implementation Steps

### 1. Install Dependencies

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

### 2. Create Auth Module

- `AuthModule` importing `JwtModule` and `PassportModule`
- Register JWT with secret from `JWT_SECRET` env var
- Configure token expiration from `JWT_EXPIRES_IN` env var (default: 24h)

### 3. Create Auth Service

```typescript
interface LoginDto {
  username: string
  password: string
}

interface LoginResponse {
  accessToken: string
  user: {
    username: string
    features: string[]
  }
}
```

Methods:
- `validateUser(username, password)` - check credentials against users config
- `login(user)` - generate JWT token with user claims
- `validateToken(payload)` - validate JWT payload

### 4. Create JWT Strategy

- Extract token from Authorization header
- Validate token and attach user to request
- Include user features in JWT payload

### 5. Create Auth Controller

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Login with credentials |
| POST | `/auth/anonymous` | No | Get token for anonymous user (if enabled) |
| GET | `/auth/me` | Yes | Get current user info |
| GET | `/auth/features` | Yes | Get user features |
| GET | `/auth/config` | No | Get auth config (anonymous allowed) |

### 6. Anonymous Login

When `ALLOW_ANONYMOUS=true`:
- `POST /auth/anonymous` returns JWT for built-in "anonymous" user
- No credentials required
- Uses "anonymous" user settings from users.json
- If "anonymous" user not defined, returns 403

### 7. Create Auth Guard

- `JwtAuthGuard` using Passport JWT strategy
- Apply globally or per controller as needed

### 7. Update App Module

- Import `AuthModule`
- Configure global JWT guard (optional, can be per-route)

## Environment Variables

Add to `.env.example`:

```
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Anonymous Login
ALLOW_ANONYMOUS=false
```

## JWT Payload Structure

```json
{
  "sub": "username",
  "username": "admin",
  "features": ["search", "download", "settings"],
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Testing

- Unit tests for `AuthService`
- E2E tests for login endpoint
- Test invalid credentials handling
- Test token validation