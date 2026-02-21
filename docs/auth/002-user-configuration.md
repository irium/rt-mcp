# Task 2: User Configuration

## Goal

Create a simple JSON-based user configuration system for storing allowed users, their credentials, and custom settings.

## Approach

Use a JSON file for user storage - simple, no database required for a home project.

## Files to Create

```
config/
└── users.json

src/
├── config/
│   └── users.config.ts
└── auth/
    └── interfaces/
        └── user.interface.ts
```

## User Interface

```typescript
interface UserSettings {
  role?: string
  features?: string[]
  [key: string]: unknown  // Allow custom settings
}

interface User {
  username: string
  passwordHash: string  // Not required for "anonymous" user
  settings: UserSettings
}
```

## Anonymous User

Built-in user for anonymous access when `ALLOW_ANONYMOUS=true`:
- Username must be exactly "anonymous"
- No passwordHash required (ignored if present)
- Settings define what anonymous users can do
- Must be explicitly defined in users.json

## Implementation Steps

### 1. Create User Interface

Define types in `src/auth/interfaces/user.interface.ts`:
- `User` - user entity with username, passwordHash, settings
- `UserSettings` - flexible settings object
- `UserConfig` - root config with users array

### 2. Create Users Config File

Create `config/users.json` with default admin user and optional anonymous user:

```json
{
  "users": [
    {
      "username": "admin",
      "passwordHash": "$2b$10$...",
      "settings": {
        "role": "admin",
        "features": ["download", "settings", "mcp"]
      }
    },
    {
      "username": "anonymous",
      "settings": {
        "role": "guest",
        "features": [""]
      }
    }
  ]
}
```

Note: The "anonymous" user is only used when `ALLOW_ANONYMOUS=true`.

### 3. Create Users Config Service

`src/config/users.config.ts`:
- Load users from JSON file
- Provide `getUsers()` method
- Cache users in memory

### 4. Password Hashing Utility

Create utility for generating password hashes:

```bash
# CLI command to generate hash
npm run hash-password -- mypassword
```

### 5. Update Auth Service

- Inject `UsersConfig` into `AuthService`
- Use `getUsers()` to validate credentials
- Include user settings in JWT claims

## Configuration Schema

```json
{
  "users": [
    {
      "username": "string (required)",
      "passwordHash": "string (bcrypt hash, required)",
      "settings": {
        "role": "string (optional)",
        "features": "string[] (optional)",
        "...": "any custom fields"
      }
    }
  ]
}
```

## Feature Definitions

Standard features to support:

| Feature | Description |
|---------|-------------|
| `download` | Can download torrent files |
| `settings` | Can access settings page |
| `mcp` | Can use MCP tools |

## Security Considerations

- `users.json` should be in `.gitignore` for production
- Provide `users.example.json` template
- Password hashes use bcrypt with cost factor 10

## File Location

Place `users.json` in project root or `config/` directory:
- Path configurable via `USERS_CONFIG_PATH` env var
- Default: `./config/users.json`