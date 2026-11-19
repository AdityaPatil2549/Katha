import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { dbService } from '@/db/DatabaseService';
import { useStoriesStore, useMomentsStore, useSessionsStore, useKnowledgeStore } from '@/store';

export interface AuthContextType {
  user: User | null;
  isLocalOnly: boolean;
  isCloudAuthenticated: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  continueLocally: () => void;
  logout: () => Promise<void>;
}

const LOCAL_USER_STORAGE_KEY = 'katha_local_profile';
const LOCAL_AVATAR_DATA_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#23262C"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#F3EFE6" font-family="Georgia,serif" font-size="26">K</text></svg>'
  );

function getOrCreateLocalUser(): User {
  let uid = 'local-vault';
  try {
    const stored = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { uid?: string };
      if (parsed.uid) uid = parsed.uid;
    } else {
      uid = `local-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
      localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify({ uid }));
    }
  } catch {
    // Fallback cleanly if storage unavailable
  }

  return {
    uid,
    displayName: 'Local Vault',
    email: null,
    photoURL: LOCAL_AVATAR_DATA_URI,
  } as unknown as User;
}

function hydrateAllStores() {
  void useStoriesStore.getState().loadStories().catch(console.error);
  void useMomentsStore.getState().loadMoments().catch(console.error);
  void useSessionsStore.getState().loadSessions().catch(console.error);
  void useKnowledgeStore.getState().loadKnowledge().catch(console.error);
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isCloudAuthenticated, setIsCloudAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      const localUser = getOrCreateLocalUser();
      setUser(localUser);
      setIsCloudAuthenticated(false);
      dbService.setUserId(null);
      hydrateAllStores();
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsCloudAuthenticated(true);
        dbService.setUserId(currentUser.uid);
      } else {
        // Local-First default: hydrate persistent local vault instead of trapping user at login
        const localUser = getOrCreateLocalUser();
        setUser(localUser);
        setIsCloudAuthenticated(false);
        dbService.setUserId(null);
      }
      hydrateAllStores();
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const continueLocally = () => {
    const localUser = getOrCreateLocalUser();
    setUser(localUser);
    setIsCloudAuthenticated(false);
    dbService.setUserId(null);
    hydrateAllStores();
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      continueLocally();
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) {
      continueLocally();
      return;
    }

    try {
      await signOut(auth);
      continueLocally();
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLocalOnly: !isCloudAuthenticated,
        isCloudAuthenticated,
        loading,
        signInWithGoogle,
        continueLocally,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
