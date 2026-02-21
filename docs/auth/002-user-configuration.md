# Task 2: User Configuration

## Goal

JSON file for user storage.

## Files to Create

```
config/
├── users.json
└── users.example.json

src/
└── config/
    └── users.config.ts
```

## User Interface

```typescript
export interface User {
  username: string
  passwordHash: string  // bcrypt hash
  role: 'admin' | 'user'
}

export interface UsersConfig {
  users: User[]
}
```

## Implementation Steps

### 1. Create Example Config

`config/users.example.json`:

```json
{
  "users": [
    {
      "username": "admin",
      "passwordHash": "$2b$10$example_hash_replace_with_real_hash",
      "role": "admin"
    },
    {
      "username": "user",
      "passwordHash": "$2b$10$another_example_hash",
      "role": "user"
    }
  ]
}
```

### 2. Create Users Config Service

`src/config/users.config.ts`:

```typescript
@Injectable()
export class UsersConfig {
  private users: User[]

  constructor(private configService: ConfigService) {
    const configPath = this.configService.get<string>('USERS_CONFIG_PATH') 
      || path.join(process.cwd(), 'config', 'users.json')
    
    try {
      const data = fs.readFileSync(configPath, 'utf-8')
      const config = JSON.parse(data)
      
      // Validate structure
      if (!config.users || !Array.isArray(config.users)) {
        throw new Error('Invalid users.json structure')
      }
      
      this.users = config.users
    } catch (error) {
      console.error('Failed to load users.json:', error)
      throw error
    }
  }

  getUsers(): User[] {
    return this.users
  }

  findByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username)
  }
}
```

### 3. Update Config Module

`src/config/config.module.ts`:

```typescript
@Module({
  providers: [UsersConfig],
  exports: [UsersConfig],
})
export class ConfigModule {}
```

### 4. Password Hashing Script

Add to `package.json`:

```json
{
  "scripts": {
    "hash-password": "node -e \"const bcrypt = require('bcrypt'); const pw = process.argv[1]; bcrypt.hash(pw, 10).then(console.log)\""
  }
}
```

Usage:

```bash
npm run hash-password mypassword
# Copy output to users.json
```

### 5. Add to .gitignore

```
config/users.json
```

### 6. Validation on Load

The service validates:
- File exists and is valid JSON
- Has `users` array
- Each user has username, passwordHash, role

If validation fails, server won't start (fail fast).

## Configuration Schema

```json
{
  "users": [
    {
      "username": "string (required, unique)",
      "passwordHash": "string (required, bcrypt)",
      "role": "'admin' | 'user' (required)"
    }
  ]
}
```

## Role Behavior

| Role | Permissions |
|------|-------------|
| admin | Full access to everything |
| user | Basic search and view access |

Check in code with simple conditions:

```typescript
if (user.role === 'admin') {
  // Allow action
}
```

## Anonymous Mode

When `ALLOW_ANONYMOUS=true` in `.env`:
- JWT guard returns `true` immediately
- Frontend skips login page
- All requests bypass authentication

## Security Considerations

- `users.json` in `.gitignore`
- Provide `users.example.json` template
- Bcrypt cost factor 10
- Server crashes on invalid JSON to prevent silent failures

## File Location

Default: `./config/users.json`  
Override with env var: `USERS_CONFIG_PATH=/path/to/users.json`