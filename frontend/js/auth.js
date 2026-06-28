const Auth = {
  currentUser: null,

  init() {
    this.bindAuthTabs();
    document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
    document.getElementById('logout-btn').addEventListener('click', () => this.logout());
  },

  bindAuthTabs() {
    document.querySelectorAll('.auth-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const isLogin = tab.dataset.tab === 'login';
        document.getElementById('login-form').classList.toggle('hidden', !isLogin);
        document.getElementById('register-form').classList.toggle('hidden', isLogin);
        this.hideAuthMessage();
      });
    });
  },

  showAuthMessage(text, type = 'error') {
    const el = document.getElementById('auth-message');
    el.textContent = text;
    el.className = `message ${type}`;
    el.classList.remove('hidden');
  },

  hideAuthMessage() {
    document.getElementById('auth-message').classList.add('hidden');
  },

  async handleLogin(e) {
    e.preventDefault();
    Validation.clearErrors(['login-email-error', 'login-password-error']);

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const emailErr = Validation.validateEmail(email);
    const passErr = password ? '' : 'Password is required';
    if (emailErr) Validation.showError('login-email-error', emailErr);
    if (passErr) Validation.showError('login-password-error', passErr);
    if (emailErr || passErr) return;

    try {
      const res = await API.login({ email, password });
      Storage.setToken(res.data.token);
      this.currentUser = res.data.user;
      App.showDashboard();
      App.loadProfile();
      App.loadTasks();
      App.loadCategories();
      this.hideAuthMessage();
    } catch (err) {
      this.showAuthMessage(err.message);
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    Validation.clearErrors(['reg-name-error', 'reg-email-error', 'reg-phone-error', 'reg-password-error']);

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;

    const errors = {
      'reg-name-error': Validation.validateName(name),
      'reg-email-error': Validation.validateEmail(email),
      'reg-phone-error': Validation.validatePhone(phone),
      'reg-password-error': Validation.validatePassword(password),
    };

    let hasError = false;
    Object.entries(errors).forEach(([id, msg]) => {
      if (msg) { Validation.showError(id, msg); hasError = true; }
    });
    if (hasError) return;

    try {
      const res = await API.register({ name, email, password, phone });
      Storage.setToken(res.data.token);
      this.currentUser = res.data.user;
      App.showDashboard();
      App.loadProfile();
      App.loadTasks();
      App.loadCategories();
      this.hideAuthMessage();
    } catch (err) {
      this.showAuthMessage(err.message);
    }
  },

  logout() {
    Storage.clearToken();
    this.currentUser = null;
    document.getElementById('dashboard-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
  },

  async checkSession() {
    const token = Storage.getToken();
    if (!token) return false;
    try {
      const res = await API.getProfile();
      this.currentUser = res.data.user;
      return true;
    } catch {
      Storage.clearToken();
      return false;
    }
  },
};
