# 🚀 Frontend Migration Plan: Vanilla JS → React + Vite

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Pre-migration Setup](#-pre-migration-setup)
3. [Project Structure](#-project-structure)
4. [Component Migration](#-component-migration)
5. [State Management](#-state-management)
6. [API Integration](#-api-integration)
7. [Backend Integration](#-backend-integration)
8. [Styling Strategy](#-styling-strategy)
9. [Testing](#-testing)
10. [Deployment](#-deployment)
11. [Migration Checklist](#-migration-checklist)
12. [Code Examples](#-code-examples)

---

## 🎯 Overview

### Current State (Vanilla JavaScript)

The current implementation consists of:

- **Files**: `public/index.html`, `public/app.js`, `public/styles.css`
- **Features**:
  - Rutracker search with title, year, and season filters
  - Results table with sorting (name, size, seeders, leechers)
  - HD Video filter toggle
  - Search history (localStorage, max 10 items)
  - Dark/Light theme toggle with system preference detection
  - Toast notifications
  - Details modal for torrent information
  - Magnet link generation and clipboard copy
  - Torrent download functionality
  - Status indicator for backend connection

### Target State (React + Vite)

Modern React application with:

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: Zustand (lightweight, simple)
- **Data Fetching**: TanStack Query (React Query) for server state
- **Table**: TanStack Table for advanced sorting/filtering
- **Styling**: Tailwind CSS + CSS Modules for component-specific styles
- **Testing**: Vitest + React Testing Library + Playwright
- **Type Safety**: Full TypeScript coverage

### Why Migrate?

| Aspect | Current (Vanilla JS) | Future (React + Vite) |
|--------|---------------------|----------------------|
| **Maintainability** | Manual DOM manipulation, scattered state | Component-based, declarative UI |
| **Type Safety** | None | Full TypeScript support |
| **Developer Experience** | Slow reloads, no HMR | Instant HMR, fast builds |
| **Testing** | Difficult to test | Easy component/integration testing |
| **Scalability** | Hard to add features | Modular, easy to extend |
| **Performance** | Manual optimization | Automatic optimizations, code splitting |
| **State Management** | Global variables, localStorage | Proper state management with Zustand |
| **API Handling** | Manual fetch, no caching | React Query with caching, retries |

---

## 🛠️ Pre-migration Setup

### Step 1: Install Dependencies

```bash
# Create new frontend directory
mkdir frontend
cd frontend

# Initialize Vite + React + TypeScript
npm create vite@latest . -- --template react-ts

# Install core dependencies
npm install

# Install UI/State dependencies
npm install zustand @tanstack/react-query @tanstack/react-table

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install utility libraries
npm install clsx tailwind-merge
npm install react-hot-toast # For toast notifications
npm install lucide-react # For icons

# Install dev dependencies
npm install -D @types/node
```

### Step 2: Configure Vite

**`frontend/vite.config.ts`**:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

### Step 3: Configure TypeScript

**`frontend/tsconfig.json`**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 4: Configure Tailwind CSS

**`frontend/tailwind.config.js`**:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
        },
        success: '#10b981',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
```

**`frontend/src/index.css`**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --primary: 37 99 235;
    --success: 16 185 129;
    --danger: 239 68 68;
  }
}
```

### Step 5: Configure ESLint & Prettier

**`frontend/.eslintrc.cjs`**:

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
```

**`frontend/.prettierrc`**:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

---

## 📁 Project Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/          # React components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── search/
│   │   │   ├── SearchForm.tsx
│   │   │   ├── SearchHistory.tsx
│   │   │   └── FilterPanel.tsx
│   │   ├── results/
│   │   │   ├── ResultsTable.tsx
│   │   │   ├── ResultsHeader.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── columns.tsx
│   │   ├── modals/
│   │   │   └── DetailsModal.tsx
│   │   └── ui/              # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Spinner.tsx
│   │       └── Toast.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useSearch.ts
│   │   ├── useSearchHistory.ts
│   │   ├── useTheme.ts
│   │   ├── useTorrentDetails.ts
│   │   └── useClipboard.ts
│   ├── services/            # API services
│   │   ├── api.ts           # Axios/fetch client
│   │   └── rutracker.ts     # Rutracker API methods
│   ├── store/               # Zustand stores
│   │   ├── searchStore.ts
│   │   ├── themeStore.ts
│   │   └── filterStore.ts
│   ├── types/               # TypeScript types
│   │   ├── rutracker.ts
│   │   └── api.ts
│   ├── utils/               # Utility functions
│   │   ├── format.ts        # formatSize, escapeHtml
│   │   ├── storage.ts       # localStorage helpers
│   │   └── cn.ts            # classNames utility
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🧩 Component Migration

### Phase 1: Base Setup & Layout (2-3 hours)

**Tasks**:
1. ✅ Create basic Vite + React + TypeScript project
2. ✅ Set up Tailwind CSS
3. ✅ Create Layout component with Header
4. ✅ Implement ThemeToggle component
5. ✅ Set up theme store with Zustand
6. ✅ Migrate theme logic (localStorage + system preference)

**Components**:
- `Layout.tsx` - Main layout wrapper
- `Header.tsx` - Header with title and status
- `ThemeToggle.tsx` - Theme switcher button

### Phase 2: Search Form (2-3 hours)

**Tasks**:
1. ✅ Create SearchForm component
2. ✅ Create Input component (reusable)
3. ✅ Create Button component (reusable)
4. ✅ Implement form validation
5. ✅ Add loading states
6. ✅ Connect to API with React Query

**Components**:
- `SearchForm.tsx` - Main search form
- `ui/Input.tsx` - Reusable input field
- `ui/Button.tsx` - Reusable button

### Phase 3: Results Table with TanStack Table (4-5 hours)

**Tasks**:
1. ✅ Install and configure TanStack Table
2. ✅ Create ResultsTable component
3. ✅ Define column definitions
4. ✅ Implement sorting functionality
5. ✅ Add action buttons (Magnet, Details, Download)
6. ✅ Create EmptyState component
7. ✅ Add ResultsHeader with count

**Components**:
- `ResultsTable.tsx` - Main table component
- `ResultsHeader.tsx` - Header with count
- `EmptyState.tsx` - Empty state UI
- `columns.tsx` - Column definitions

### Phase 4: Details Modal (2 hours)

**Tasks**:
1. ✅ Create Modal component (reusable)
2. ✅ Create DetailsModal component
3. ✅ Fetch details with React Query
4. ✅ Display torrent information
5. ✅ Add loading state

**Components**:
- `ui/Modal.tsx` - Reusable modal
- `DetailsModal.tsx` - Torrent details modal

### Phase 5: Filter Panel (1-2 hours)

**Tasks**:
1. ✅ Create FilterPanel component
2. ✅ Implement HD Video filter toggle
3. ✅ Create filter store with Zustand
4. ✅ Persist filter state to localStorage
5. ✅ Apply filters to results

**Components**:
- `FilterPanel.tsx` - Filter controls

### Phase 6: Theme Toggle & Settings (1 hour)

**Tasks**:
1. ✅ Finalize theme toggle UI
2. ✅ Add system preference detection
3. ✅ Persist theme to localStorage
4. ✅ Apply theme classes to document

**Already covered in Phase 1**

### Phase 7: Search History (2 hours)

**Tasks**:
1. ✅ Create SearchHistory component
2. ✅ Create useSearchHistory hook
3. ✅ Implement history storage (localStorage)
4. ✅ Add click to re-search functionality
5. ✅ Add remove item functionality
6. ✅ Add clear all functionality

**Components**:
- `SearchHistory.tsx` - History chips

### Phase 8: Toast Notifications (1 hour)

**Tasks**:
1. ✅ Install react-hot-toast
2. ✅ Configure toast provider
3. ✅ Replace all showToast calls
4. ✅ Style toasts to match theme

**Using**: `react-hot-toast` library

---

## 🗄️ State Management

### Why Zustand?

- **Lightweight**: ~1KB gzipped
- **Simple API**: No boilerplate
- **TypeScript**: Excellent TS support
- **No Context**: No provider hell
- **DevTools**: Redux DevTools support

### Store Structure

#### 1. Theme Store

**`src/store/themeStore.ts`**:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', newTheme === 'dark')
          return { theme: newTheme }
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
```

#### 2. Filter Store

**`src/store/filterStore.ts`**:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FilterState {
  hdVideoOnly: boolean
  toggleHDFilter: () => void
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      hdVideoOnly: false,
      toggleHDFilter: () => set((state) => ({ hdVideoOnly: !state.hdVideoOnly })),
    }),
    {
      name: 'filter-storage',
    }
  )
)
```

#### 3. Search Store (Optional - for UI state)

**`src/store/searchStore.ts`**:

```typescript
import { create } from 'zustand'

interface SearchState {
  selectedTorrentId: string | null
  setSelectedTorrentId: (id: string | null) => void
}

export const useSearchStore = create<SearchState>((set) => ({
  selectedTorrentId: null,
  setSelectedTorrentId: (id) => set({ selectedTorrentId: id }),
}))
```

---

## 🌐 API Integration

### React Query Setup

**`src/main.tsx`**:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
)
```

### API Client

**`src/services/api.ts`**:

```typescript
const API_BASE = '/api/rutracker'

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new ApiError(
      `API Error: ${response.statusText}`,
      response.status,
      await response.json().catch(() => null)
    )
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
```

### Rutracker Service

**`src/services/rutracker.ts`**:

```typescript
import { api } from './api'
import type {
  SearchParams,
  SearchResult,
  TorrentDetails,
  StatusResponse,
  MagnetResponse,
  DownloadResponse,
} from '@/types/rutracker'

export const rutrackerService = {
  checkStatus: () => api.get<StatusResponse>('/status'),

  search: (params: SearchParams) =>
    api.post<SearchResult[]>('/search', params),

  getDetails: (torrentId: string) =>
    api.get<TorrentDetails>(`/details/${torrentId}`),

  getMagnetLink: (torrentId: string) =>
    api.get<MagnetResponse>(`/magnet/${torrentId}`),

  downloadTorrent: (torrentId: string) =>
    api.post<DownloadResponse>(`/download/${torrentId}`),
}
```

### TypeScript Types

**`src/types/rutracker.ts`**:

```typescript
export interface SearchParams {
  title: string
  year?: string
  season?: string
}

export interface SearchResult {
  id: string
  name: string
  size: number
  seeders: number
  leechers: number
  forum: string
}

export interface TorrentDetails {
  id: string
  title: string
  magnetLink: string
  downloadLink: string
  content: string
}

export interface StatusResponse {
  isLoggedIn: boolean
}

export interface MagnetResponse {
  magnetLink: string
}

export interface DownloadResponse {
  message: string
}
```

---

## 🔌 Backend Integration

### NestJS CORS Configuration

**`src/main.ts`** (NestJS backend):

```typescript
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
  
  await app.listen(3001)
}
bootstrap()
```

### Vite Proxy Configuration

Already configured in Pre-migration Step 2:

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

### Environment Variables

**`frontend/.env.example`**:

```env
VITE_API_BASE_URL=http://localhost:3001
```

**`frontend/.env.development`**:

```env
VITE_API_BASE_URL=http://localhost:3001
```

**`frontend/.env.production`**:

```env
VITE_API_BASE_URL=https://your-production-api.com
```

---

## 🎨 Styling Strategy

### Approach: Tailwind CSS + CSS Modules

**Why this combination?**

- **Tailwind**: Utility-first, rapid development, consistent design
- **CSS Modules**: Component-specific styles, scoped CSS, no conflicts

### Migration from styles.css

| Current CSS | Tailwind Equivalent |
|-------------|-------------------|
| `var(--primary-color)` | `bg-primary text-primary` |
| `var(--bg-primary)` | `bg-white dark:bg-gray-800` |
| `var(--text-primary)` | `text-gray-900 dark:text-gray-100` |
| `var(--border-color)` | `border-gray-200 dark:border-gray-700` |
| `.btn-primary` | `bg-primary hover:bg-primary-hover text-white` |
| `.loader` | Custom component with Tailwind |

### Dark/Light Theme Implementation

**Using Tailwind's dark mode**:

```typescript
// In ThemeToggle component
const { theme, toggleTheme } = useThemeStore()

useEffect(() => {
  // Apply theme class to document
  document.documentElement.classList.toggle('dark', theme === 'dark')
}, [theme])

// In components, use dark: prefix
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content
</div>
```

### Component-Specific Styles

For complex animations or unique styles, use CSS Modules:

**`ResultsTable.module.css`**:

```css
.tableRow {
  @apply border-b border-gray-200 dark:border-gray-700;
  transition: background-color 0.2s;
}

.tableRow:hover {
  @apply bg-gray-50 dark:bg-gray-700;
}

.sortableHeader {
  @apply cursor-pointer select-none;
  transition: background-color 0.2s;
}

.sortableHeader:hover {
  @apply bg-gray-100 dark:bg-gray-600;
}
```

---

## 🧪 Testing

### Unit Tests with Vitest

**Install**:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**`vitest.config.ts`**:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**`src/test/setup.ts`**:

```typescript
import '@testing-library/jest-dom'
```

### Component Tests

**Example: `SearchForm.test.tsx`**:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SearchForm } from './SearchForm'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('SearchForm', () => {
  it('renders search form', () => {
    render(<SearchForm />, { wrapper })
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/season/i)).toBeInTheDocument()
  })

  it('shows validation error when title is empty', async () => {
    render(<SearchForm />, { wrapper })
    const submitButton = screen.getByRole('button', { name: /search/i })
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a title/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    render(<SearchForm />, { wrapper })
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Titanic' },
    })
    fireEvent.change(screen.getByLabelText(/year/i), {
      target: { value: '1997' },
    })
    
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/searching/i)).toBeInTheDocument()
    })
  })
})
```

### E2E Tests with Playwright

**Install**:

```bash
npm install -D @playwright/test
npx playwright install
```

**`playwright.config.ts`**:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Example E2E Test**:

```typescript
import { test, expect } from '@playwright/test'

