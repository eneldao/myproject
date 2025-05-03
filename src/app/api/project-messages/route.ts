import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    // Parse URL to get user type and ID
    const url = new URL(request.url);
    const clientId = url.searchParams.get("client_id");
    const freelancerId = url.searchParams.get("freelancer_id");
    const projectId = url.searchParams.get("project_id");

    console.log(`Project-messages API called with: client_id=${clientId}, freelancer_id=${freelancerId}, project_id=${projectId}`);

    // Return early if parameters are missing
    if (!clientId && !freelancerId && !projectId) {
      console.log("Missing required parameter for project-messages");
      return NextResponse.json(
        { error: "Missing required parameter", messages: [] },
        { status: 400 }
      );
    }

    // Use a more efficient query approach
    let projectIds: string[] = [];

    // If project ID is directly provided, use it without additional queries
    if (projectId) {
      projectIds = [projectId];
      console.log(`Using direct project ID: ${projectId}`);
    } else {
      // Only query for project IDs, not entire projects
      let projectsQuery = supabase.from("projects").select("id");

      if (clientId) {
        console.log(`Querying projects for client_id: ${clientId}`);
        projectsQuery = projectsQuery.eq("client_id", clientId);
      } else if (freelancerId) {
        console.log(`Querying projects for freelancer_id: ${freelancerId}`);
        projectsQuery = projectsQuery.eq("freelancer_id", freelancerId);
      }

      const { data: projectsData, error: projectsError } = await projectsQuery;

      if (projectsError) {
        console.error("Error querying projects:", projectsError);
        return NextResponse.json(
          { error: projectsError.message, messages: [] },
          { status: 500 }
        );
      }

      if (!projectsData || projectsData.length === 0) {
        console.log("No projects found for this query");
        return NextResponse.json({ messages: [] }, { status: 200 });
      }

      projectIds = projectsData.map((project) => project.id);
      console.log(`Found ${projectIds.length} projects: ${projectIds.join(", ")}`);
    }

    // Limit query to just what's needed for the UI
    // Only fetch the last 100 messages to improve performance
    console.log(`Querying messages for projects: ${projectIds.join(", ")}`);
    const { data: messagesData, error: messagesError } = await supabase
      .from("project_messages")
      .select(
        `
        id, 
        content, 
        sender_id, 
        project_id, 
        created_at
        `
      )
      .in("project_id", projectIds)
      .order("created_at", { ascending: true })
      .limit(100); // Limit to most recent 100 messages for performance

    if (messagesError) {
      console.error("Error querying messages:", messagesError);
      return NextResponse.json(
        { error: messagesError.message, messages: [] },
        { status: 500 }
      );
    }

    // Even if no messages, return an empty array rather than an error
    if (!messagesData || messagesData.length === 0) {
      console.log("No messages found for these projects");
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    console.log(`Found ${messagesData.length} messages`);

    // Optimize message formatting
    const formattedMessages = messagesData.map((message) => {
      const isCurrentUser = clientId
        ? message.sender_id === clientId
        : message.sender_id === freelancerId;

      return {
        ...message,
        isCurrentUser,
      };
    });

    return NextResponse.json({
      messages: formattedMessages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error", messages: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, project_id, sender_id } = body;

    console.log("Received POST request payload:", body);

    if (!sender_id) {
      return NextResponse.json(
        { error: "Sender ID is required" },
        { status: 400 }
      );
    }

    console.log("Received message data:", body);

    // Individual field validation with specific errors
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

    // Use Supabase service role key to bypass RLS
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure this is securely stored
    );

    // Insert the new message
    const { data: message, error: messageError } = await supabaseService
      .from("project_messages")
      .insert({
        content,
        project_id,
        sender_id,
      })
      .select()
      .single();

    if (messageError) {
      console.error("Supabase error:", messageError);
      return NextResponse.json(
        {
          error: "Failed to send message",
          details: messageError.message,
          code: messageError.code,
        },
        { status: 500 }
      );
    }

    console.log("Message successfully inserted:", message);

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error in POST /api/project-messages:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
