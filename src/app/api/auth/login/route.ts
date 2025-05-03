import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types";

// Use service role key for admin operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: Request) {
  try {
    // Forward this request to the signin endpoint
    const { email, password } = await request.json();
    console.log("Login API: Forwarding to signin endpoint");

    // Use the same request body, but send to the signin endpoint
    const signinResponse = await fetch(
      new URL("/api/auth/signin", request.url),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const result = await signinResponse.json();

    // Return the response from the signin endpoint
    return new Response(JSON.stringify(result), {
      status: signinResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
