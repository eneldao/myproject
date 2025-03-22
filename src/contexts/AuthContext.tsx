"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from Supabase
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);

        // Set up auth state listener
        const {
          data: { subscription },
        } = await supabase.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user || null);
        });

        setLoading(false);

        // Cleanup listener
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error, success: false };
      }

      return { error: null, success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
        success: false,
      };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const refreshSession = async () => {
    try {
      const {
        data: { session: refreshedSession },
      } = await supabase.auth.getSession();
      setSession(refreshedSession);
      setUser(refreshedSession?.user || null);
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        session,
        loading,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
