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
      const mockAdminClient = {
        from: vi.fn((table: string) => {
          if (table === 'employees') {
            return {
              select: () => ({ ilike: () => ({ maybeSingle: async () => ({ data: null }) }) }),
              upsert: async () => ({ error: null })
            };
          }
          if (table === 'companies') {
            return {
              insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'tenant-1', name: 'New Tenant', slug: 'new-tenant' }, error: null }) }) })
            };
          }
          return { insert: async () => ({}) };
        }),
        auth: { admin: { createUser: vi.fn().mockResolvedValue({ data: { user: { id: 'new-user-1' } }, error: null }) } }
      };
      
      const { createAdminClient } = await import('@/lib/supabase/server');
      (createAdminClient as any).mockReturnValue(mockAdminClient);

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'employees') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'superadmin' } }) }) })
          };
        }
        return { insert: async () => ({}) };
      });

      const result = await actions.createTenant('New Tenant', 'admin@example.com', 'Admin Name', 'pro');
      expect(result.success).toBe(true);
    });

    it('createTenant should return error for missing plan', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'employees') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'superadmin' } }) }) })
          };
        }
        return { insert: async () => ({}) };
      });

      const result = await actions.createTenant('New Tenant', 'admin@example.com', 'Admin Name', '');
      expect(result.success).toBe(false);
      expect(result.fieldErrors?.plan).toBeDefined();
    });

    it('createTenant should return error for duplicate email preflight', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      const mockAdminClient = {
        from: vi.fn((table: string) => {
          if (table === 'employees') {
            return {
              select: () => ({ ilike: () => ({ maybeSingle: async () => ({ data: { id: 'existing' } }) }) }),
            };
          }
          return { insert: async () => ({}) };
        })
      };
      const { createAdminClient } = await import('@/lib/supabase/server');
      (createAdminClient as any).mockReturnValue(mockAdminClient);
      
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'employees') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'superadmin' } }) }) })
          };
        }
        return { insert: async () => ({}) };
      });

      const result = await actions.createTenant('New Tenant', 'admin@example.com', 'Admin Name', 'pro');
      expect(result.success).toBe(false);
      expect(result.fieldErrors?.email).toBeDefined();
    });

    it('createTenant should rollback auth user if company insert fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      const deleteUserMock = vi.fn().mockResolvedValue({ error: null });
      
      const mockAdminClient = {
        from: vi.fn((table: string) => {
          if (table === 'employees') {
            return {
              select: () => ({ ilike: () => ({ maybeSingle: async () => ({ data: null }) }) }),
              delete: () => ({ eq: async () => ({ error: null }) })
            };
          }
          if (table === 'companies') {
            return {
              insert: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error('Insert failed') }) }) })
            };
          }
          return { insert: async () => ({}) };
        }),
        auth: { admin: { createUser: vi.fn().mockResolvedValue({ data: { user: { id: 'new-user-1' } }, error: null }), deleteUser: deleteUserMock } }
      };
      
      const { createAdminClient } = await import('@/lib/supabase/server');
      (createAdminClient as any).mockReturnValue(mockAdminClient);

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'employees') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'superadmin' } }) }) })
          };
        }
        return { insert: async () => ({}) };
      });

      const result = await actions.createTenant('New Tenant', 'admin@example.com', 'Admin Name', 'pro');
      expect(result.success).toBe(false);
      expect(deleteUserMock).toHaveBeenCalledWith('new-user-1');
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
            update: () => ({ eq: () => ({ select: async () => ({ error: null, data: [{ id: 'tenant-1' }] }) }) })
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
      
      const mockAdminClient = {
        from: vi.fn((table: string) => {
          if (table === 'employees') {
            return {
              select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'superadmin', company_id: 'old-co' } }) }) }),
              update: () => ({ eq: () => ({ select: async () => ({ error: null, data: [{ id: 'user-1' }] }) }) })
            };
          }
          return { insert: async () => ({}) };
        })
      };
      const { createAdminClient } = await import('@/lib/supabase/server');
      (createAdminClient as any).mockReturnValue(mockAdminClient);

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

  describe('createAgent', () => {
    it('should reject non-superadmin', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-2' } } });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role: 'admin' } })
          })
        })
      });

      const result = await actions.createAgent({ full_name: 'Test', email_address: 'test@example.com', role: 'sales_agent', company_id: 'uuid' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should reject invalid role', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'employees') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'superadmin' } }) }) })
          };
        }
        return { insert: async () => ({}) };
      });
      const result = await actions.createAgent({ full_name: 'Test', email_address: 'test@example.com', role: 'invalid_role', company_id: 'uuid' });
      expect(result.success).toBe(false);
      expect((result as any).fieldErrors?.role).toBeDefined();
    });

    it('should reject missing company', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'employees') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'superadmin' } }) }) })
          };
        }
        return { insert: async () => ({}) };
      });
      const result = await actions.createAgent({ full_name: 'Test', email_address: 'test@example.com', role: 'sales_agent', company_id: '' });
      expect(result.success).toBe(false);
      expect((result as any).fieldErrors?.company_id).toBeDefined();
    });

    it('should handle success path', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      
      const mockAdminClient = {
        from: vi.fn((table: string) => {
          if (table === 'companies') {
            return {
              select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'company-1' } }) }) })
            };
          }
          if (table === 'employees') {
            return {
              select: () => ({ ilike: () => ({ maybeSingle: async () => ({ data: null }) }) }),
              upsert: () => ({ select: () => ({ maybeSingle: async () => ({ data: { id: 'user-id' }, error: null }) }) })
            };
          }
          return {};
        }),
        auth: { admin: { createUser: vi.fn().mockResolvedValue({ data: { user: { id: 'new-user-1' } }, error: null }) } }
      };
      
      const { createAdminClient } = await import('@/lib/supabase/server');
      (createAdminClient as any).mockReturnValue(mockAdminClient);

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'employees') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'superadmin' } }) }) })
          };
        }
        return { insert: async () => ({}) };
      });

      const result = await actions.createAgent({ full_name: 'Test Agent', email_address: 'test@example.com', role: 'sales_agent', company_id: '12345678-1234-1234-1234-123456789012' });
      expect(result.success).toBe(true);
    });

    it('should rollback when the upsert fails', async () => {
      const deleteUserMock = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      
      const mockAdminClient = {
        from: vi.fn((table: string) => {
          if (table === 'companies') {
            return {
              select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'company-1' } }) }) })
            };
          }
          if (table === 'employees') {
            return {
              select: () => ({ ilike: () => ({ maybeSingle: async () => ({ data: null }) }) }),
              upsert: () => ({ select: () => ({ maybeSingle: async () => ({ data: null, error: new Error('Upsert failed') }) }) })
            };
          }
          return {};
        }),
        auth: { 
          admin: { 
            createUser: vi.fn().mockResolvedValue({ data: { user: { id: 'new-user-1' } }, error: null }),
            deleteUser: deleteUserMock
          } 
        }
      };
      
      const { createAdminClient } = await import('@/lib/supabase/server');
      (createAdminClient as any).mockReturnValue(mockAdminClient);

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'employees') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'superadmin' } }) }) })
          };
        }
        return { insert: async () => ({}) };
      });

      const result = await actions.createAgent({ full_name: 'Test Agent', email_address: 'test@example.com', role: 'sales_agent', company_id: '12345678-1234-1234-1234-123456789012' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('rolled back');
      expect(deleteUserMock).toHaveBeenCalledWith('new-user-1');
    });
  });
});
