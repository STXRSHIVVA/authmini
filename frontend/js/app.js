/**
 * SPA state and navigation for AuthMini.
 * @module js/app
 */
function app() {
  return {
    user: null,
    users: [],
    search: '',
    showProfile: false,
    loading: false,
    /**
     * Initializes SPA state based on stored token.
     * @async
     */
    async init() {
      // Check for stored JWT token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decode token payload
          const payload = JSON.parse(atob(token.split('.')[1]));
          // Set user state
          this.user = { email: payload.email, role: payload.role };
          // Fetch users for admin dashboard
          if (this.user.role === 'admin') {
            await this.fetchUsers();
          }
        } catch (err) {
          // Clear invalid token
          localStorage.removeItem('token');
        }
      }
    },
    /**
     * Fetches users for admin dashboard.
     * @async
     */
    async fetchUsers() {
      // Set loading state
      this.loading = true;
      try {
        // Get stored token
        const token = localStorage.getItem('token');
        // Fetch users with search query
        const res = await axios.get(`/api/users?search=${this.search}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Update users list
        this.users = res.data.users;
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        // Clear loading state
        this.loading = false;
      }
    },
    /**
     * Toggles user active status.
     * @param {number} userId - User's ID.
     * @param {boolean} isActive - Active status.
     * @async
     */
    async toggleUser(userId, isActive) {
      // Set loading state
      this.loading = true;
      try {
        // Get stored token
        const token = localStorage.getItem('token');
        // Send toggle request
        await axios.post(
          `/api/users/${userId}/toggle`,
          { isActive },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Refresh user list
        await this.fetchUsers();
      } catch (err) {
        console.error('Failed to toggle user:', err);
      } finally {
        // Clear loading state
        this.loading = false;
      }
    },
    /**
     * Logs out user and resets UI.
     */
    logout() {
      // Clear token and reload page
      localStorage.removeItem('token');
      window.location.reload();
    },
  };
}

// Register Alpine.js component
window.app = app;
