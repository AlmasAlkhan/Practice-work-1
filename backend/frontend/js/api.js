const API = {
  baseURL: '/api',

  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = Storage.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${this.baseURL}${endpoint}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data.message || data.errors?.join(', ') || 'Request failed';
      throw new Error(msg);
    }
    return data;
  },

  register(body) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
  },

  login(body) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
  },

  getProfile() {
    return this.request('/auth/profile');
  },

  getTasks(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.set(k, v);
    });
    return this.request(`/tasks?${query}`);
  },

  createTask(body) {
    return this.request('/tasks', { method: 'POST', body: JSON.stringify(body) });
  },

  updateTask(id, body) {
    return this.request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },

  deleteTask(id) {
    return this.request(`/tasks/${id}`, { method: 'DELETE' });
  },

  getCategories() {
    return this.request('/categories');
  },

  createCategory(body) {
    return this.request('/categories', { method: 'POST', body: JSON.stringify(body) });
  },

  updateCategory(id, body) {
    return this.request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },

  deleteCategory(id) {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  },
};

window.API = API;
