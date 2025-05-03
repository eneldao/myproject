// app/api/freelancers/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const freelancerId = url.searchParams.get("id");

    if (freelancerId) {
      // Fetch specific freelancer by ID
      const { data: freelancer, error } = await supabase
        .from("freelancers")
        .select("*")
        .eq("id", freelancerId)
        .single();

      if (error) {
        console.error("Error fetching freelancer:", error);
        return NextResponse.json(
          { error: "Failed to fetch freelancer" },
          { status: 500 }
        );
      }

      return NextResponse.json(freelancer);
    }

    // Fetch all freelancers if no ID is provided
    const { data: freelancers, error } = await supabase
      .from("freelancers")
      .select("*")
      .order("rating", { ascending: false });

    if (error) {
      console.error("Error fetching freelancers:", error);
      return NextResponse.json(
        { error: "Failed to fetch freelancers" },
        { status: 500 }
      );
    }

    return NextResponse.json(freelancers);
  } catch (error) {
    console.error("Error in freelancers API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
