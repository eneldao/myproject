import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface FreelancerRevenue {
  freelancer_id: string;
  amount: string;
  freelancers: { email: any }[];
}

interface ClientRevenue {
  client_id: string;
  amount: string;
  clients: { email: any }[];
}

interface ProjectTransaction {
  id: string;
  amount: string;
  transaction_date: string;
  project_id: string;
  projects: {
    title: any;
    description: any;
    status: any;
  }[];
}

export async function GET(request: Request) {
  try {
    // Initialize default values for all stats
    let totalRevenue = 0;
    let transactionsCount = 0;
    let freelancersData: any[] = [];
    let clientsData: any[] = [];
    let recentTransactions: any[] = [];
    let revenueByMonth = {};

    // Get total revenue from platform_revenue table
    try {
      const { data: revenueData, error: revenueError } = await supabase
        .from("platform_revenue")
        .select("amount");

      if (!revenueError && revenueData) {
        totalRevenue = revenueData.reduce(
          (sum, item) => sum + parseFloat(item.amount),
          0
        );
      }
    } catch (err) {
      console.warn("Could not fetch platform revenue:", err);
    }

    // Get transaction count from platform_revenue table
    try {
      const { count, error } = await supabase
        .from("platform_revenue")
        .select("*", { count: "exact", head: true });

      if (!error) {
        transactionsCount = count || 0;
      }
    } catch (err) {
      console.warn("Could not fetch transactions count:", err);
    }

    // Get top freelancers by revenue
    try {
      const { data: freelancerRevenue, error: freelancerError } =
        await supabase.from("platform_revenue").select(`
          freelancer_id,
          amount,
          freelancers (
            email
          )
        `);

      if (!freelancerError && freelancerRevenue) {
        const freelancerTotals = (
          freelancerRevenue as unknown as FreelancerRevenue[]
        ).reduce((acc, transaction) => {
          const id = transaction.freelancer_id;
          if (!acc[id]) {
            acc[id] = {
              id,
              name:
                transaction.freelancers[0]?.email?.split("@")[0] || "Anonymous",
              balance: 0,
            };
          }
          acc[id].balance += parseFloat(transaction.amount);
          return acc;
        }, {} as Record<string, any>);

        freelancersData = Object.values(freelancerTotals)
          .sort((a, b) => b.balance - a.balance)
          .slice(0, 5);
      }
    } catch (err) {
      console.warn("Could not fetch freelancer stats:", err);
    }

    // Get top clients by spending
    try {
      const { data: clientRevenue, error: clientError } = await supabase.from(
        "platform_revenue"
      ).select(`
          client_id,
          amount,
          clients (
            email
          )
        `);

      if (!clientError && clientRevenue) {
        const clientTotals = (
          clientRevenue as unknown as ClientRevenue[]
        ).reduce((acc, transaction) => {
          const id = transaction.client_id;
          if (!acc[id]) {
            acc[id] = {
              id,
              name: transaction.clients[0]?.email?.split("@")[0] || "Anonymous",
              balance: 0,
            };
          }
          acc[id].balance += parseFloat(transaction.amount);
          return acc;
        }, {} as Record<string, any>);

        clientsData = Object.values(clientTotals)
          .sort((a, b) => b.balance - a.balance)
          .slice(0, 5);
      }
    } catch (err) {
      console.warn("Could not fetch client stats:", err);
    }

    // Get recent transactions with project details
    try {
      const { data, error } = await supabase
        .from("platform_revenue")
        .select(
          `
          id,
          amount,
          transaction_date,
          project_id,
          projects (
            title,
            description,
            status
          )
        `
        )
        .order("transaction_date", { ascending: false })
        .limit(10);

      if (!error && data) {
        recentTransactions = (data as unknown as ProjectTransaction[]).map(
          (transaction) => ({
            id: transaction.id,
            amount: parseFloat(transaction.amount),
            status: transaction.projects[0]?.status || "pending",
            created_at: transaction.transaction_date,
            project_id: transaction.project_id,
            title:
              transaction.projects[0]?.title ||
              `Project #${transaction.project_id}`,
            description: transaction.projects[0]?.description,
          })
        );
      }
    } catch (err) {
      console.warn("Could not fetch recent transactions:", err);
    }

    // Get revenue by month from platform_revenue
    try {
      const { data, error } = await supabase
        .from("platform_revenue")
        .select("amount, transaction_date");

      if (!error && data) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        revenueByMonth = data.reduce((acc, item) => {
          const date = new Date(item.transaction_date);
          if (date < sixMonthsAgo) return acc;

          const key = date.toLocaleString("default", {
            month: "long",
            year: "numeric",
          });
          if (!acc[key]) acc[key] = 0;
          acc[key] += parseFloat(item.amount);
          return acc;
        }, {} as Record<string, number>);
      }
    } catch (err) {
      console.warn("Could not fetch revenue by month:", err);
    }

    // Get total counts
    const [{ count: freelancersCount }, { count: clientsCount }] =
      await Promise.all([
        supabase
          .from("freelancers")
          .select("*", { count: "exact", head: true }),
        supabase.from("clients").select("*", { count: "exact", head: true }),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        transactionsCount,
        freelancersCount: freelancersCount || 0,
        clientsCount: clientsCount || 0,
        topFreelancers: freelancersData,
        topClients: clientsData,
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
