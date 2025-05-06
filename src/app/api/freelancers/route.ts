// app/api/freelancers/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const freelancerId = url.searchParams.get("id");
    const limit = url.searchParams.get("limit");
    const offset = url.searchParams.get("offset");
    const search = url.searchParams.get("search");

    console.log(`Fetching freelancers, params:`, {
      freelancerId,
      limit,
      offset,
      search,
    });

    let query = supabase.from("freelancers").select("*");

    // Apply search filter if provided
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,full_name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    if (freelancerId) {
      // Fetch specific freelancer by ID
      const { data: freelancer, error } = await query
        .eq("id", freelancerId)
        .single();

      if (error) {
        console.error("Error fetching freelancer:", error);
        return NextResponse.json(
          { error: "Failed to fetch freelancer" },
          { status: 500 }
        );
      }

      // Get projects for this freelancer with fresh data
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("freelancer_id", freelancerId);

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
      }

      // Add cache control headers
      const response = NextResponse.json({
        freelancer,
        projects: projects || [],
      });
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );
      return response;
    }

    // Apply pagination if provided
    if (limit) {
      query = query.limit(parseInt(limit, 10));
    } else {
      query = query.limit(20); // Default limit
    }

    const {
      data: freelancers,
      error,
      count,
    } = await query.order("rating", { ascending: false }).returns<any[]>();

    if (error) {
      console.error("Error fetching freelancers:", error);
      return NextResponse.json(
        { error: "Failed to fetch freelancers" },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("freelancers")
      .select("*", { count: "exact", head: true });

    // Add cache control headers
    const response = NextResponse.json({
      freelancers,
      pagination: {
        total: totalCount,
        limit: limit ? parseInt(limit, 10) : 20,
        offset: offset ? parseInt(offset, 10) : 0,
      },
    });
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return response;
  } catch (error) {
    console.error("Error in freelancers API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
