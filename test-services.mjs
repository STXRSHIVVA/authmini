import { initDb } from './backend/data/db.mjs';
import { updateUserProfile } from './backend/services/userService.mjs';
import { logActivity } from './backend/services/activityService.mjs';
// Initialize database
initDb();
// Test profile update
updateUserProfile(1, {
  display_name: 'Admin',
  bio: 'Admin bio',
  avatar_url: '',
});
// Test activity logging
logActivity(1, 'Profile updated');
console.log('Services tested');