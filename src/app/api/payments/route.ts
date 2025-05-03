import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Processing payment:", data);

    // Validate required fields
    if (
      !data.project_id ||
      !data.client_id ||
      !data.freelancer_id ||
      !data.amount
    ) {
      return NextResponse.json(
        { error: "Missing required payment fields" },
        { status: 400 }
      );
    }

    // Calculate platform fee (2% of the amount)
    const platformFeePercentage = 0.02;
    const platformFee = data.amount * platformFeePercentage;
    const amountToFreelancer = data.amount - platformFee;

    console.log(
      `Payment breakdown: Total: $${data.amount}, Platform Fee (2%): $${platformFee}, To Freelancer: $${amountToFreelancer}`
    );

    // First check if the payments table exists
    const { error: tableCheckError } = await supabase
      .from("payments")
      .select("id")
      .limit(1)
      .maybeSingle();

    // If the payments table doesn't exist, we'll skip trying to insert into it
    const paymentsTableExists = !tableCheckError;

    // Record platform fee for admin statistics
    try {
      const { error: feeError } = await supabase
        .from("platform_revenue")
        .insert({
          project_id: data.project_id,
          amount: platformFee,
          percentage: platformFeePercentage,
          transaction_date: new Date().toISOString(),
          client_id: data.client_id,
          freelancer_id: data.freelancer_id,
        });

      if (feeError) {
        console.error("Error recording platform fee:", feeError);
        // Continue execution even if this fails
      }
    } catch (err) {
      console.error("Exception during platform fee recording:", err);
      // Continue execution
    }

    // 1. Update project status to "paid"
    const { error: projectError } = await supabase
      .from("projects")
      .update({ status: "paid" })
      .eq("id", data.project_id);

    if (projectError) {
      console.error("Error updating project status:", projectError);
      return NextResponse.json(
        { error: "Failed to update project status", details: projectError },
        { status: 500 }
      );
    }

    // 2. Record the payment transaction if the table exists
    if (paymentsTableExists) {
      try {
        const { error: paymentError } = await supabase.from("payments").insert({
          project_id: data.project_id,
          client_id: data.client_id,
          freelancer_id: data.freelancer_id,
          amount: data.amount,
          status: "completed",
        });

        if (paymentError) {
          console.error("Error recording transaction:", paymentError);
          // We'll continue even if this fails
        }
      } catch (err) {
        console.error("Exception during payment recording:", err);
        // Continue execution - don't let payment recording failure break the flow
      }
    } else {
      console.log("Skipping payment recording - payments table doesn't exist");
    }

    // 3. Update the client's balance
    let clientBalance = null;
    try {
      // First get the current client balance
      const { data: client, error: fetchClientError } = await supabase
        .from("clients")
        .select("balance")
        .eq("id", data.client_id)
        .single();

      if (fetchClientError) {
        console.error("Error fetching client balance:", fetchClientError);
      } else if (client) {
        // Calculate new balance
        const currentBalance = client.balance || 0;
        const newBalance = Math.max(0, currentBalance - data.amount);

        console.log(
          `Updating client balance from ${currentBalance} to ${newBalance}`
        );

        // Update the client's balance
        const { error: updateBalanceError } = await supabase
          .from("clients")
          .update({ balance: newBalance })
          .eq("id", data.client_id);

        if (updateBalanceError) {
          console.error("Error updating client balance:", updateBalanceError);
        } else {
          clientBalance = newBalance;
          console.log(`Client balance successfully updated to ${newBalance}`);
        }
      }
    } catch (err) {
      console.error("Error updating client balance:", err);
    }

    // 4. Update the freelancer's balance
    let freelancerBalance = null;
    try {
      // First get the current freelancer balance
      const { data: freelancer, error: fetchFreelancerError } = await supabase
        .from("freelancers")
        .select("balance")
        .eq("id", data.freelancer_id)
        .single();

      if (fetchFreelancerError) {
        console.error(
          "Error fetching freelancer balance:",
          fetchFreelancerError
        );
      } else if (freelancer) {
        // Calculate new balance
        const currentBalance = freelancer.balance || 0;
        const newBalance = currentBalance + amountToFreelancer;

        console.log(
          `Updating freelancer balance from ${currentBalance} to ${newBalance}`
        );

        // Update the freelancer's balance
        const { error: updateBalanceError } = await supabase
          .from("freelancers")
          .update({ balance: newBalance })
          .eq("id", data.freelancer_id);

        if (updateBalanceError) {
          console.error(
            "Error updating freelancer balance:",
            updateBalanceError
          );
        } else {
          freelancerBalance = newBalance;
          console.log(
            `Freelancer balance successfully updated to ${newBalance}`
          );
        }
      }
    } catch (err) {
      console.error("Error updating freelancer balance:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      client_balance: clientBalance,
      freelancer_balance: freelancerBalance,
      fee_percentage: platformFeePercentage * 100,
      platform_fee: platformFee,
      amount_to_freelancer: amountToFreelancer,
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      {
        error: "Failed to process payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
