import { ReactNode } from "react";

export interface User {
  id: string;
  full_name: string;
  email: string;
  user_type: "client" | "freelancer" | "admin";
  avatar_url?: string;
  balance?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Client extends User {
  company_name?: string;
  contact_name?: string;
  contact_email?: string;
  phone?: string;
  industry?: string;
  description?: string;
  created_at?: string;
  user_id?: string; // Added user_id property
}
export interface Freelancer extends User {
  bio: string;
  skills: never[];
  years_experience: number;
  location: string;
  last_name: any;
  first_name: any;
  profile_image: string | undefined;
  profile_id: string;
  title?: string;

  description?: string;
  hourly_rate?: number;
  languages?: string[];
  services?: string[];
  rating?: number;
  reviews_count?: number;
  completed_projects?: number;
  response_time?: string;
}

export interface Project {
  clients: any;
  client_name: ReactNode;
  id: string;
  client_id: string;
  freelancer_id?: string;
  title: string;
  description: string;
  service_type: string;
  status: string;
  budget: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface ProjectMessage {
  is_read: any;
  sender_name: ReactNode;
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User | null;
  userType: string;
  error: Error | null;
  success: boolean;
}

export interface SignupResponse {
  error: Error | null;
  success: boolean;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string; // Added password_hash field
          user_type: "client" | "freelancer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id: string;
          email: string;
          password_hash: string; // Added password_hash field
          user_type: "client" | "freelancer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string; // Added password_hash field
          user_type?: "client" | "freelancer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          company_name: string;
          contact_name: string;
          contact_email: string;
          balance: string | number;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Insert: {
          id: string;
          company_name?: string;
          contact_name: string;
          contact_email: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          company_name?: string;
          contact_name?: string;
          contact_email?: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
      freelancers: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          title: string;
          description: string;
          hourly_rate: number;
          languages: string[];
          services: string[];
          rating: number;
          reviews_count: number;
          completed_projects: number;
          response_time: string;
          avatar_url?: string | null;
          balance: number;
          created_at?: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          title: string;
          description: string;
          hourly_rate: number;
          languages: string[];
          services: string[];
          rating?: number;
          reviews_count?: number;
          completed_projects?: number;
          response_time?: string;
          avatar_url?: string | null;
          balance?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          email?: string;
          title?: string;
          description?: string;
          hourly_rate?: number;
          languages?: string[];
          services?: string[];
          rating?: number;
          reviews_count?: number;
          completed_projects?: number;
          response_time?: string;
          avatar_url?: string | null;
          balance?: number;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          freelancer_id?: string;
          title: string;
          description: string;
          service_type: string;
          status: string;
          budget: number;
          start_date?: string;
          end_date?: string;
          created_at: string;
        };
        Insert: {
          id: string;
          client_id: string;
          freelancer_id?: string;
          title: string;
          description: string;
          service_type: string;
          status: string;
          budget: number;
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          freelancer_id?: string;
          title?: string;
          description?: string;
          service_type?: string;
          status?: string;
          budget?: number;
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
      };
      project_messages: {
        Row: {
          id: string;
          project_id: string;
          sender_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          project_id: string;
          sender_id: string;
          content: string;
          read: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          sender_id?: string;
          content?: string;
          read?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
