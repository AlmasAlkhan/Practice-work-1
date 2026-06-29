const App = {
  currentPage: 1,
  totalPages: 1,
  categories: [],

  async init() {
    this.initTheme();
    Auth.init();
    this.bindEvents();

    const hasSession = await Auth.checkSession();
    if (hasSession) {
      this.showDashboard();
      this.restoreFilters();
      await Promise.all([this.loadProfile(), this.loadTasks(), this.loadCategories()]);
    }
  },

  initTheme() {
    const theme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    this.updateThemeIcon(theme);
  },

  toggleTheme() {
    const current = Storage.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    Storage.setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    this.updateThemeIcon(next);
  },

  updateThemeIcon(theme) {
    const icon = theme === 'dark' ? '☀️' : '🌙';
    document.querySelectorAll('.theme-toggle').forEach((btn) => { btn.textContent = icon; });
  },

  bindEvents() {
    document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
    document.getElementById('theme-toggle-auth').addEventListener('click', () => this.toggleTheme());

    document.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => this.switchView(item.dataset.view));
    });

    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    document.getElementById('new-task-btn').addEventListener('click', () => this.openTaskModal());
    document.getElementById('new-category-btn').addEventListener('click', () => this.openCategoryModal());
    document.getElementById('apply-filters').addEventListener('click', () => this.applyFilters());
    document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());
    document.getElementById('clear-filters-empty').addEventListener('click', () => this.clearFilters());
    document.getElementById('search-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.applyFilters();
    });

    document.getElementById('prev-page').addEventListener('click', () => this.changePage(-1));
    document.getElementById('next-page').addEventListener('click', () => this.changePage(1));

    document.getElementById('task-form').addEventListener('submit', (e) => this.handleTaskSubmit(e));
    document.getElementById('category-form').addEventListener('submit', (e) => this.handleCategorySubmit(e));

    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => this.closeModal(btn.dataset.close));
    });

    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', () => {
        backdrop.closest('.modal').classList.add('hidden');
      });
    });
  },

  showDashboard() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.remove('hidden');
    const name = Auth.currentUser?.name?.split(' ')[0] || 'User';
    document.getElementById('user-greeting').textContent = `Hello, ${name}`;
    document.getElementById('hero-welcome').textContent = `Welcome back, ${name}!`;
  },

  updateHeroStats(tasks, categories) {
    document.getElementById('hero-tasks').textContent = tasks ?? '0';
    document.getElementById('hero-categories').textContent = categories ?? '0';
  },

  switchView(view) {
    document.querySelectorAll('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.view === view));
    document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));
    document.getElementById(`${view}-view`).classList.remove('hidden');
    document.getElementById('sidebar').classList.remove('open');

    if (view === 'profile') this.loadProfile();
    if (view === 'tasks') this.loadTasks();
    if (view === 'categories') this.loadCategories();
  },

  restoreFilters() {
    const saved = Storage.getFilters();
    document.getElementById('search-input').value = saved.search || '';
    document.getElementById('status-filter').value = saved.status || '';
    document.getElementById('priority-filter').value = saved.priority || '';
    this.currentPage = saved.page || 1;
    this.updateFilterHint();
  },

  getCurrentFilters() {
    return {
      search: document.getElementById('search-input').value.trim(),
      status: document.getElementById('status-filter').value,
      priority: document.getElementById('priority-filter').value,
      page: this.currentPage,
      limit: 10,
    };
  },

  hasActiveFilters() {
    const f = this.getCurrentFilters();
    return !!(f.search || f.status || f.priority);
  },

  updateFilterHint() {
    const hint = document.getElementById('filter-hint');
    if (!this.hasActiveFilters()) {
      hint.classList.add('hidden');
      hint.textContent = '';
      return;
    }
    const parts = [];
    const f = this.getCurrentFilters();
    if (f.search) parts.push(`search: "${f.search}"`);
    if (f.status) parts.push(`status: ${f.status.replace('_', ' ')}`);
    if (f.priority) parts.push(`priority: ${f.priority}`);
    hint.textContent = `Active filters: ${parts.join(', ')}`;
    hint.classList.remove('hidden');
  },

  clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('priority-filter').value = '';
    this.currentPage = 1;
    this.saveFilters();
    this.updateFilterHint();
    this.loadTasks();
  },

  applyFilters() {
    this.currentPage = 1;
    this.saveFilters();
    this.updateFilterHint();
    this.loadTasks();
  },

  saveFilters() {
    Storage.setFilters(this.getCurrentFilters());
  },

  changePage(delta) {
    const next = this.currentPage + delta;
    if (next < 1 || next > this.totalPages) return;
    this.currentPage = next;
    this.saveFilters();
    this.loadTasks();
  },

  async loadProfile() {
    try {
      const res = await API.getProfile();
      const { user, stats } = res.data;
      Auth.currentUser = user;

      document.getElementById('profile-name').textContent = user.name;
      document.getElementById('profile-email').textContent = user.email;
      document.getElementById('profile-phone').textContent = user.phone || 'No phone provided';
      document.getElementById('profile-joined').textContent = `Joined ${new Date(user.createdAt).toLocaleDateString()}`;
      document.getElementById('profile-avatar').textContent = user.name.charAt(0).toUpperCase();
      document.getElementById('stat-tasks').textContent = stats.tasks;
      document.getElementById('stat-categories').textContent = stats.categories;
      this.updateHeroStats(stats.tasks, stats.categories);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async loadTasks() {
    try {
      const filters = this.getCurrentFilters();
      const res = await API.getTasks({
        search: filters.search,
        status: filters.status,
        priority: filters.priority,
        page: this.currentPage,
        limit: 10,
      });

      this.totalPages = res.pagination.pages;
      this.renderTasks(res.data, res.pagination.total);
      this.renderPagination(res.pagination);
      this.updateFilterHint();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  renderTasks(tasks, totalInDb) {
    const list = document.getElementById('tasks-list');
    const empty = document.getElementById('tasks-empty');
    const emptyText = document.getElementById('tasks-empty-text');
    const clearBtn = document.getElementById('clear-filters-empty');
    const filtersActive = this.hasActiveFilters();

    if (!tasks.length) {
      list.innerHTML = '';
      if (filtersActive && totalInDb > 0) {
        emptyText.textContent = 'No tasks match your current filters. Try clearing filters.';
        clearBtn.classList.remove('hidden');
      } else if (filtersActive) {
        emptyText.textContent = 'No tasks match your current filters.';
        clearBtn.classList.remove('hidden');
      } else {
        emptyText.textContent = 'No tasks found. Create your first task!';
        clearBtn.classList.add('hidden');
      }
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');
    list.innerHTML = tasks.map((task) => {
      const statusLabel = task.status.replace('_', ' ');
      const priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
      const due = task.dueDate ? `<div class="due-date">Due: ${new Date(task.dueDate).toLocaleDateString()}</div>` : '';
      const cat = task.category
        ? `<span class="category-tag"><span class="category-dot" style="background:${task.category.color}"></span>${task.category.name}</span>`
        : '';

      return `
        <div class="task-card" data-id="${task._id}">
          <div class="task-card-header">
            <h3>${this.escape(task.title)}</h3>
          </div>
          <p>${this.escape(task.description || 'No description')}</p>
          ${due}
          <div class="task-meta">
            <span class="badge badge-${task.status}">${statusLabel}</span>
            <span class="badge badge-${task.priority}">${priorityLabel}</span>
            ${cat}
          </div>
          <div class="task-actions">
            <button class="btn btn-ghost btn-sm" onclick="App.editTask('${task._id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="App.deleteTask('${task._id}')">Delete</button>
          </div>
        </div>`;
    }).join('');
  },

  renderPagination(pagination) {
    const el = document.getElementById('pagination');
    if (pagination.total <= pagination.limit) {
      el.classList.add('hidden');
      return;
    }
    el.classList.remove('hidden');
    document.getElementById('page-info').textContent = `Page ${pagination.page} of ${pagination.pages}`;
    document.getElementById('prev-page').disabled = pagination.page <= 1;
    document.getElementById('next-page').disabled = pagination.page >= pagination.pages;
  },

  async loadCategories() {
    try {
      const res = await API.getCategories();
      this.categories = res.data;
      this.renderCategories(res.data);
      this.populateCategorySelect(res.data);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  renderCategories(categories) {
    const list = document.getElementById('categories-list');
    const empty = document.getElementById('categories-empty');

    if (!categories.length) {
      list.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');
    list.innerHTML = categories.map((cat) => `
      <div class="category-card" style="border-left-color:${cat.color}">
        <h3>${this.escape(cat.name)}</h3>
        <p>${this.escape(cat.description || 'No description')}</p>
        <div class="category-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.editCategory('${cat._id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="App.deleteCategory('${cat._id}')">Delete</button>
        </div>
      </div>`).join('');
  },

  populateCategorySelect(categories) {
    const select = document.getElementById('task-category');
    select.innerHTML = '<option value="">No category</option>' +
      categories.map((c) => `<option value="${c._id}">${this.escape(c.name)}</option>`).join('');
  },

  openTaskModal(task = null) {
    document.getElementById('task-modal-title').textContent = task ? 'Edit Task' : 'New Task';
    document.getElementById('task-id').value = task?._id || '';
    document.getElementById('task-title').value = task?.title || '';
    document.getElementById('task-description').value = task?.description || '';
    document.getElementById('task-status').value = task?.status || 'pending';
    document.getElementById('task-priority').value = task?.priority || 'medium';
    document.getElementById('task-category').value = task?.category?._id || task?.category || '';
    document.getElementById('task-due').value = task?.dueDate ? task.dueDate.split('T')[0] : '';
    Validation.clearErrors(['task-title-error']);
    document.getElementById('task-modal').classList.remove('hidden');
  },

  async editTask(id) {
    try {
      const res = await API.getTasks({ limit: 50 });
      const task = res.data.find((t) => t._id === id);
      if (task) this.openTaskModal(task);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async handleTaskSubmit(e) {
    e.preventDefault();
    Validation.clearErrors(['task-title-error']);

    const title = document.getElementById('task-title').value.trim();
    const titleErr = Validation.validateRequired(title, 'Title');
    if (titleErr) { Validation.showError('task-title-error', titleErr); return; }

    const id = document.getElementById('task-id').value;
    const body = {
      title,
      description: document.getElementById('task-description').value.trim(),
      status: document.getElementById('task-status').value,
      priority: document.getElementById('task-priority').value,
      category: document.getElementById('task-category').value || null,
      dueDate: document.getElementById('task-due').value || null,
    };

    try {
      if (id) {
        await API.updateTask(id, body);
        this.showToast('Task updated', 'success');
      } else {
        await API.createTask(body);
        this.showToast('Task created', 'success');
      }
      this.closeModal('task-modal');
      this.loadTasks();
      this.loadProfile();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
      await API.deleteTask(id);
      this.showToast('Task deleted', 'success');
      this.loadTasks();
      this.loadProfile();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  openCategoryModal(category = null) {
    document.getElementById('category-modal-title').textContent = category ? 'Edit Category' : 'New Category';
    document.getElementById('category-id').value = category?._id || '';
    document.getElementById('category-name').value = category?.name || '';
    document.getElementById('category-description').value = category?.description || '';
    document.getElementById('category-color').value = category?.color || '#6366f1';
    Validation.clearErrors(['category-name-error']);
    document.getElementById('category-modal').classList.remove('hidden');
  },

  editCategory(id) {
    const cat = this.categories.find((c) => c._id === id);
    if (cat) this.openCategoryModal(cat);
  },

  async handleCategorySubmit(e) {
    e.preventDefault();
    Validation.clearErrors(['category-name-error']);

    const name = document.getElementById('category-name').value.trim();
    const nameErr = Validation.validateRequired(name, 'Name');
    if (nameErr) { Validation.showError('category-name-error', nameErr); return; }

    const id = document.getElementById('category-id').value;
    const body = {
      name,
      description: document.getElementById('category-description').value.trim(),
      color: document.getElementById('category-color').value,
    };

    try {
      if (id) {
        await API.updateCategory(id, body);
        this.showToast('Category updated', 'success');
      } else {
        await API.createCategory(body);
        this.showToast('Category created', 'success');
      }
      this.closeModal('category-modal');
      this.loadCategories();
      this.loadProfile();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    try {
      await API.deleteCategory(id);
      this.showToast('Category deleted', 'success');
      this.loadCategories();
      this.loadProfile();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  closeModal(id) {
    document.getElementById(id).classList.add('hidden');
  },

  showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  },

  escape(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
