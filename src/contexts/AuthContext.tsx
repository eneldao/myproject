"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  type: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    fullName: string,
    type: string,
    additionalData: any
  ) => Promise<any>;
  signin: (email: string, password: string) => Promise<any>;
  
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signup: async () => ({ success: false }),
  signin: async () => ({ success: false }),
  
  checkAuthStatus: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status when the component mounts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Get current session from your authentication endpoint
      const response = await fetch("/api/auth/session");

      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData.user) {
          setUser({
            id: sessionData.user.id,
            type: sessionData.user.userType,
          });
          return true;
        } else {
          setUser(null);
        }
      }
      return false;
    } catch (error) {
      console.error("Failed to check authentication status:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    type: string,
    additionalData: any
  ) => {
    if (loading)
      return { success: false, error: "Signup is already in progress" };

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          type,
          ...additionalData,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser({ id: data.userId, type });
        return { success: true, userId: data.userId };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    } finally {
      setLoading(false);
    }
  };

  const signin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser({ id: data.userId, type: data.userType });
        return { success: true, userId: data.userId, userType: data.userType };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });

      if (response.ok) {
        setUser(null);
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, signin, checkAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
