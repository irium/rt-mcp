import { useAuthStore } from '../store/authStore'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/rutracker'

/**
 * Custom API error class with status and data
 */
export class ApiError extends Error {
  status?: number
  data?: unknown

  constructor(
    message: string,
    status?: number,
    data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Get the authorization header if token exists
 */
function getAuthHeader(): Record<string, string> {
  const token = useAuthStore.getState().token
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

/**
 * Handle 401 responses by clearing auth state
 */
function handleUnauthorized(): void {
  const { logout } = useAuthStore.getState()
  logout()
}

/**
 * Generic fetch wrapper with error handling and auth
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options?.headers,
      },
      ...options,
    })

    if (response.status === 401) {
      handleUnauthorized()
    }

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

/**
 * API client with common HTTP methods
 */
export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),

  post: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, {
      method: 'DELETE',
    }),

  /**
   * GET request that returns a Blob (for file downloads)
   */
  getBlob: async (endpoint: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
    })

    if (response.status === 401) {
      handleUnauthorized()
    }

    if (!response.ok) {
      throw new ApiError(
        `Failed to download: ${response.statusText}`,
        response.status
      )
    }

    return response.blob()
  },
}
