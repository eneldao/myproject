import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  // Test Supabase connection
  const { data, error } = await supabase.from("profiles").select("*").limit(1);

  // Log the result to see if we're connected
  console.log("Supabase connection test:", { data, error });

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#001F3F] to-[#003366]">
      <Navbar />
      <Hero />

      <div style={{ display: "none" }}>
        {error ? (
          <p>Error connecting to Supabase: {error.message}</p>
        ) : (
          <p>Supabase connected successfully!</p>
        )}
      </div>
    </main>
  );
}
