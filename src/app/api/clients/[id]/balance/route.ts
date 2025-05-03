import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    const { amount } = await request.json();

    // Validate the amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Please provide a positive number." },
        { status: 400 }
      );
    }

    // First get current balance
    const { data: client, error: fetchError } = await supabase
      .from("clients")
      .select("balance")
      .eq("id", clientId)
      .single();

    if (fetchError) {
      console.error("Error fetching client balance:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch client information" },
        { status: 500 }
      );
    }

    // Calculate new balance
    const currentBalance = client.balance || 0;
    const newBalance = currentBalance + amount;

    // Update client balance
    const { data: updatedClient, error: updateError } = await supabase
      .from("clients")
      .update({ balance: newBalance })
      .eq("id", clientId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating client balance:", updateError);
      return NextResponse.json(
        { error: "Failed to update balance" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Balance updated successfully",
      balance: newBalance,
      client: updatedClient
    });

  } catch (error) {
    console.error("Error processing add funds request:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;

    const { data: client, error } = await supabase
      .from("clients")
      .select("balance")
      .eq("id", clientId)
      .single();

    if (error) {
      console.error("Error fetching client balance:", error);
      return NextResponse.json(
        { error: "Failed to fetch balance" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      balance: client.balance || 0
    });

  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
