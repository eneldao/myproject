import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  // Check for environment variables and provide fallbacks for build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If environment variables are missing, return an appropriate response
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Missing Supabase credentials in environment variables");
    return NextResponse.json(
      { error: "Configuration error. Please check server environment." },
      { status: 500 }
    );
  }

  // Create the Supabase client only if we have the required variables
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Your stats logic here
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .eq("user_type", "admin");

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}
