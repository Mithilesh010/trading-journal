const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Helper to get auth headers
 */
const getAuthHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

/**
 * Handle API responses and uniform error handling
 */
const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      const errorMsg = data.error || data.message || 'An error occurred. Please try again.';
      throw new Error(errorMsg);
    }
    return data;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return res;
};

export const api = {
  // Authentication
  signup: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Trades
  getTrades: async (filters = {}) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/trades${qs}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getTrade: async (id) => {
    const res = await fetch(`${API_BASE}/trades/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  createTrade: async (tradeData) => {
    const isMultipart = tradeData instanceof FormData;
    const res = await fetch(`${API_BASE}/trades`, {
      method: 'POST',
      headers: getAuthHeaders(isMultipart),
      body: isMultipart ? tradeData : JSON.stringify(tradeData)
    });
    return handleResponse(res);
  },

  updateTrade: async (id, tradeData) => {
    const isMultipart = tradeData instanceof FormData;
    const res = await fetch(`${API_BASE}/trades/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(isMultipart),
      body: isMultipart ? tradeData : JSON.stringify(tradeData)
    });
    return handleResponse(res);
  },

  deleteTrade: async (id) => {
    const res = await fetch(`${API_BASE}/trades/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getTradeScreenshotBlobUrl: async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/trades/${id}/screenshot`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Could not load screenshot');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },

  // Dashboard
  getDashboard: async () => {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Journal
  getJournals: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/journal${qs}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getJournal: async (id) => {
    const res = await fetch(`${API_BASE}/journal/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  createJournal: async (data) => {
    const res = await fetch(`${API_BASE}/journal`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateJournal: async (id, data) => {
    const res = await fetch(`${API_BASE}/journal/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  deleteJournal: async (id) => {
    const res = await fetch(`${API_BASE}/journal/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Profile
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Export
  exportExcel: async (range = 'all') => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/export/excel?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to export Excel file.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading_terminal_${range}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  exportPdf: async (range = 'all') => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/export/pdf?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to export PDF file.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading_terminal_${range}_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};
