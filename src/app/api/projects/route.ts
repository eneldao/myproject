import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const clientId = url.searchParams.get("client_id");
    const freelancerId = url.searchParams.get("freelancer_id");
    console.log(
      `Fetching projects - client_id: ${clientId}, freelancer_id: ${freelancerId}`
    );

    let query = supabase
      .from("projects")
      .select(
        "id, title, description, budget, status, freelancer_id, client_id, created_at"
      );
    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    if (freelancerId) {
      query = query.eq("freelancer_id", freelancerId);
    }

    const { data: projects, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    // Add cache control headers to prevent browser caching
    const response = NextResponse.json(projects || []);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error in GET projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (
      !data.title ||
      !data.description ||
      !data.budget ||
      !data.freelancer_id ||
      !data.client_id
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        title: data.title,
        description: data.description,
        budget: parseFloat(data.budget),
        status: data.status || "pending",
        freelancer_id: data.freelancer_id,
        client_id: data.client_id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error in POST projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
