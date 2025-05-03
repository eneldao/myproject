"use client";
import { createContext, useContext, useState } from "react";

interface User {
  id: string;
  type: string;
}

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Add loading state

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    type: string,
    additionalData: any
  ) => {
    if (loading)
      return { success: false, error: "Signup is already in progress" }; // Prevent duplicate calls

    setLoading(true); // Set loading to true
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
      setLoading(false); // Reset loading state
    }
  };

  const signin = async (email: string, password: string) => {
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
    }
  };

  return (
    <AuthContext.Provider value={{ user, signup, signin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
