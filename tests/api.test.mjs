/**
 * Database test for admin account existence.
 * @module tests/api
 */
import { describe, test, expect } from '@jest/globals';
import { initDb, getDb } from '../backend/data/db.mjs';

describe('Database Tests', () => {
  test('Admin account exists', () => {
    // Initialize database to ensure schema and seed data
    initDb();
    // Get database instance
    const db = getDb();
    // Query for admin user
    const admin = db
      .prepare('SELECT email, role FROM users WHERE email = ?')
      .get('admin@example.com');
    // Verify admin account exists
    expect(admin).toBeDefined();
    // Verify admin email
    expect(admin.email).toBe('admin@example.com');
    // Verify admin role
    expect(admin.role).toBe('admin');
  });
});
