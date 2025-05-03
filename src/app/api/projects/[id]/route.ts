// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get project by ID
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        freelancer:freelancer_id(*),
        client:client_id(*)
      `
      )
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    // const {
    // data: { session },
    //} = await supabase.auth.getSession();

    //if (!session) {
    //return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    //}

    // Get project update data from request
    const updateData = await request.json();

    // Update the project
    const { data, error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating project:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    ///const {
    /// data: { session },
    //} = await supabase.auth.getSession();

    /// if (!session) {
    // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    //}

    // Delete the project
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting project:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
