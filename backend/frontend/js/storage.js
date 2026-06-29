const Storage = {
  KEYS: {
    TOKEN: 'planora_token',
    THEME: 'planora_theme',
    FILTERS: 'planora_filters',
  },

  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return localStorage.getItem(key);
    }
  },

  set(key, value) {
    const data = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, data);
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  getToken() {
    return localStorage.getItem(this.KEYS.TOKEN);
  },

  setToken(token) {
    localStorage.setItem(this.KEYS.TOKEN, token);
  },

  clearToken() {
    localStorage.removeItem(this.KEYS.TOKEN);
  },

  getTheme() {
    return localStorage.getItem(this.KEYS.THEME) || 'light';
  },

  setTheme(theme) {
    localStorage.setItem(this.KEYS.THEME, theme);
  },

  getFilters() {
    return this.get(this.KEYS.FILTERS) || { search: '', status: '', priority: '', page: 1, limit: 10 };
  },

  setFilters(filters) {
    this.set(this.KEYS.FILTERS, filters);
  },
};
