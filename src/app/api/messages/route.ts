import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

// Create a Supabase client with admin privileges for operations that need to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: Request) {
  try {
    // Parse URL to get query parameters
    const url = new URL(request.url);
    const projectId = url.searchParams.get("project_id");

    console.log(`Messages API called with project_id=${projectId}`);

    // Return early if project_id is missing
    if (!projectId) {
      console.log("Missing required project_id parameter");
      return NextResponse.json(
        { error: "Missing required project_id parameter" },
        { status: 400 }
      );
    }

    // Fetch messages for the specified project using admin client to bypass RLS
    console.log(`Fetching messages for project: ${projectId}`);
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("project_messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error querying messages:", messagesError);
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 }
      );
    }

    console.log(`Found ${messages ? messages.length : 0} messages`);
    return NextResponse.json(messages || []);
  } catch (error) {
    console.error("Error in GET /api/messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, project_id, sender_id } = body;

    console.log("Received message POST request:", {
      project_id,
      sender_id,
      content: content.substring(0, 20) + (content.length > 20 ? "..." : ""),
    });

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    if (!project_id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    if (!sender_id) {
      return NextResponse.json(
        { error: "Sender ID is required" },
        { status: 400 }
      );
    }

    // Insert the new message using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("project_messages")
      .insert({
        content,
        project_id,
        sender_id,
      })
      .select();

    if (error) {
      console.error("Error inserting message:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Message successfully saved:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in POST /api/messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
