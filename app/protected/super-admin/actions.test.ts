import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as actions from './actions';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => {
  const mockFrom = vi.fn();
  const mockAuth = { 
    getUser: vi.fn(), 
    admin: { createUser: vi.fn() } 
  };
  const mockClient = { auth: mockAuth, from: mockFrom };
  return {
    createClient: vi.fn(() => mockClient),
    createAdminClient: vi.fn(() => mockClient),
  };
});

describe('Super Admin Actions', () => {
  let mockSupabase: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSupabase = await createClient();
  });

  describe('checkSuperAdmin', () => {
    it('should return true for superadmin role', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role: 'superadmin' } })
          })
        })
      });

      const result = await actions.checkSuperAdmin(mockSupabase);
      expect(result).toBe(true);
    });

    it('should return false for non-superadmin role', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-2' } } });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role: 'admin' } })
          })
        })
      });

      const result = await actions.checkSuperAdmin(mockSupabase);
      expect(result).toBe(false);
    });

    it('should return false if no user found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await actions.checkSuperAdmin(mockSupabase);
      expect(result).toBe(false);
    });
  });

  describe('Tenant Actions', () => {
    it('createTenant should verify superadmin and insert to companies', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'employees') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'superadmin' } }) }) })
          };
        }
        if (table === 'companies') {
          return {
            insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'tenant-1', name: 'New Tenant', slug: 'new-tenant' }, error: null }) }) })
          };
        }
        return { insert: async () => ({}) };
      });

      const result = await actions.createTenant('New Tenant');
      expect(result.success).toBe(true);
    });

    it('archiveTenant should update deleted_at', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'employees') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'superadmin' } }) }) })
          };
        }
        if (table === 'companies') {
          return {
            update: () => ({ eq: async () => ({ error: null }) })
          };
        }
        return { insert: async () => ({}) };
      });

      const result = await actions.archiveTenant('tenant-1');
      expect(result.success).toBe(true);
    });
  });

  describe('User Actions', () => {
    it('updateUserRole should update role and company_id', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'employees') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'superadmin', company_id: 'old-co' } }) }) }),
            update: () => ({ eq: async () => ({ error: null }) })
          };
        }
        return { insert: async () => ({}) };
      });

      const result = await actions.updateUserRole('user-1', 'admin', 'new-co');
      expect(result.success).toBe(true);
    });
  });

  describe('Permissions Actions', () => {
    it('updateRolePermission should upsert to role_permissions', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'employees') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'superadmin' } }) }) })
          };
        }
        if (table === 'role_permissions') {
          return {
            upsert: async () => ({ error: null })
          };
        }
        return { insert: async () => ({}) };
      });

      const result = await actions.updateRolePermission('admin', 'telephony', { can_read: true });
      expect(result.success).toBe(true);
    });
  });
});
