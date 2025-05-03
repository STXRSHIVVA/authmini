/**
 * Authentication component with form validation.
 * @module js/auth
 */
function authComponent() {
  return {
    email: '',
    password: '',
    error: '',
    errors: { email: '', password: '' },
    /**
     * Validates form inputs.
     */
    validate() {
      // Check email format
      this.errors.email = this.email.includes('@') ? '' : 'Invalid email';
      // Check password length
      this.errors.password =
        this.password.length >= 6 ? '' : 'Password must be 6+ characters';
    },
    /**
     * Submits register or login request.
     * @param {string} action - 'register' or 'login'.
     * @async
     */
    async submit(action) {
      // Run validation
      this.validate();
      // Block submission if errors exist
      if (this.errors.email || this.errors.password) return;
      try {
        // Send register or login request
        const res = await axios.post(`/api/${action}`, {
          email: this.email,
          password: this.password,
        });
        if (action === 'login') {
          // Store token and reload page
          localStorage.setItem('token', res.data.token);
          window.location.reload();
        } else {
          // Show registration success message
          this.error = 'Registration successful. Please login.';
        }
      } catch (err) {
        // Display error message
        this.error = err.response?.data?.error || 'An error occurred';
      }
    },
  };
}

// Register Alpine.js component
window.authComponent = authComponent;
