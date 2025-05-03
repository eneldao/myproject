import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

export async function POST(req: Request) {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return NextResponse.json(
        { error: "Supabase credentials are missing" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { email, password, fullName, type } = body;

    if (!email || !password || !fullName || !type) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: type,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 400 }
      );
    }

    // 2. Store additional profile data based on user type
    if (type === "freelancer") {
      const { skills, experience, hourlyRate, services } = body;

      // Insert freelancer profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: fullName,
        email: email,
        user_type: "freelancer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        return NextResponse.json(
          { error: `Profile creation failed: ${profileError.message}` },
          { status: 400 }
        );
      }

      // Insert freelancer specific data
      const { error: freelancerError } = await supabase
        .from("freelancers")
        .insert({
          id: authData.user.id,
          title: skills || "",
          description: experience || "",
          hourly_rate: parseFloat(hourlyRate) || 0,
          services: services || [],
          languages: [],
          rating: 0,
          reviews_count: 0,
          completed_projects: 0,
          response_time: "0h",
          created_at: new Date().toISOString(),
        });

      if (freelancerError) {
        return NextResponse.json(
          {
            error: `Freelancer data creation failed: ${freelancerError.message}`,
          },
          { status: 400 }
        );
      }
    } else if (type === "client") {
      const { companyName, industry } = body;

      // Insert client profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: fullName,
        email: email,
        user_type: "client",
        company_name: companyName || "",
        industry: industry || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        return NextResponse.json(
          { error: `Profile creation failed: ${profileError.message}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: true, user: authData.user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
