import type { ContentDepth } from './types';

/**
 * Future gating system for content access control
 * This is a placeholder implementation that will be extended
 * when authentication is added
 */

export type UserRole = 'public' | 'student' | 'clinician';

export interface AccessLevel {
  role: UserRole;
  canAccessDepth: ContentDepth[];
}

/**
 * Access levels by role
 */
const ACCESS_LEVELS: Record<UserRole, AccessLevel> = {
  public: {
    role: 'public',
    canAccessDepth: ['basic'],
  },
  student: {
    role: 'student',
    canAccessDepth: ['basic', 'intermediate'],
  },
  clinician: {
    role: 'clinician',
    canAccessDepth: ['basic', 'intermediate', 'advanced'],
  },
};

/**
 * Get current user role (placeholder - will be replaced with auth)
 * For now, returns 'public' (open access)
 */
export function getCurrentUserRole(): UserRole {
  // TODO: Replace with actual authentication check
  return 'public';
}

/**
 * Check if user can access content of a given depth
 */
export function canAccessDepth(depth: ContentDepth, userRole?: UserRole): boolean {
  const role = userRole || getCurrentUserRole();
  const accessLevel = ACCESS_LEVELS[role];
  return accessLevel.canAccessDepth.includes(depth);
}

/**
 * Check if a section is gated
 */
export function isSectionGated(gated?: boolean, depth?: ContentDepth): boolean {
  if (gated === true) {
    return true;
  }
  
  if (depth) {
    const userRole = getCurrentUserRole();
    return !canAccessDepth(depth, userRole);
  }
  
  return false;
}

/**
 * Get preview/teaser text for gated content
 */
export function getGatedPreviewText(): string {
  return 'This section is available to registered users. Sign up to access advanced clinical content.';
}

