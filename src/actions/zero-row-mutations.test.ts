import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

const mockLogAuditAction = vi.fn();
vi.mock('@/lib/audit', () => ({
  logAuditAction: (...args: unknown[]) => mockLogAuditAction(...args),
}));

const mockRequireAdmin = vi.fn();
const mockRequireUser = vi.fn();
const mockGetDependentGuardian = vi.fn();
vi.mock('@/lib/auth-guard', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
  requireUser: (...args: unknown[]) => mockRequireUser(...args),
  getDependentGuardian: (...args: unknown[]) => mockGetDependentGuardian(...args),
}));

const mockGetCurrentUser = vi.fn();
vi.mock('@/data/domains/auth', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  ALL_ADMIN_PERMISSIONS: [
    'canManageUsers',
    'canManageInstructors',
    'canManagePublishers',
    'canManageCatalog',
    'canManageSubscriptions',
    'canManageOrders',
    'canManageBookings',
    'canManageSupport',
    'canManageContent',
    'canManageFinance',
    'canViewAuditLogs',
  ],
}));

let mockSupabase: any;
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => Promise.resolve(mockSupabase),
}));

import { updateUserRole } from '@/actions/admin-users';
import { updateAdminPermissions } from '@/actions/admin-permissions';
import { cancelDependentRequest } from '@/actions/dependent-requests';

