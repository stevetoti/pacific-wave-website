'use client';

import { useState, useEffect } from 'react';
import { supabase, AdminUser, getAllAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, getAdminUserByEmail, inviteUser } from '@/lib/supabase';
import { roleLabels, roleDescriptions, Role, canManageUsers } from '@/lib/permissions';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  
  // Form states
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('viewer');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const profile = await getAdminUserByEmail(session.user.email);
          setCurrentUser(profile);
        }

        // Get all users
        const allUsers = await getAllAdminUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if current user can manage users
  if (currentUser && !canManageUsers(currentUser.role)) {
    return (
      <div className="text-center py-12">
        <div className="text-yellow-500 text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
        <p className="text-gray-600">Only Super Admins can manage users.</p>
      </div>
    );
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      // Check if user already exists
      const existing = await getAdminUserByEmail(newUserEmail);
      if (existing) {
        setFormError('A user with this email already exists.');
        setIsSubmitting(false);
        return;
      }

      // Create admin user record
      const { data, error } = await createAdminUser({
        email: newUserEmail,
        name: newUserName,
        role: newUserRole,
        created_by: currentUser?.id,
      });

      if (error) {
        setFormError(error.message);
        setIsSubmitting(false);
        return;
      }

      // Send invite email via API
      const { error: inviteError } = await inviteUser(newUserEmail);
      if (inviteError) {
        // User created but invite failed - show warning
        setFormSuccess('User created but invite email failed. They can use "Forgot Password" to set up their account.');
      } else {
        setFormSuccess('User created and invite email sent!');
      }

      // Add to local list
      if (data) {
        setUsers([data, ...users]);
      }

      // Reset form
      setNewUserEmail('');
      setNewUserName('');
      setNewUserRole('viewer');
      
      // Close modal after short delay
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess('');
      }, 2000);

    } catch (err) {
      console.error('Add user error:', err);
      setFormError('Failed to add user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setFormError('');
    setIsSubmitting(true);

    try {
      const { data, error } = await updateAdminUser(selectedUser.id, {
        name: newUserName,
        role: newUserRole,
        is_active: selectedUser.is_active,
      });

      if (error) {
        setFormError(error.message);
        setIsSubmitting(false);
        return;
      }

      // Update local list
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...data } : u));
      
      setShowEditModal(false);
      setSelectedUser(null);

    } catch (err) {
      console.error('Edit user error:', err);
      setFormError('Failed to update user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const { error } = await updateAdminUser(user.id, {
        is_active: !user.is_active,
      });

      if (error) {
        alert('Failed to update user status: ' + error.message);
        return;
      }

      // Update local list
      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);

    try {
      const { error } = await deleteAdminUser(selectedUser.id);

      if (error) {
        alert('Failed to delete user: ' + error.message);
        setIsSubmitting(false);
        return;
      }

      // Remove from local list
      setUsers(users.filter(u => u.id !== selectedUser.id));
      
      setShowDeleteModal(false);
      setSelectedUser(null);

    } catch (err) {
      console.error('Delete user error:', err);
      alert('Failed to delete user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setNewUserName(user.name || '');
    setNewUserRole(user.role);
    setFormError('');
    setShowEditModal(true);
  };

  const openDeleteModal = (user: AdminUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage admin users and their roles</p>
        </div>
        <button
          onClick={() => {
            setNewUserEmail('');
            setNewUserName('');
            setNewUserRole('viewer');
            setFormError('');
            setFormSuccess('');
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-vibrant-orange text-white font-bold rounded-lg hover:bg-soft-orange transition-colors"
        >
          <span>➕</span>
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
          />
        </div>
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
          >
            <option value="all">All Roles</option>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Role Permissions Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Role Permissions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
          {Object.entries(roleDescriptions).map(([role, desc]) => (
            <div key={role} className="text-blue-800">
              <span className="font-medium">{roleLabels[role as Role]}:</span> {desc}
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-deep-blue text-white flex items-center justify-center font-bold">
                          {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name || 'No name'}
                            {user.id === currentUser?.id && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'editor' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={user.id === currentUser?.id}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          user.is_active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        } ${user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {user.is_active ? '✓ Active' : '✗ Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.last_login)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-gray-600 hover:text-deep-blue hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          disabled={user.id === currentUser?.id}
                          className={`p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
                            user.id === currentUser?.id ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
              <p className="text-sm text-gray-500 mt-1">Create a new admin user and send them an invite</p>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {roleDescriptions[newUserRole]}
                </p>
              </div>
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {formError}
                </div>
              )}
              
              {formSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                  {formSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-vibrant-orange text-white font-bold rounded-lg hover:bg-soft-orange transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedUser.email}</p>
            </div>
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
                  disabled={selectedUser.id === currentUser?.id}
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {selectedUser.id === currentUser?.id && (
                  <p className="text-xs text-yellow-600 mt-1">
                    You cannot change your own role.
                  </p>
                )}
              </div>
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-vibrant-orange text-white font-bold rounded-lg hover:bg-soft-orange transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h2>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete <strong>{selectedUser.name || selectedUser.email}</strong>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
