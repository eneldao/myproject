import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET a single project
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`Fetching project with id: ${id}`);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      return NextResponse.json(
        { error: "Failed to fetch project" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Add cache control headers
    const response = NextResponse.json(data);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return response;
  } catch (error) {
    console.error("Error in project API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE a project status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    console.log(`Updating project ${id} with data:`, body);

    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update the project
    const { data, error } = await supabase
      .from("projects")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating project:", error);
      return NextResponse.json(
        { error: "Failed to update project" },
        { status: 500 }
      );
    }

    console.log("Updated project:", data);

    // Add cache control headers
    const response = NextResponse.json(data);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return response;
  } catch (error) {
    console.error("Error in project update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
