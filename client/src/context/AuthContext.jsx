import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStorage } from '../api/client.js';

const AuthContext = createContext(null);

/**
 * Holds the signed-in user. On load, an existing token is validated
 * against /api/auth/me so expired sessions are cleared automatically.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!tokenStorage.get()) {
      setInitializing(false);
      return;
    }
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => tokenStorage.clear())
      .finally(() => setInitializing(false));
  }, []);

  const handleAuth = useCallback(({ token, user }) => {
    tokenStorage.set(token);
    setUser(user);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      login: async (credentials) => handleAuth(await api.login(credentials)),
      register: async (details) => handleAuth(await api.register(details)),
      logout: () => {
        tokenStorage.clear();
        setUser(null);
      },
    }),
    [user, initializing, handleAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
