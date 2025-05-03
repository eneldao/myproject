import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, type, ...additionalData } = body;

    if (!email || !password || !fullName || !type) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Check if the email already exists in the users table
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists. Please use a different email." },
        { status: 400 }
      );
    }

    if (existingUserError && existingUserError.code !== "PGRST116") {
      return NextResponse.json(
        { error: `Error checking existing user: ${existingUserError.message}` },
        { status: 500 }
      );
    }

    const passwordHash = hashPassword(password);
    const uniqueId = uuidv4();

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        id: uniqueId,
        email,
        password_hash: passwordHash,
        user_type: type,
      })
      .select()
      .single();

    if (userError) {
      return NextResponse.json(
        { error: `Failed to create user: ${userError.message}` },
        { status: 400 }
      );
    }

    if (type === "freelancer") {
      const { error: freelancerError } = await supabase
        .from("freelancers")
        .insert({
          id: uniqueId,
          full_name: fullName,
          email,
          title: additionalData.title || "",
          description: additionalData.description || "",
          hourly_rate: additionalData.hourlyRate || 0,
          languages: additionalData.languages || [],
          services: additionalData.services || [],
          rating: 0,
          reviews_count: 0,
          completed_projects: 0,
          response_time: "N/A",
          balance: 0,
        });

      if (freelancerError) {
        return NextResponse.json(
          {
            error: `Failed to create freelancer profile: ${freelancerError.message}`,
          },
          { status: 400 }
        );
      }
    } else if (type === "client") {
      const { error: clientError } = await supabase.from("clients").insert({
        id: uniqueId,
        company_name: additionalData.companyName || "",
        contact_name: fullName,
        contact_email: email,
        balance: 0,
      });

      if (clientError) {
        return NextResponse.json(
          { error: `Failed to create client profile: ${clientError.message}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: true, userId: uniqueId },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