test('search flow', async ({ page }) => {
  await page.goto('/')
  
  // Fill search form
  await page.fill('input[name="title"]', 'Titanic')
  await page.fill('input[name="year"]', '1997')
  
  // Submit search
  await page.click('button[type="submit"]')
  
  // Wait for results
  await expect(page.locator('.results-table')).toBeVisible()
  
  // Check results count
  const resultsCount = await page.locator('.results-count').textContent()
  expect(resultsCount).toContain('results found')
})
```

---

## 🚀 Deployment

### Build Configuration

**`package.json`**:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

### Static Hosting (Vercel/Netlify)

**Build Output**: `dist/`

**Vercel Configuration** (`vercel.json`):

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-api.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Netlify Configuration** (`netlify.toml`):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-api.com/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables

Set in hosting platform:

- `VITE_API_BASE_URL` - Backend API URL

---

## ✅ Migration Checklist

### Phase 1: Setup (Day 1) ⏱️ 3-4 hours

- [ ] Create `frontend/` directory
- [ ] Initialize Vite + React + TypeScript
- [ ] Install all dependencies
- [ ] Configure Tailwind CSS
- [ ] Configure TypeScript paths
- [ ] Set up ESLint & Prettier
- [ ] Create basic folder structure
- [ ] Configure Vite proxy for backend

### Phase 2: Core Infrastructure (Day 1-2) ⏱️ 4-5 hours

- [ ] Set up React Query provider
- [ ] Create API client (`services/api.ts`)
- [ ] Create Rutracker service (`services/rutracker.ts`)
- [ ] Define TypeScript types (`types/rutracker.ts`)
- [ ] Create Zustand stores (theme, filter)
- [ ] Create utility functions (format, storage, cn)
- [ ] Set up toast notifications (react-hot-toast)

### Phase 3: Layout & Theme (Day 2) ⏱️ 2-3 hours

- [ ] Create Layout component
- [ ] Create Header component
- [ ] Create ThemeToggle component
- [ ] Implement theme persistence
- [ ] Add system preference detection
- [ ] Style with Tailwind

### Phase 4: Search Form (Day 2-3) ⏱️ 3-4 hours

- [ ] Create SearchForm component
- [ ] Create reusable Input component
- [ ] Create reusable Button component
- [ ] Implement form validation
- [ ] Add loading states
- [ ] Create useSearch hook with React Query
- [ ] Test search functionality

### Phase 5: Results Table (Day 3-4) ⏱️ 5-6 hours

- [ ] Install TanStack Table
- [ ] Create ResultsTable component
- [ ] Define column definitions
- [ ] Implement sorting
- [ ] Create ResultsHeader component
- [ ] Create EmptyState component
- [ ] Add action buttons (Magnet, Details, Download)
- [ ] Implement clipboard copy
- [ ] Style table with Tailwind

### Phase 6: Filters (Day 4) ⏱️ 2 hours

- [ ] Create FilterPanel component
- [ ] Implement HD Video filter
- [ ] Connect to filter store
- [ ] Apply filters to results
- [ ] Persist filter state

### Phase 7: Details Modal (Day 4-5) ⏱️ 2-3 hours

- [ ] Create reusable Modal component
- [ ] Create DetailsModal component
- [ ] Create useTorrentDetails hook
- [ ] Fetch and display details
- [ ] Add loading state
- [ ] Style modal

### Phase 8: Search History (Day 5) ⏱️ 2-3 hours

- [ ] Create SearchHistory component
- [ ] Create useSearchHistory hook
- [ ] Implement localStorage persistence
- [ ] Add click to re-search
- [ ] Add remove item functionality
- [ ] Add clear all functionality
- [ ] Style history chips

### Phase 9: Testing (Day 6) ⏱️ 4-5 hours

- [ ] Set up Vitest
- [ ] Write unit tests for utilities
- [ ] Write component tests for SearchForm
- [ ] Write component tests for ResultsTable
- [ ] Set up Playwright
- [ ] Write E2E test for search flow
- [ ] Write E2E test for theme toggle

### Phase 10: Polish & Deploy (Day 6-7) ⏱️ 3-4 hours

- [ ] Add loading skeletons
- [ ] Optimize performance (React.memo, useMemo)
- [ ] Add error boundaries
- [ ] Test on different browsers
- [ ] Build for production
- [ ] Deploy to Vercel/Netlify
- [ ] Configure environment variables
- [ ] Test production build

### Phase 11: Documentation (Day 7) ⏱️ 2 hours

- [ ] Update README.md
- [ ] Document component API
- [ ] Add JSDoc comments
- [ ] Create deployment guide

---

## 💻 Code Examples

### Example 1: SearchForm Component

**`src/components/search/SearchForm.tsx`**:

```typescript
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { rutrackerService } from '@/services/rutracker'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { SearchParams } from '@/types/rutracker'

