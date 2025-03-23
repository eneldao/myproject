import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    console.log("Received POST request");

    try {
        const { email, password } = await req.json();
        console.log("Request JSON parsed:", { email, password });

        if (!email || !password) {
            console.log("Validation failed: Email and password are required.");
            return NextResponse.json(
                { error: "Email and password are required." },
                { status: 400 }
            );
        }

        // Check if the user is admin
        const isAdmin = email === "admin@example.com";
        console.log("User role determined:", { email, role: isAdmin ? "admin" : "user" });

        return NextResponse.json(
            {
                email,
                role: isAdmin ? "admin" : "user",
                success: true,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error occurred:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again.", success: false },
            { status: 500 }
        );
    }
}
