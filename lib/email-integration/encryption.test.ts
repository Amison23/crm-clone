import { describe, it, expect, beforeEach } from 'vitest';
import { encryptToken, decryptToken } from './encryption';

describe('Encryption Utils', () => {
  beforeEach(() => {
    process.env.CRM_MASTER_KEY = 'test-secret-key-that-is-32-chars';
  });

  it('encrypts and decrypts correctly', () => {
    const original = 'my-secret-access-token';
    const encrypted = encryptToken(original);
    
    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain(':');
    
    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(original);
  });

  it('throws on invalid format', () => {
    expect(() => decryptToken('invalid-format')).toThrow('Invalid encrypted string format');
  });

  it('handles empty strings', () => {
    expect(encryptToken('')).toBe('');
    expect(decryptToken('')).toBe('');
  });
});
