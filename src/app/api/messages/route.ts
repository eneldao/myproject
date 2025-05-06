import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET messages for a project
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("project_id");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching messages for project: ${projectId}`);

    const { data, error } = await supabase
      .from("project_messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    // Add cache control headers
    const response = NextResponse.json(data || []);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return response;
  } catch (error) {
    console.error("Error in messages API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST a new message
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.project_id || !body.sender_id || !body.content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the message
    const { data, error } = await supabase
      .from("project_messages")
      .insert([
        {
          project_id: body.project_id,
          sender_id: body.sender_id,
          content: body.content,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Error creating message:", error);
      return NextResponse.json(
        { error: "Failed to create message" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in message create API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
