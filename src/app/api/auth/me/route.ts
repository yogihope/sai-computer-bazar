import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    // Return 200 with user: null if not logged in (avoids console errors)
    return NextResponse.json({
      success: !!user,
      user: user || null,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { success: false, user: null, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
