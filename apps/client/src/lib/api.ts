const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper to set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

// Helper to remove auth token
export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Helper for authenticated requests
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authApi = {
  register: async (data: { email: string; name: string; password: string; role?: string }) => {
    return authFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: { email: string; password: string }) => {
    return authFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  me: async () => {
    return authFetch('/api/auth/me');
  },
};

// Events API
export const eventsApi = {
  list: async (params?: { limit?: number; offset?: number; upcoming?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.upcoming !== undefined) query.append('upcoming', params.upcoming.toString());
    
    return authFetch(`/api/events?${query.toString()}`);
  },

  get: async (id: string | number) => {
    return authFetch(`/api/events/${id}`);
  },

  create: async (data: FormData) => {
    return authFetch('/api/events', {
      method: 'POST',
      body: data,
    });
  },

  update: async (id: string | number, data: FormData) => {
    return authFetch(`/api/events/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  delete: async (id: string | number) => {
    return authFetch(`/api/events/${id}`, {
      method: 'DELETE',
    });
  },
};

// Bookings API
export const bookingsApi = {
  create: async (eventId: number) => {
    return authFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });
  },

  get: async (id: string) => {
    return authFetch(`/api/bookings/${id}`);
  },

  cancel: async (id: string) => {
    return authFetch(`/api/bookings/${id}`, {
      method: 'DELETE',
    });
  },

  getUserBookings: async () => {
    return authFetch('/api/bookings/user/me');
  },
};
