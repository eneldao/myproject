import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Get the auth cookie from the request
    const cookieStore = cookies();
    const authCookie = cookieStore.get("auth_token");

    if (!authCookie?.value) {
      // No auth cookie found, user is not authenticated
      return NextResponse.json({ user: null });
    }

    // Verify the token with Supabase or your auth system
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData?.session) {
      // Session verification failed
      return NextResponse.json({ user: null });
    }

    // Get the user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, user_type")
      .eq("id", sessionData.session.user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ user: null });
    }

    // Return the basic user info
    return NextResponse.json({
      user: {
        id: userData.id,
        userType: userData.user_type,
      },
    });
  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json({ user: null });
  }
}