describe('Zero-Row Mutation Hardening Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. updateUserRole (src/actions/admin-users.ts)', () => {
    it('returns success when row is successfully updated', async () => {
      mockRequireAdmin.mockResolvedValue({
        id: 'admin-1',
        fullName: 'Super Admin',
        role: 'super_admin',
      });

      const maybeSingleMock = vi.fn().mockResolvedValue({ data: { id: 'target-user-1' }, error: null });
      const selectMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqMock = vi.fn().mockReturnValue({ select: selectMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ update: updateMock });

      mockSupabase = { from: fromMock };

      const result = await updateUserRole('target-user-1', 'general_supervisor');

      expect(result).toEqual({ ok: true });
      expect(fromMock).toHaveBeenCalledWith('user_profiles');
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'general_supervisor' })
      );
      expect(eqMock).toHaveBeenCalledWith('id', 'target-user-1');
      expect(selectMock).toHaveBeenCalledWith('id');
      expect(mockLogAuditAction).toHaveBeenCalled();
    });

    it('returns failure when 0 rows are affected (no matching row)', async () => {
      mockRequireAdmin.mockResolvedValue({
        id: 'admin-1',
        fullName: 'Super Admin',
        role: 'super_admin',
      });

      // maybeSingle returns null when 0 rows were updated
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const selectMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqMock = vi.fn().mockReturnValue({ select: selectMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ update: updateMock });

      mockSupabase = { from: fromMock };

      const result = await updateUserRole('non-existent-user', 'student');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('المستخدم غير موجود أو تعذّر تحديث دوره');
      }
      expect(mockLogAuditAction).not.toHaveBeenCalled();
    });

    it('enforces authorization restriction (non-admin rejection)', async () => {
      mockRequireAdmin.mockRejectedValue(new Error('غير مصرح لك بتعديل أدوار المستخدمين'));

      await expect(updateUserRole('target-user-1', 'student')).rejects.toThrow(
        'غير مصرح لك بتعديل أدوار المستخدمين'
      );
      expect(mockLogAuditAction).not.toHaveBeenCalled();
    });
  });

  describe('2. updateAdminPermissions (src/actions/admin-permissions.ts)', () => {
    it('returns success when row is successfully updated', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'super-admin-1',
        fullName: 'Super Admin',
        role: 'super_admin',
      });

      const maybeSingleMock = vi.fn().mockResolvedValue({ data: { id: 'target-user-2' }, error: null });
      const selectMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqMock = vi.fn().mockReturnValue({ select: selectMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ update: updateMock });

      mockSupabase = { from: fromMock };

      const result = await updateAdminPermissions({
        userId: 'target-user-2',
        permissions: ['canManageUsers', 'canManageOrders'],
        useRoleDefault: false,
      });

      expect(result).toEqual({ ok: true });
      expect(fromMock).toHaveBeenCalledWith('user_profiles');
      expect(eqMock).toHaveBeenCalledWith('id', 'target-user-2');
      expect(selectMock).toHaveBeenCalledWith('id');
      expect(mockLogAuditAction).toHaveBeenCalled();
    });

    it('returns failure when 0 rows are affected (no matching row)', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'super-admin-1',
        fullName: 'Super Admin',
        role: 'super_admin',
      });

      // maybeSingle returns null when 0 rows were updated
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const selectMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqMock = vi.fn().mockReturnValue({ select: selectMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ update: updateMock });

      mockSupabase = { from: fromMock };

      const result = await updateAdminPermissions({
        userId: 'non-existent-user',
        permissions: ['canManageUsers'],
        useRoleDefault: false,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('المستخدم غير موجود أو تعذّر تحديث صلاحياته');
      }
      expect(mockLogAuditAction).not.toHaveBeenCalled();
    });

    it('enforces role restriction (only super_admin allowed)', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'supervisor-1',
        fullName: 'General Supervisor',
        role: 'general_supervisor',
      });

      const result = await updateAdminPermissions({
        userId: 'target-user-2',
        permissions: ['canManageUsers'],
        useRoleDefault: false,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('تعديل الصلاحيات لمدير النظام فقط');
      }
    });

    it('prevents super_admin from modifying own permissions', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'super-admin-1',
        fullName: 'Super Admin',
        role: 'super_admin',
      });

      const result = await updateAdminPermissions({
        userId: 'super-admin-1',
        permissions: ['canManageUsers'],
        useRoleDefault: false,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('ما ينفعش تعدّل صلاحيات حسابك أنت');
      }
    });
  });

  describe('3. cancelDependentRequest (src/actions/dependent-requests.ts)', () => {
    it('returns success when pending request owned by child is successfully cancelled', async () => {
      mockRequireUser.mockResolvedValue({ id: 'child-user-1' });
      mockGetDependentGuardian.mockResolvedValue({
        childId: 'child-prof-1',
        guardianId: 'guardian-prof-1',
        fullName: 'الابن',
      });

      const maybeSingleMock = vi.fn().mockResolvedValue({ data: { id: 'req-1' }, error: null });
      const selectMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqStatusMock = vi.fn().mockReturnValue({ select: selectMock });
      const eqChildMock = vi.fn().mockReturnValue({ eq: eqStatusMock });
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqChildMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock });
      const fromMock = vi.fn().mockReturnValue({ update: updateMock });

      mockSupabase = { from: fromMock };

      const result = await cancelDependentRequest('req-1');

      expect(result).toEqual({ ok: true });
      expect(fromMock).toHaveBeenCalledWith('dependent_requests');
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'cancelled' })
      );
      expect(eqIdMock).toHaveBeenCalledWith('id', 'req-1');
      expect(eqChildMock).toHaveBeenCalledWith('child_profile_id', 'child-prof-1');
      expect(eqStatusMock).toHaveBeenCalledWith('status', 'pending');
      expect(selectMock).toHaveBeenCalledWith('id');
    });

    it('returns failure when 0 rows are affected (request does not exist or not owned or not pending)', async () => {
      mockRequireUser.mockResolvedValue({ id: 'child-user-1' });
      mockGetDependentGuardian.mockResolvedValue({
        childId: 'child-prof-1',
        guardianId: 'guardian-prof-1',
        fullName: 'الابن',
      });

      // maybeSingle returns null when no matching row meets the criteria
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const selectMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqStatusMock = vi.fn().mockReturnValue({ select: selectMock });
      const eqChildMock = vi.fn().mockReturnValue({ eq: eqStatusMock });
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqChildMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock });
      const fromMock = vi.fn().mockReturnValue({ update: updateMock });

      mockSupabase = { from: fromMock };

      const result = await cancelDependentRequest('req-already-processed');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('الطلب مش موجود أو ولي أمرك بتّ فيه خلاص');
      }
    });

    it('does not succeed when request is not pending or not owned by child (query constraints verify zero rows)', async () => {
      mockRequireUser.mockResolvedValue({ id: 'child-user-1' });
      mockGetDependentGuardian.mockResolvedValue({
        childId: 'child-prof-1',
        guardianId: 'guardian-prof-1',
        fullName: 'الابن',
      });

      // Database returns null because status is approved/rejected or childId doesn't match
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const selectMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqStatusMock = vi.fn().mockReturnValue({ select: selectMock });
      const eqChildMock = vi.fn().mockReturnValue({ eq: eqStatusMock });
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqChildMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock });
      const fromMock = vi.fn().mockReturnValue({ update: updateMock });

      mockSupabase = { from: fromMock };

      const result = await cancelDependentRequest('approved-req-id');

      expect(result.ok).toBe(false);
      // Confirms all conditions are strictly chained
      expect(eqIdMock).toHaveBeenCalledWith('id', 'approved-req-id');
      expect(eqChildMock).toHaveBeenCalledWith('child_profile_id', 'child-prof-1');
      expect(eqStatusMock).toHaveBeenCalledWith('status', 'pending');
    });

    it('enforces unauthorized access when user is not a dependent', async () => {
      mockRequireUser.mockResolvedValue({ id: 'some-user' });
      mockGetDependentGuardian.mockResolvedValue(null);

      const result = await cancelDependentRequest('req-1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('غير مصرح');
      }
    });
  });
});
