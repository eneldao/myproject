// app/api/freelancers/[id]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch freelancer data
    const { data: freelancerData, error: freelancerError } = await supabase
      .from("freelancers")
      .select("*")
      .eq("id", id)
      .single();

    if (freelancerError) {
      console.error("Error fetching freelancer:", freelancerError);
      return NextResponse.json(
        { error: "Failed to fetch freelancer data" },
        { status: 500 }
      );
    }

    if (!freelancerData) {
      return NextResponse.json(
        { error: "Freelancer not found" },
        { status: 404 }
      );
    }

    // Fetch projects associated with this freelancer
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("freelancer_id", id)
      .order("created_at", { ascending: false });

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return NextResponse.json(
        {
          freelancer: freelancerData,
          projects: [],
          error: "Failed to fetch project data",
        },
        { status: 200 } // Still return freelancer data even if projects fail
      );
    }

    // Return both freelancer info and their projects
    return NextResponse.json({
      freelancer: freelancerData,
      projects: projectsData || [],
    });
  } catch (error) {
    console.error("Error in freelancer API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
