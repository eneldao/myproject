import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    // Get the URL to determine which project messages to fetch
    const url = new URL(request.url);
    // Use project_id for consistency with other endpoints instead of projectId
    const projectId =
      url.searchParams.get("project_id") || url.searchParams.get("projectId");
    const userId = url.searchParams.get("userId");

    console.log(
      `Messages [id] API called - project_id: ${
        projectId || "not provided"
      }, userId: ${userId || "not provided"}`
    );

    if (!projectId || !userId) {
      return NextResponse.json(
        {
          error: "Project ID and User ID are required",
          note: "Use query parameters: project_id (or projectId) and userId",
        },
        { status: 400 }
      );
    }

    // Check if the user is part of this project (either as client or freelancer)
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Not authorized to view this project" },
        { status: 403 }
      );
    }

    // Fetch messages for this project
    const { data: messages, error: messagesError } = await supabase
      .from("project_messages")
      .select("id, content, sender_id, project_id, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    if (!messages) {
      return NextResponse.json({ error: "No messages found" }, { status: 404 });
    }

    // Format messages to include sender information
    const formattedMessages = messages.map((message) => {
      return {
        ...message,
        isCurrentUser: message.sender_id === userId,
      };
    });

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { content, projectId, userId } = await request.json();

    console.log(
      `Messages [id] POST called - projectId: ${
        projectId || "not provided"
      }, userId: ${userId || "not provided"}`
    );

    if (!content || !projectId || !userId) {
      return NextResponse.json(
        { error: "Content, projectId, and userId are required" },
        { status: 400 }
      );
    }

    // Verify the user is part of this project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Not authorized to send messages to this project" },
        { status: 403 }
      );
    }

    // Insert the new message
    const { data: message, error: messageError } = await supabase
      .from("project_messages")
      .insert({
        content,
        project_id: projectId,
        sender_id: userId,
      })
      .select()
      .single();

    if (messageError) {
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
