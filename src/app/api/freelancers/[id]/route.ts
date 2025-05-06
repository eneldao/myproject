// app/api/freelancers/[id]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log(`Fetching data for freelancer: ${id}`);

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

    console.log(
      `Found ${projectsData?.length || 0} projects for freelancer ${id}`
    );

    // Add cache control headers
    const response = NextResponse.json({
      freelancer: freelancerData,
      projects: projectsData || [],
    });
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error in freelancer API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
