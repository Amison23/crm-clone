import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as actions from './actions';
import { createClient } from '@/lib/supabase/server';

// helper to get the mocked supabase client
const getMockSupabase = () => {
  const client = (createClient as any)();
  return client;
};

describe('Super Admin Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkSuperAdmin', () => {
    it('should return true for superadmin role', async () => {
      const mockSupabase = getMockSupabase();
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
      mockSupabase.from().select().eq().single.mockResolvedValue({ data: { role: 'superadmin' } });

      const result = await actions.checkSuperAdmin(mockSupabase);
      expect(result).toBe(true);
    });

    it('should return false for non-superadmin role', async () => {
      const mockSupabase = getMockSupabase();
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-2' } } });
      mockSupabase.from().select().eq().single.mockResolvedValue({ data: { role: 'admin' } });

      const result = await actions.checkSuperAdmin(mockSupabase);
      expect(result).toBe(false);
    });

    it('should return false if no user found', async () => {
      const mockSupabase = getMockSupabase();
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await actions.checkSuperAdmin(mockSupabase);
      expect(result).toBe(false);
    });
  });

  describe('Tenant Actions', () => {
    it('createTenant should verify superadmin and insert to companies', async () => {
      const mockSupabase = getMockSupabase();
      // Mock superadmin check
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      mockSupabase.from.withArgs('employees').select().eq().single.mockResolvedValue({ data: { role: 'superadmin' } });
      
      // Mock insert
      mockSupabase.from.withArgs('companies').insert().select().single.mockResolvedValue({ data: { id: 'tenant-1', name: 'New Tenant' }, error: null });

      const result = await actions.createTenant('New Tenant');
      
      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('companies');
    });

    it('archiveTenant should update deleted_at', async () => {
      const mockSupabase = getMockSupabase();
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      mockSupabase.from.withArgs('employees').select().eq().single.mockResolvedValue({ data: { role: 'superadmin' } });
      
      mockSupabase.from.withArgs('companies').update().eq.mockResolvedValue({ error: null });

      const result = await actions.archiveTenant('tenant-1');
      expect(result.success).toBe(true);
    });
  });

  describe('User Actions', () => {
    it('updateUserRole should update role and company_id', async () => {
      const mockSupabase = getMockSupabase();
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      mockSupabase.from.withArgs('employees').select().eq().single.mockResolvedValueOnce({ data: { role: 'superadmin' } });
      
      // Mock fetch old state
      mockSupabase.from.withArgs('employees').select().eq().single.mockResolvedValueOnce({ data: { role: 'sales_agent', company_id: 'old-co' } });
      
      // Mock update
      mockSupabase.from.withArgs('employees').update().eq.mockResolvedValue({ error: null });

      const result = await actions.updateUserRole('user-1', 'admin', 'new-co');
      expect(result.success).toBe(true);
    });
  });

  describe('Permissions Actions', () => {
    it('updateRolePermission should upsert to role_permissions', async () => {
      const mockSupabase = getMockSupabase();
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
      mockSupabase.from.withArgs('employees').select().eq().single.mockResolvedValue({ data: { role: 'superadmin' } });
      
      mockSupabase.from.withArgs('role_permissions').upsert().mockResolvedValue({ error: null });

      const result = await actions.updateRolePermission('admin', 'telephony', { can_view: true });
      expect(result.success).toBe(true);
    });
  });
});
