/**
 * Profile and settings component.
 * @module js/profile
 */
function profileComponent() {
  return {
    profile: { display_name: '', bio: '', avatar_url: '' },
    settings: { theme: 'light', notifications: true },
    password: '',
    error: '',
    loading: false,
    /**
     * Initializes profile and settings data.
     * @async
     */
    async init() {
      try {
        // Get stored token
        const token = localStorage.getItem('token');
        // Fetch profile and settings
        const res = await axios.get('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Update profile and settings
        this.profile = res.data.profile || this.profile;
        this.settings = res.data.settings || this.settings;
      } catch (err) {
        // Display error message
        this.error = 'Failed to load profile';
      }
    },
    /**
     * Saves profile, settings, and password.
     * @async
     */
    async saveProfile() {
      // Set loading state
      this.loading = true;
      try {
        // Get stored token
        const token = localStorage.getItem('token');
        // Save profile data
        await axios.post('/api/profile', this.profile, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Save settings data
        await axios.post('/api/settings', this.settings, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Save new password if provided
        if (this.password) {
          await axios.post(
            '/api/password',
            { newPassword: this.password },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        // Show success message
        this.error = 'Profile saved successfully';
      } catch (err) {
        // Display error message
        this.error = err.response?.data?.error || 'Failed to save profile';
      } finally {
        // Clear loading state
        this.loading = false;
      }
    },
  };
}

// Register Alpine.js component
window.profileComponent = profileComponent;
