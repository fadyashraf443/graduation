// This is a mock file to resolve build errors.
// The main application is currently using localStorage for session management.

// This file is not intended to be used directly.
// It exists solely to prevent build failures from orphaned files.

export async function getSession() {
  return { 
    user: undefined,
    save: async () => {},
    destroy: async () => {}
  };
}

export const sessionOptions = {};
