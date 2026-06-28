const Validation = {
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  phoneRegex: /^\+?[\d\s\-()]{7,20}$/,

  validateEmail(email) {
    if (!email) return 'Email is required';
    if (!this.emailRegex.test(email)) return 'Invalid email format';
    return '';
  },

  validatePassword(password) {
    if (!password) return 'Password is required';
    if (!this.passwordRegex.test(password)) {
      return 'Password must be 8+ chars with uppercase, lowercase, and a number';
    }
    return '';
  },

  validateName(name) {
    if (!name || name.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  },

  validatePhone(phone) {
    if (!phone) return '';
    if (!this.phoneRegex.test(phone)) return 'Invalid phone format';
    return '';
  },

  validateRequired(value, fieldName) {
    if (!value || !value.trim()) return `${fieldName} is required`;
    return '';
  },

  showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
  },

  clearErrors(ids) {
    ids.forEach((id) => this.showError(id, ''));
  },
};
