# Task 1: JWT Auth Backend

## Goal

Implement JWT authentication - login and token validation.

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
│   ├── jwt-auth.guard.ts
│   └── interfaces/
│       └── user.interface.ts
```

## Implementation Steps

### 1. Install Dependencies

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

### 2. Create User Interface

`src/auth/interfaces/user.interface.ts`:

```typescript
export interface User {
  username: string
  passwordHash: string
  role: 'admin' | 'user'
}

export interface JwtPayload {
  sub: string      // username
  username: string
  role: string
}
```

### 3. Create Auth Module

`src/auth/auth.module.ts`:

- Import `JwtModule` with config:
  - Secret from `JWT_SECRET` env var
  - Expiration: `7d`
- Import `PassportModule`
- Register `UsersConfig` (from Task 2)

### 4. Create Auth Service

`src/auth/auth.service.ts`:

```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersConfig: UsersConfig,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const users = this.usersConfig.getUsers()
    const user = users.find(u => u.username === username)
    
    if (!user) return null
    
    const valid = await bcrypt.compare(password, user.passwordHash)
    return valid ? user : null
  }

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.username,
      username: user.username,
      role: user.role,
    }
    
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        username: user.username,
        role: user.role,
      },
    }
  }
}
```

### 5. Create JWT Strategy

`src/auth/jwt.strategy.ts`:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    })
  }

  async validate(payload: JwtPayload) {
    return {
      username: payload.username,
      role: payload.role,
    }
  }
}
```

### 6. Create JWT Guard

`src/auth/jwt-auth.guard.ts`:

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    super()
  }

  canActivate(context: ExecutionContext) {
    // Single user mode - bypass auth entirely
    const singleUserMode = this.configService.get<string>('SINGLE_USER_MODE') === 'true'
    if (singleUserMode) {
      return true
    }

    return super.canActivate(context)
  }
}
```

### 7. Create Auth Controller

`src/auth/auth.controller.ts`:

```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    )
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    
    return this.authService.login(user)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user
  }

  @Get('config')
  getConfig() {
    const singleUserMode = this.configService.get<string>('SINGLE_USER_MODE') === 'true'
    return { singleUserMode }
  }
}
```

### 8. Add Rate Limiting

Simple in-memory rate limiter in `AuthController`:

```typescript
private loginAttempts = new Map<string, { count: number; resetAt: number }>()

private checkRateLimit(username: string) {
  const now = Date.now()
  const attempt = this.loginAttempts.get(username)
  
  if (attempt && attempt.resetAt > now) {
    if (attempt.count >= 5) {
      throw new HttpException('Too many attempts. Try again in 5 minutes.', 429)
    }
    attempt.count++
  } else {
    this.loginAttempts.set(username, {
      count: 1,
      resetAt: now + 5 * 60 * 1000, // 5 minutes
    })
  }
}
```

### 9. Update App Module

`src/app.module.ts`:

- Import `AuthModule`
- Optionally apply `JwtAuthGuard` globally

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Login with username/password |
| GET | `/auth/me` | Yes | Get current user info |
| GET | `/auth/config` | No | Get auth config (singleUserMode) |

## Environment Variables

`.env.example`:

```bash
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# Single User Mode (skip auth entirely)
SINGLE_USER_MODE=false
```

## JWT Payload Structure

```json
{
  "sub": "admin",
  "username": "admin",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Testing

- E2E test for login success/failure
- Test rate limiting (6th attempt should fail)
- Test JWT guard with and without SINGLE_USER_MODE
- Test /auth/me with valid/invalid tokens