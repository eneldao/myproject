import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    // Initialize default values for all stats
    let totalRevenue = 0;
    let transactionsCount = 0;
    let freelancersData: string | any[] = [];
    let clientsData: string | any[] = [];
    let recentTransactions: {
      id: any;
      amount: any;
      status: any;
      created_at: any;
      project_id: any;
      client_id: any;
      freelancer_id: any;
    }[] = [];
    let revenueByMonth = {};

    // Try to get platform revenue data, but don't throw errors
    try {
      const { data: revenueData, error: revenueError } = await supabase
        .from("platform_revenue")
        .select("amount");

      if (!revenueError && revenueData) {
        totalRevenue = revenueData.reduce(
          (sum, item) => sum + (item.amount || 0),
          0
        );
      } else {
        console.log(
          "Note: platform_revenue table may not exist or is empty:",
          revenueError
        );
      }
    } catch (err) {
      console.warn("Could not fetch platform revenue:", err);
    }

    // Try to get transaction count, but don't throw errors
    try {
      const { count, error } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true });

      if (!error) {
        transactionsCount = count || 0;
      } else {
        console.log("Note: payments table may not exist:", error);
      }
    } catch (err) {
      console.warn("Could not fetch transactions count:", err);
    }

    // Get freelancer stats - fixed query with proper spacing in the alias
    try {
      const { data, error } = await supabase
        .from("freelancers")
        .select("id, full_name as name, balance")
        .order("balance", { ascending: false });

      if (!error) {
        freelancersData = data || [];
      } else {
        console.log("Could not fetch freelancer data:", error);

        // Fallback query without alias
        try {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("freelancers")
            .select("id, full_name, balance")
            .order("balance", { ascending: false });

          if (!fallbackError && fallbackData) {
            // Transform the data to match expected structure
            freelancersData = fallbackData.map((item) => ({
              id: item.id,
              name: item.full_name,
              balance: item.balance,
            }));
          }
        } catch (fallbackErr) {
          console.warn("Fallback freelancer query failed:", fallbackErr);
        }
      }
    } catch (err) {
      console.warn("Could not fetch freelancer stats:", err);
    }

    // Get client stats - fixed query with proper spacing in the alias
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, contact_name as name, balance")
        .order("balance", { ascending: false });

      if (!error) {
        clientsData = data || [];
      } else {
        console.log("Could not fetch client data:", error);

        // Fallback query without alias
        try {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("clients")
            .select("id, contact_name, balance")
            .order("balance", { ascending: false });

          if (!fallbackError && fallbackData) {
            // Transform the data to match expected structure
            clientsData = fallbackData.map((item) => ({
              id: item.id,
              name: item.contact_name,
              balance: item.balance,
            }));
          }
        } catch (fallbackErr) {
          console.warn("Fallback client query failed:", fallbackErr);
        }
      }
    } catch (err) {
      console.warn("Could not fetch client stats:", err);
    }

    // Get recent transactions
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(
          `
          id, 
          amount, 
          status, 
          created_at, 
          project_id, 
          client_id, 
          freelancer_id
        `
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error) {
        recentTransactions = data || [];
      } else {
        console.log("Note: Could not fetch recent transactions:", error);
      }
    } catch (err) {
      console.warn("Could not fetch recent transactions:", err);
    }

    // Get revenue by month
    try {
      const { data, error } = await supabase
        .from("platform_revenue")
        .select("amount, transaction_date");

      if (!error && data) {
        revenueByMonth = data.reduce((acc, item) => {
          if (!item.transaction_date) return acc;

          try {
            const date = new Date(item.transaction_date);
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${year}-${month + 1}`;

            if (!acc[key]) acc[key] = 0;
            acc[key] += item.amount || 0;
          } catch (err) {
            console.warn("Error processing transaction date:", err);
          }

          return acc;
        }, {} as Record<string, number>);
      } else {
        console.log("Note: Could not fetch monthly revenue data:", error);
      }
    } catch (err) {
      console.warn("Could not fetch revenue by month:", err);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        transactionsCount,
        freelancersCount: freelancersData.length,
        clientsCount: clientsData.length,
        topFreelancers: freelancersData.slice(0, 5),
        topClients: clientsData.slice(0, 5),
        recentTransactions,
        revenueByMonth,
      },
    });
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch admin statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
