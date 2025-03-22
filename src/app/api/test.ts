import { supabase } from "@/lib/supabase";

async function testSupabase() {
  const { data, error } = await supabase.from("profiles").select("*");

  if (error) {
    console.error("Error fetching profiles:", error.message);
  } else {
    console.log("Profiles:", data);
  }
}

testSupabase();