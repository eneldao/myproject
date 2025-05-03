import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdminUser() {
  try {
    // Check auth.users table
    const { data: users, error: usersError } = await supabase
      .from("auth.users")
      .select("*")
      .eq("email", "admin@trans-easy.com");

    if (usersError) throw usersError;

    console.log("Users found:", users);

    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_type", "admin");

    if (profilesError) throw profilesError;

    console.log("Admin profiles found:", profiles);
  } catch (error) {
    console.error("Error checking admin user:", error);
  }
}

// Call the function only once
checkAdminUser();
