import { createClient } from '@supabase/supabase-js';

// Define types
export type FreelancerProfile = {
  id: string;
  user_id: string;
  name: string;
  image_url: string;
  rating: number;
  about: string;
  services: {
    voiceOver: string[];
    conferenceInterpretation: string[];
  };
  languages: string[];
  roles: string[];
  created_at: string;
  updated_at: string;
};

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Types for our database tables
export type Profile = {
  id: string;
  email: string;
  full_name: string;
  user_type: 'client' | 'freelancer' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  sender_id: string;
  receiver_id: string;
  project_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  sender?: Profile;
  receiver?: Profile;
  project?: {
    id: string;
    title: string;
  };
};

export type Freelancer = {
  id: string;
  title: string;
  description: string;
  hourly_rate: number;
  languages: string[];
  services: string[];
  rating: number;
  reviews_count: number;
  completed_projects: number;
  response_time: string;
  created_at: string;
};

export type Review = {
  id: string;
  freelancer_id: string;
  client_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type Project = {
  id: string;
  client_id: string;
  freelancer_id: string;
  title: string;
  description: string;
  service_type: string;
  status: string;
  budget: number;
  start_date: string;
  end_date: string;
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}; 