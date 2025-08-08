// src/components/Dashboard.tsx
import React from 'react';
import { useAuthStore } from '../store/auth.store';

export const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user?.avatarUrl && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.avatarUrl}
                    alt="Profile"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome, {user?.firstName || user?.email}!
              </h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
                    <dd className="text-sm text-gray-900">
                      {user?.isEmailVerified ? (
                        <span className="text-green-600">✓ Verified</span>
                      ) : (
                        <span className="text-red-600">✗ Not Verified</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                    <dd className="text-sm text-gray-900">
                      {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                    <dd className="text-sm text-gray-900">
                      {user?.lastLoginAt && new Date(user.lastLoginAt).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};