import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { auth } from '~/features/auth/api/auth.server';
import {
  getUserCapabilities,
  hasPermission,
  requirePermission,
  canAccessPII,
  filterPIIFields,
  getUserRoles,
  AuthorizationError,
  AuthenticationError,
  ROLE_CAPABILITIES,
  PII_FIELDS,
  type AuthUser,
  type AuthSession,
  type Capability,
  type Role,
  type PIIField
} from './auth-utils';

// Mock the auth module
vi.mock('~/features/auth/api/auth.server', () => ({
  auth: {
    api: {
      getSessionAndUser: vi.fn(),
    },
  },
}));

// Test suites
describe('auth-utils', () => {
  const mockedGetSessionAndUser = auth.api.getSessionAndUser as MockedFunction<typeof auth.api.getSessionAndUser>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserCapabilities', () => {
    it('should return empty array for user with no roles', () => {
      const user: AuthUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        roles: []
      } as AuthUser;

      const capabilities = getUserCapabilities(user);
      expect(capabilities).toEqual([]);
    });

    it('should return admin capabilities for admin user', () => {
      const user: AuthUser = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        roles: [{ name: 'admin' }]
      } as AuthUser;

      const capabilities = getUserCapabilities(user);
      expect(capabilities).toContain('users:super');
      expect(capabilities).toContain('events:create');
      expect(capabilities).toContain('roles:assign');
      expect(capabilities.length).toBe(11);
    });

    it('should return event_manager capabilities', () => {
      const user: AuthUser = {
        id: '1',
        email: 'manager@example.com',
        name: 'Event Manager',
        roles: [{ name: 'event_manager' }]
      } as AuthUser;

      const capabilities = getUserCapabilities(user);
      expect(capabilities).toContain('events:create');
      expect(capabilities).toContain('users:read');
      expect(capabilities).not.toContain('users:super');
      expect(capabilities).not.toContain('roles:assign');
      expect(capabilities.length).toBe(5);
    });

    it('should return member capabilities', () => {
      const user: AuthUser = {
        id: '1',
        email: 'member@example.com',
        name: 'Member',
        roles: [{ name: 'member' }]
      } as AuthUser;

      const capabilities = getUserCapabilities(user);
      expect(capabilities).toContain('events:read');
      expect(capabilities).toContain('users:read');
      expect(capabilities).not.toContain('events:create');
      expect(capabilities).not.toContain('users:super');
      expect(capabilities.length).toBe(2);
    });

    it('should combine capabilities for user with multiple roles', () => {
      const user: AuthUser = {
        id: '1',
        email: 'multi@example.com',
        name: 'Multi Role User',
        roles: [{ name: 'member' }, { name: 'event_manager' }]
      } as AuthUser;

      const capabilities = getUserCapabilities(user);
      expect(capabilities).toContain('events:read');
      expect(capabilities).toContain('events:create');
      expect(capabilities).toContain('users:read');
      expect(capabilities).not.toContain('users:super');
      expect(capabilities.length).toBe(5); // No duplicates
    });

    it('should handle unknown role gracefully', () => {
      const user: AuthUser = {
        id: '1',
        email: 'unknown@example.com',
        name: 'Unknown Role User',
        roles: [{ name: 'unknown_role' as Role }]
      } as AuthUser;

      const capabilities = getUserCapabilities(user);
      expect(capabilities).toEqual([]);
    });
  });

  describe('hasPermission', () => {
    it('should return false for null user', () => {
      const result = hasPermission(null, 'events:read');
      expect(result).toBe(false);
    });

    it('should return true when user has the required capability', () => {
      const user: AuthUser = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        roles: [{ name: 'admin' }]
      } as AuthUser;

      expect(hasPermission(user, 'users:super')).toBe(true);
      expect(hasPermission(user, 'events:create')).toBe(true);
      expect(hasPermission(user, 'roles:assign')).toBe(true);
    });

    it('should return false when user lacks the required capability', () => {
      const user: AuthUser = {
        id: '1',
        email: 'member@example.com',
        name: 'Member',
        roles: [{ name: 'member' }]
      } as AuthUser;

      expect(hasPermission(user, 'users:super')).toBe(false);
      expect(hasPermission(user, 'events:create')).toBe(false);
      expect(hasPermission(user, 'roles:assign')).toBe(false);
    });

    it('should handle user with no roles', () => {
      const user: AuthUser = {
        id: '1',
        email: 'noroles@example.com',
        name: 'No Roles User',
        roles: []
      } as AuthUser;

      expect(hasPermission(user, 'events:read')).toBe(false);
    });
  });

  describe('requirePermission', () => {
    it('should return user when authenticated and authorized', async () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        roles: [{ name: 'admin' }]
      } as AuthUser;

      const mockSession = { id: 'session1', userId: '1' };

      mockedGetSessionAndUser.mockResolvedValue({
        session: mockSession,
        user: mockUser
      });

      const request = new Request('http://localhost:3000', {
        headers: { 'Authorization': 'Bearer token' }
      });

      const result = await requirePermission(request, 'users:super');
      expect(result).toEqual(mockUser);
    });

    it('should throw AuthenticationError when no session', async () => {
      mockedGetSessionAndUser.mockResolvedValue({
        session: null,
        user: null
      });

      const request = new Request('http://localhost:3000');

      await expect(requirePermission(request, 'events:read'))
        .rejects
        .toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError when no user', async () => {
      const mockSession = { id: 'session1', userId: '1' };

      mockedGetSessionAndUser.mockResolvedValue({
        session: mockSession,
        user: null
      });

      const request = new Request('http://localhost:3000');

      await expect(requirePermission(request, 'events:read'))
        .rejects
        .toThrow(AuthenticationError);
    });

    it('should throw AuthorizationError when user lacks capability', async () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'member@example.com',
        name: 'Member',
        roles: [{ name: 'member' }]
      } as AuthUser;

      const mockSession = { id: 'session1', userId: '1' };

      mockedGetSessionAndUser.mockResolvedValue({
        session: mockSession,
        user: mockUser
      });

      const request = new Request('http://localhost:3000');

      await expect(requirePermission(request, 'users:super'))
        .rejects
        .toThrow(AuthorizationError);

      try {
        await requirePermission(request, 'users:super');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorizationError);
        expect((error as AuthorizationError).capability).toBe('users:super');
      }
    });

    it('should throw AuthenticationError on auth API failure', async () => {
      mockedGetSessionAndUser.mockRejectedValue(new Error('Network error'));

      const request = new Request('http://localhost:3000');

      await expect(requirePermission(request, 'events:read'))
        .rejects
        .toThrow(AuthenticationError);
    });

    it('should pass through AuthenticationError from auth API', async () => {
      mockedGetSessionAndUser.mockRejectedValue(
        new AuthenticationError('Token expired')
      );

      const request = new Request('http://localhost:3000');

      await expect(requirePermission(request, 'events:read'))
        .rejects
        .toThrow('Token expired');
    });
  });

  describe('PII Access Control', () => {
    describe('canAccessPII', () => {
      it('should return true for admin users', () => {
        const user: AuthUser = {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          roles: [{ name: 'admin' }]
        } as AuthUser;

        expect(canAccessPII(user)).toBe(true);
      });

      it('should return false for event_manager users', () => {
        const user: AuthUser = {
          id: '1',
          email: 'manager@example.com',
          name: 'Event Manager',
          roles: [{ name: 'event_manager' }]
        } as AuthUser;

        expect(canAccessPII(user)).toBe(false);
      });

      it('should return false for member users', () => {
        const user: AuthUser = {
          id: '1',
          email: 'member@example.com',
          name: 'Member',
          roles: [{ name: 'member' }]
        } as AuthUser;

        expect(canAccessPII(user)).toBe(false);
      });

      it('should return false for null user', () => {
        expect(canAccessPII(null)).toBe(false);
      });
    });

    describe('filterPIIFields', () => {
      const sampleData = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        ageRange: 'TWENTY_SIX_TO_THIRTY_FIVE',
        birthDate: '1990-01-01',
        ethnicity: 'White',
        instagramHandle: '@johndoe',
        district: 'District1'
      };

      it('should return all data for admin users', () => {
        const user: AuthUser = {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          roles: [{ name: 'admin' }]
        } as AuthUser;

        const result = filterPIIFields(sampleData, user);
        expect(result).toEqual(sampleData);
      });

      it('should filter PII fields for non-admin users', () => {
        const user: AuthUser = {
          id: '1',
          email: 'member@example.com',
          name: 'Member',
          roles: [{ name: 'member' }]
        } as AuthUser;

        const result = filterPIIFields(sampleData, user);
        
        expect(result).toEqual({
          id: '1',
          name: 'John Doe',
          instagramHandle: '@johndoe',
          district: 'District1'
        });

        // Ensure PII fields are not present
        expect(result).not.toHaveProperty('email');
        expect(result).not.toHaveProperty('phone');
        expect(result).not.toHaveProperty('ageRange');
        expect(result).not.toHaveProperty('birthDate');
        expect(result).not.toHaveProperty('ethnicity');
      });

      it('should filter PII fields for null user', () => {
        const result = filterPIIFields(sampleData, null);
        
        expect(result).toEqual({
          id: '1',
          name: 'John Doe',
          instagramHandle: '@johndoe',
          district: 'District1'
        });
      });

      it('should handle empty object', () => {
        const user: AuthUser = {
          id: '1',
          email: 'member@example.com',
          name: 'Member',
          roles: [{ name: 'member' }]
        } as AuthUser;

        const result = filterPIIFields({}, user);
        expect(result).toEqual({});
      });

      it('should handle object with no PII fields', () => {
        const nonPIIData = {
          id: '1',
          name: 'John Doe',
          instagramHandle: '@johndoe'
        };

        const user: AuthUser = {
          id: '1',
          email: 'member@example.com',
          name: 'Member',
          roles: [{ name: 'member' }]
        } as AuthUser;

        const result = filterPIIFields(nonPIIData, user);
        expect(result).toEqual(nonPIIData);
      });
    });
  });

  describe('getUserRoles', () => {
    it('should return role names for user with roles', () => {
      const user: AuthUser = {
        id: '1',
        email: 'multi@example.com',
        name: 'Multi Role User',
        roles: [{ name: 'admin' }, { name: 'event_manager' }]
      } as AuthUser;

      const roles = getUserRoles(user);
      expect(roles).toEqual(['admin', 'event_manager']);
    });

    it('should return empty array for user with no roles', () => {
      const user: AuthUser = {
        id: '1',
        email: 'noroles@example.com',
        name: 'No Roles User',
        roles: []
      } as AuthUser;

      const roles = getUserRoles(user);
      expect(roles).toEqual([]);
    });

    it('should return empty array for user with undefined roles', () => {
      const user: AuthUser = {
        id: '1',
        email: 'noroles@example.com',
        name: 'No Roles User'
      } as AuthUser;

      const roles = getUserRoles(user);
      expect(roles).toEqual([]);
    });

    it('should return empty array for null user', () => {
      const roles = getUserRoles(null);
      expect(roles).toEqual([]);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed user roles gracefully', () => {
      const user: AuthUser = {
        id: '1',
        email: 'malformed@example.com',
        name: 'Malformed User',
        roles: [null as any, undefined as any, { name: 'admin' }]
      } as AuthUser;

      // Should not throw and should process valid roles
      const capabilities = getUserCapabilities(user);
      expect(capabilities).toContain('users:super');
    });

    it('should handle case-sensitive capability checks', () => {
      const user: AuthUser = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        roles: [{ name: 'admin' }]
      } as AuthUser;

      expect(hasPermission(user, 'users:super')).toBe(true);
      expect(hasPermission(user, 'Users:Super' as Capability)).toBe(false);
    });

    it('should handle empty capability requirement', () => {
      const user: AuthUser = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        roles: [{ name: 'admin' }]
      } as AuthUser;

      expect(hasPermission(user, '' as Capability)).toBe(false);
    });

    it('should maintain type safety with capability constants', () => {
      // This test ensures our types are working correctly
      const validCapabilities: Capability[] = [
        'events:read',
        'events:create', 
        'events:update',
        'events:delete',
        'users:read',
        'users:create',
        'users:update', 
        'users:delete',
        'users:super',
        'roles:assign',
        'roles:remove'
      ];

      expect(validCapabilities.length).toBe(11);
      
      // Ensure PII fields constant is properly typed
      const piiFields: PIIField[] = ['email', 'phone', 'ageRange', 'birthDate', 'ethnicity'];
      expect(piiFields.length).toBe(5);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete auth flow for protected resource access', async () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'manager@example.com',
        name: 'Event Manager',
        roles: [{ name: 'event_manager' }]
      } as AuthUser;

      mockedGetSessionAndUser.mockResolvedValue({
        session: { id: 'session1', userId: '1' },
        user: mockUser
      });

      const request = new Request('http://localhost:3000/events/create');

      // Should succeed for events:create
      const user = await requirePermission(request, 'events:create');
      expect(user).toEqual(mockUser);

      // Should fail for users:super (PII access)
      await expect(requirePermission(request, 'users:super'))
        .rejects
        .toThrow(AuthorizationError);
    });

    it('should demonstrate proper PII filtering in data access', () => {
      const userData = {
        id: '123',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1987654321',
        instagramHandle: '@janedoe',
        ageRange: 'THIRTY_SIX_TO_FORTY_FIVE',
        ethnicity: 'Asian'
      };

      // Admin can see everything
      const adminUser: AuthUser = {
        id: '1',
        roles: [{ name: 'admin' }]
      } as AuthUser;

      const adminResult = filterPIIFields(userData, adminUser);
      expect(adminResult).toHaveProperty('email');
      expect(adminResult).toHaveProperty('phone');
      expect(adminResult).toHaveProperty('ageRange');
      expect(adminResult).toHaveProperty('ethnicity');

      // Event manager cannot see PII
      const managerUser: AuthUser = {
        id: '2',
        roles: [{ name: 'event_manager' }]
      } as AuthUser;

      const managerResult = filterPIIFields(userData, managerUser);
      expect(managerResult).not.toHaveProperty('email');
      expect(managerResult).not.toHaveProperty('phone');
      expect(managerResult).not.toHaveProperty('ageRange');
      expect(managerResult).not.toHaveProperty('ethnicity');
      expect(managerResult).toHaveProperty('name');
      expect(managerResult).toHaveProperty('instagramHandle');
    });
  });
});