interface SearchFormProps {
  onSearchSuccess?: () => void
}

export function SearchForm({ onSearchSuccess }: SearchFormProps) {
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [season, setSeason] = useState('')

  const searchMutation = useMutation({
    mutationFn: (params: SearchParams) => rutrackerService.search(params),
    onSuccess: (data) => {
      toast.success(`Found ${data.length} results`)
      onSearchSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    searchMutation.mutate({
      title: title.trim(),
      year: year.trim() || undefined,
      season: season.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title *"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Титаник, Titanic"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Year (optional)"
          name="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="e.g., 2023"
        />

        <Input
          label="Season (optional)"
          name="season"
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          placeholder="e.g., 1, 2"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={searchMutation.isPending}
      >
        Search
      </Button>
    </form>
  )
}
```

### Example 2: useSearch Hook with React Query

**`src/hooks/useSearch.ts`**:

```typescript
import { useQuery } from '@tanstack/react-query'
import { rutrackerService } from '@/services/rutracker'
import { useFilterStore } from '@/store/filterStore'
import type { SearchParams, SearchResult } from '@/types/rutracker'

export function useSearch(params: SearchParams | null) {
  const { hdVideoOnly } = useFilterStore()

  const query = useQuery({
    queryKey: ['search', params],
    queryFn: () => rutrackerService.search(params!),
    enabled: !!params,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Apply HD filter
  const filteredResults = query.data?.filter((result) => {
    if (!hdVideoOnly) return true
    return result.forum.includes('HD Video') || result.forum.includes('HD Видео')
  })

  return {
    ...query,
    results: filteredResults || [],
    totalResults: query.data?.length || 0,
    filteredCount: filteredResults?.length || 0,
  }
}
```

### Example 3: Zustand Store with Persistence

**`src/store/themeStore.ts`**:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  initTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },
      
      initTheme: () => {
        const { theme } = get()
        
        // Check system preference if no saved theme
        if (!localStorage.getItem('theme-storage')) {
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches
          get().setTheme(prefersDark ? 'dark' : 'light')
        } else {
          get().setTheme(theme)
        }
        
        // Listen for system theme changes
        window
          .matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', (e) => {
            if (!localStorage.getItem('theme-storage')) {
              get().setTheme(e.matches ? 'dark' : 'light')
            }
          })
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)
```

### Example 4: API Client with Error Handling

**`src/services/api.ts`**:

```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/rutracker'

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new ApiError(
        errorData?.message || `API Error: ${response.statusText}`,
        response.status,
        errorData
      )
    }

    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network error
    throw new ApiError(
      'Network error. Please check your connection.',
      undefined,
      error
    )
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  
  post: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
```

### Example 5: TanStack Table Column Definitions

**`src/components/results/columns.tsx`**:

```typescript
import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@/components/ui/Button'
import { formatSize } from '@/utils/format'
import type { SearchResult } from '@/types/rutracker'

const columnHelper = createColumnHelper<SearchResult>()

export const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {info.getValue()}
      </span>
    ),
  }),
  
  columnHelper.accessor('size', {
    header: 'Size',
    cell: (info) => formatSize(info.getValue()),
  }),
  
  columnHelper.accessor('seeders', {
    header: 'Seeders',
    cell: (info) => (
      <span className="text-green-600 dark:text-green-400">
        {info.getValue()}
      </span>
    ),
  }),
  
  columnHelper.accessor('leechers', {
    header: 'Leechers',
    cell: (info) => (
      <span className="text-red-600 dark:text-red-400">
        {info.getValue()}
      </span>
    ),
  }),
  
  columnHelper.accessor('forum', {
    header: 'Forum',
    cell: (info) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {info.getValue()}
      </span>
    ),
  }),
  
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="success"
          onClick={() => handleMagnet(row.original.id)}
        >
          🧲 Magnet
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => handleDetails(row.original.id)}
        >
          📄 Details
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => handleDownload(row.original.id)}
        >
          ⬇️ Download
        </Button>
      </div>
    ),
  }),
]

// Action handlers
function handleMagnet(id: string) {
  // Implementation
}

function handleDetails(id: string) {
  // Implementation
}

function handleDownload(id: string) {
  // Implementation
}
```

---

## 📊 Estimated Timeline

| Phase | Duration | Complexity |
|-------|----------|-----------|
| Setup & Configuration | 3-4 hours | Low |
| Core Infrastructure | 4-5 hours | Medium |
| Layout & Theme | 2-3 hours | Low |
| Search Form | 3-4 hours | Medium |
| Results Table | 5-6 hours | High |
| Filters | 2 hours | Low |
| Details Modal | 2-3 hours | Medium |
| Search History | 2-3 hours | Medium |
| Testing | 4-5 hours | Medium |
| Polish & Deploy | 3-4 hours | Medium |
| Documentation | 2 hours | Low |

**Total Estimated Time**: 32-42 hours (~5-7 working days)

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Table](https://tanstack.com/table/latest)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🚨 Common Pitfalls & Solutions

### 1. State Management Confusion

**Problem**: Mixing server state (React Query) with client state (Zustand)

**Solution**: 
- Use React Query for **server state** (API data, caching)
- Use Zustand for **client state** (UI state, preferences)

### 2. Over-fetching

**Problem**: Making unnecessary API calls

**Solution**: 
- Configure React Query `staleTime` appropriately
- Use `enabled` option to conditionally fetch

### 3. Theme Flashing

**Problem**: Theme flashes on page load

**Solution**: 
- Initialize theme in `index.html` with inline script
- Or use `useLayoutEffect` instead of `useEffect`

### 4. TypeScript Errors

**Problem**: Type errors with API responses

**Solution**: 
- Define proper types in `types/` directory
- Use type guards for runtime validation
- Consider using Zod for schema validation

---

## ✨ Future Enhancements

After migration is complete, consider:

1. **Advanced Filtering**: Multiple filters, saved filter presets
2. **Pagination**: For large result sets
3. **Infinite Scroll**: Alternative to pagination
4. **Keyboard Shortcuts**: Power user features
5. **PWA**: Offline support, install prompt
6. **i18n**: Multi-language support
7. **Analytics**: Track user behavior
8. **Advanced Search**: Boolean operators, regex
9. **Favorites**: Save favorite torrents
10. **Notifications**: Browser notifications for new results

---

## 📝 Notes

- This plan assumes familiarity with React and TypeScript
- Adjust timeline based on team size and experience
- Consider pair programming for complex components
- Regular code reviews recommended
- Keep the old vanilla JS version until migration is complete and tested
- Deploy to staging environment first before production

---

**Created**: 2026-02-15  
**Version**: 1.0  
**Status**: Ready for Implementation 🚀
