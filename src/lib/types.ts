export type Database = {
  profiles: Profile;
  freelancers: Freelancer;
  reviews: Review;
  projects: Project;
  messages: Message;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
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
