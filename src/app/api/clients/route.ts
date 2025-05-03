import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Assuming you have a db setup

export async function GET() {
  try {
    // Fetch all clients from the database
    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching clients:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch clients" },
        { status: 500 }
      );
    }

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error in GET clients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields for client creation
    if (!data.full_name || !data.email) {
      return NextResponse.json(
        { error: "Missing required client fields" },
        { status: 400 }
      );
    }

    // Create client in database
    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        full_name: data.full_name,
        email: data.email,
        company_name: data.company_name || null,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        balance: data.balance || 0,
        user_type: data.user_type || "client",
        user_id: data.user_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
