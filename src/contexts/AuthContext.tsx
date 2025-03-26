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
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  signOut: () => void;
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
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Initialize auth state from Supabase
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);

        // Check if user is admin
        if (currentSession?.user) {
          setIsAdmin(currentSession.user.email === "admin@example.com");
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user || null);

          // Update admin status when auth state changes
          if (newSession?.user) {
            setIsAdmin(newSession.user.email === "admin@example.com");
          } else {
            setIsAdmin(false);
          }
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  useEffect(() => {
    if (!loading && isAdmin) {
      router.push("/admin");
    }
  }, [isAdmin, loading, router]);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email); // Debug log

      // Sign in directly with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase login error:", error.message); // Debug log
        return {
          error: new Error("Invalid login credentials"),
          success: false,
        };
      }

      console.log("Login successful:", data.user?.email); // Debug log

      // Set user and session
      setUser(data.user);
      setSession(data.session);

      // Refresh session to ensure it's updated
      await refreshSession();

      // Check if admin
      setIsAdmin(email === "admin@example.com");
      if (email === "admin@example.com") {
        router.push("/admin");
      }

      return { error: null, success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { error: error as Error, success: false };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    router.push("/auth/signin");
  };

  const refreshSession = async () => {
    try {
      const {
        data: { session: refreshedSession },
      } = await supabase.auth.getSession();
      setSession(refreshedSession);
      setUser(refreshedSession?.user || null);

      // Update admin status
      if (refreshedSession?.user) {
        setIsAdmin(refreshedSession.user.email === "admin@example.com");
      }
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
        isAdmin,
        signOut: logout, // Add signOut property
      }}
    >
      {!loading && children}
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
