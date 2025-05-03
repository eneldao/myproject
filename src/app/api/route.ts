import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs"; // 👈 this line forces Node.js runtime

// This is the default route handler for /api path
export async function GET(req: Request) {
  try {
    // Get the id from URL parameters instead of path params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Error fetching user type:", error || "No data found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User Type:", data.user_type);

    return NextResponse.json({ userType: data.user_type });
  } catch (error) {
    console.error("Unexpected error fetching user role:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Add POST handler for /api endpoint if needed
export async function POST(req: Request) {
  return NextResponse.json({ message: "API endpoint ready" });
}
