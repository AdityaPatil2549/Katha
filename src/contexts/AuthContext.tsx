import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { dbService } from '@/db/DatabaseService';
import { useStoriesStore, useMomentsStore } from '@/store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Running in local-only mode without Firebase keys
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      dbService.setUserId(currentUser?.uid || null);
      
      // Hydrate all Zustand stores with the new DB context
      useStoriesStore.getState().loadStories().catch(console.error);
      useMomentsStore.getState().loadMoments().catch(console.error);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      // Mock login for local mode
      const mockUser = {
        uid: 'local-mock-user-123',
        displayName: 'Local Explorer',
        email: 'local@katha.app',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Katha'
      } as User;
      setUser(mockUser);
      dbService.setUserId(mockUser.uid);
      
      useStoriesStore.getState().loadStories().catch(console.error);
      useMomentsStore.getState().loadMoments().catch(console.error);
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
      // Mock logout for local mode
      setUser(null);
      dbService.setUserId(null);
      
      useStoriesStore.getState().loadStories().catch(console.error);
      useMomentsStore.getState().loadMoments().catch(console.error);
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
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
