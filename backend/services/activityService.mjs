/**
 * Activity log service for tracking user actions.
 * @module services/activityService
 */
import { getDb } from '../data/db.mjs';

/**
 * Logs a user action.
 * @param {number} userId - User's ID.
 * @param {string} action - Action description.
 */
export function logActivity(userId, action) {
  // Get database instance
  const db = getDb();
  // Insert activity log entry
  db.prepare('INSERT INTO activity_logs (user_id, action) VALUES (?, ?)').run(
    userId,
    action
  );
}

/**
 * Gets activity logs with optional filters.
 * @param {Object} filters - Filters (userId, startDate, endDate).
 * @returns {Array} Array of log entries.
 */
export function getActivityLogs(filters = {}) {
  // Get database instance
  const db = getDb();
  // Build dynamic query with filters
  let query = 'SELECT * FROM activity_logs';
  const params = [];
  if (filters.userId) {
    query += ' WHERE user_id = ?';
    params.push(filters.userId);
  }
  if (filters.startDate) {
    query += params.length ? ' AND' : ' WHERE';
    query += ' created_at >= ?';
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    query += params.length ? ' AND' : ' WHERE';
    query += ' created_at <= ?';
    params.push(filters.endDate);
  }
  // Execute query with parameters
  return db.prepare(query).all(...params);
}
