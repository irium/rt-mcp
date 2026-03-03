# Task 4: Role-Based Permissions

## Goal

Role-based access control using user roles.

## How It Works

- Users have a `role` field: `'admin'` or `'user'`
- Components check role with simple conditionals
- Backend can check role from JWT payload if needed

## Frontend: Role Checks

### Direct Check in Components

```tsx
import { useAuthStore } from '../../store/authStore'

export function ResultsTable() {
  const user = useAuthStore(state => state.user)

  return (
    <div>
      {/* Admin-only button */}
      {user?.role === 'admin' && (
        <Button>Download</Button>
      )}
      
      {/* Everyone */}
      <SearchResults />
    </div>
  )
}
```

### Helper Hook (Optional)

If you want to extract the logic:

`frontend/src/hooks/useRole.ts`:

```typescript
import { useAuthStore } from '../store/authStore'

export function useRole() {
  const user = useAuthStore(state => state.user)
  
  return {
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    role: user?.role,
  }
}

// Usage
const { isAdmin } = useRole()
if (isAdmin) {
  // Show admin features
}
```

## Backend: Role Guards (Optional)

If you need to protect specific routes:

`src/auth/guards/role.guard.ts`:

```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>('role', context.getHandler())
    if (!requiredRole) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user
    
    return user?.role === requiredRole
  }
}
```

`src/auth/decorators/role.decorator.ts`:

```typescript
export const RequireRole = (role: string) => SetMetadata('role', role)

// Usage
@RequireRole('admin')
@Get('admin-only')
adminEndpoint() {
  // Only accessible by admin
}
```

For simple use cases, you can check `req.user.role === 'admin'` directly in the controller.

## Permission Matrix

| Feature | Admin | User |
|---------|-------|------|
| Search | ✓ | ✓ |
| View results | ✓ | ✓ |
| Download torrents | ✓ | ✗ |
| Access settings | ✓ | ✗ |
| Use MCP tools | ✓ | ✗ |

Adjust based on your needs. This is just an example.

## Example Updates

### Header.tsx

```tsx
export function Header() {
  const { user, logout } = useAuthStore()

  return (
    <header>
      <nav>
        <Link to="/">Search</Link>
        {user?.role === 'admin' && (
          <Link to="/settings">Settings</Link>
        )}
      </nav>
      <Button onClick={logout}>Logout</Button>
    </header>
  )
}
```

### ResultCard.tsx or ResultsTable.tsx

```tsx
export function ResultCard({ result }) {
  const { isAdmin } = useRole()

  return (
    <div>
      <h3>{result.title}</h3>
      {isAdmin && (
        <Button onClick={() => downloadTorrent(result.id)}>
          Download
        </Button>
      )}
    </div>
  )
}
```

## Summary

Role checks are straightforward:

```tsx
{user?.role === 'admin' && <AdminFeature />}
```