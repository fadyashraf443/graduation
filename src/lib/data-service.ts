// This is a mock data service to resolve build errors.
// The main application is currently using localStorage.

import type { PlatformUser } from './types';

// This will be replaced with actual firebase calls.
const initialUsers: PlatformUser[] = [];

export async function getUsers(): Promise<PlatformUser[]> {
    return Promise.resolve(initialUsers);
}

export async function getUserByEmail(email: string): Promise<PlatformUser | undefined> {
  const user = initialUsers.find(u => u.email === email);
  return Promise.resolve(user);
}

export async function createUser(data: { email: string; role: 'Admin' | 'User' }): Promise<PlatformUser> {
  const newUser: PlatformUser = {
    id: `user-${Date.now()}`,
    email: data.email,
    role: data.role,
    lastLogin: 'Never',
  };
  // This is a mock and doesn't persist to the initialUsers array
  // as the live application uses localStorage.
  return Promise.resolve(newUser);
}

export async function getAllUsersWithSensitiveData(): Promise<PlatformUser[]> {
    return Promise.resolve(initialUsers);
}
