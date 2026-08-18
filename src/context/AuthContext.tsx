import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { supabaseAuth } from '../lib/supabase';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  setCurrentUser: (user: UserProfile | null) => void;
  signOut: () => Promise<void>;
  updateUser: (profile: Partial<UserProfile>) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const user = await supabaseAuth.getSessionUser();
        if (isMounted) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error('[AuthContext] Error getting session user:', err);
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const signOut = async () => {
    await supabaseAuth.signOut();
    setCurrentUser(null);
  };

  const updateUser = async (profile: Partial<UserProfile>) => {
    const updated = await supabaseAuth.updateUserProfile(profile);
    setCurrentUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        setCurrentUser,
        signOut,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
