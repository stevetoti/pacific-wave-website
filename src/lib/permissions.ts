// Role-based access control for Pacific Wave Digital admin panel

export type Role = 'super_admin' | 'admin' | 'editor' | 'viewer';

export type AdminPage = 
  | 'dashboard' 
  | 'blog' 
  | 'seo' 
  | 'settings' 
  | 'users' 
  | 'media' 
  | 'transcripts'
  | 'help';

// Define permissions for each role
export const rolePermissions: Record<Role, AdminPage[]> = {
  super_admin: ['dashboard', 'blog', 'seo', 'settings', 'users', 'media', 'transcripts', 'help'],
  admin: ['dashboard', 'blog', 'seo', 'settings', 'media', 'transcripts', 'help'],
  editor: ['dashboard', 'blog', 'media', 'help'],
  viewer: ['dashboard', 'help'],
};

// Human-readable role names
export const roleLabels: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

// Role descriptions
export const roleDescriptions: Record<Role, string> = {
  super_admin: 'Full access to all features including user management',
  admin: 'Can manage content, SEO, and site settings',
  editor: 'Can create and edit blog posts and media',
  viewer: 'Read-only access to dashboard',
};

// Role hierarchy (higher number = more permissions)
export const roleHierarchy: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

// Check if a role can access a specific page
export function canAccess(role: string | null, page: AdminPage): boolean {
  if (!role) return false;
  const permissions = rolePermissions[role as Role];
  return permissions?.includes(page) ?? false;
}

// Check if a role has higher or equal permissions than another
export function hasEqualOrHigherRole(userRole: string | null, requiredRole: Role): boolean {
  if (!userRole) return false;
  const userLevel = roleHierarchy[userRole as Role] ?? 0;
  const requiredLevel = roleHierarchy[requiredRole];
  return userLevel >= requiredLevel;
}

// Get all accessible pages for a role
export function getAccessiblePages(role: string | null): AdminPage[] {
  if (!role) return [];
  return rolePermissions[role as Role] ?? [];
}

// Check if user can manage other users
export function canManageUsers(role: string | null): boolean {
  return role === 'super_admin';
}

// Check if user can modify settings
export function canModifySettings(role: string | null): boolean {
  return role === 'super_admin' || role === 'admin';
}

// Check if user can create/edit content
export function canEditContent(role: string | null): boolean {
  return ['super_admin', 'admin', 'editor'].includes(role ?? '');
}

// Get roles that the current user can assign to others
export function getAssignableRoles(currentRole: string | null): Role[] {
  if (!currentRole) return [];
  
  const currentLevel = roleHierarchy[currentRole as Role] ?? 0;
  
  // Users can only assign roles lower than their own
  return (Object.entries(roleHierarchy) as [Role, number][])
    .filter(([, level]) => level < currentLevel)
    .map(([role]) => role)
    .sort((a, b) => roleHierarchy[b] - roleHierarchy[a]);
}

// Map URL paths to page permissions
export const pathToPage: Record<string, AdminPage> = {
  '/admin': 'dashboard',
  '/admin/blog': 'blog',
  '/admin/blog/new': 'blog',
  '/admin/seo': 'seo',
  '/admin/settings': 'settings',
  '/admin/users': 'users',
  '/admin/media': 'media',
  '/admin/transcripts': 'transcripts',
  '/admin/help': 'help',
  '/admin/help/manage': 'help',
};

// Get the required page permission for a given path
export function getRequiredPermission(pathname: string): AdminPage | null {
  // Exact match first
  if (pathToPage[pathname]) {
    return pathToPage[pathname];
  }
  
  // Check for partial matches (e.g., /admin/blog/edit/123 should match blog)
  for (const [path, page] of Object.entries(pathToPage)) {
    if (pathname.startsWith(path + '/') || pathname === path) {
      return page;
    }
  }
  
  return null;
}
