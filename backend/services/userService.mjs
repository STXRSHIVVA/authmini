/**
 * User service for managing user operations.
 * @module services/userService
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { getDb } from '../data/db.mjs';
import { logActivity } from './activityService.mjs';

// Load environment variables
config();

/**
 * Registers a new user.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Object} Object containing user ID.
 * @throws {Error} If email already exists.
 * @async
 */
export async function registerUser(email, password) {
  // Get database instance
  const db = getDb();
  // Check for existing user
  const existingUser = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(email);
  if (existingUser) {
    throw new Error('Email already exists');
  }
  // Hash password for secure storage
  const passwordHash = await bcrypt.hash(password, 10);
  // Insert new user into database
  const user = db
    .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    .run(email, passwordHash);
  // Log registration activity
  logActivity(user.lastInsertRowid, 'User registered');
  return { id: user.lastInsertRowid };
}

/**
 * Logs in a user and generates a JWT token.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Object} Object containing token and user data.
 * @throws {Error} If credentials are invalid or account is disabled.
 * @async
 */
export async function loginUser(email, password) {
  // Retrieve user by email
  const user = getUserByEmail(email);
  // Validate user existence, active status, and password
  if (
    !user ||
    !user.is_active ||
    !(await bcrypt.compare(password, user.password_hash))
  ) {
    throw new Error('Invalid credentials or account disabled');
  }
  // Generate JWT token with user details
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  // Log login activity
  logActivity(user.id, 'User logged in');
  return { token, user: { email: user.email, role: user.role } };
}

/**
 * Gets a user by email.
 * @param {string} email - User's email.
 * @returns {Object|null} User object or null.
 */
export function getUserByEmail(email) {
  // Get database instance
  const db = getDb();
  // Query user by email
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

/**
 * Updates a user's profile.
 * @param {number} userId - User's ID.
 * @param {Object} profileData - Profile data (display_name, bio, avatar_url).
 * @returns {Object} Updated profile.
 */
export function updateUserProfile(userId, profileData) {
  // Get database instance
  const db = getDb();
  // Insert or update profile data
  db.prepare(
    'INSERT OR REPLACE INTO profiles (user_id, display_name, bio, avatar_url) VALUES (?, ?, ?, ?)'
  ).run(
    userId,
    profileData.display_name,
    profileData.bio,
    profileData.avatar_url
  );
  return profileData;
}

/**
 * Updates a user's settings.
 * @param {number} userId - User's ID.
 * @param {Object} settingsData - Settings data (theme, notifications).
 * @returns {Object} Updated settings.
 */
export function updateUserSettings(userId, settingsData) {
  // Get database instance
  const db = getDb();
  // Insert or update settings data
  db.prepare(
    'INSERT OR REPLACE INTO settings (user_id, theme, notifications) VALUES (?, ?, ?)'
  ).run(userId, settingsData.theme, settingsData.notifications);
  return settingsData;
}

/**
 * Changes a user's password.
 * @param {number} userId - User's ID.
 * @param {string} newPassword - New password.
 * @async
 */
export async function changeUserPassword(userId, newPassword) {
  // Get database instance
  const db = getDb();
  // Hash new password for secure storage
  const passwordHash = await bcrypt.hash(newPassword, 10);
  // Update user password in database
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
    passwordHash,
    userId
  );
}

/**
 * Toggles a user's active status.
 * @param {number} userId - User's ID.
 * @param {boolean} isActive - Active status.
 */
export function toggleUserActive(userId, isActive) {
  // Get database instance
  const db = getDb();
  // Update user active status
  db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(
    isActive ? 1 : 0,
    userId
  );
}
