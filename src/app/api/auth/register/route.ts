import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { registerUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, mobile } = validationResult.data;

    // Register user
    const result = await registerUser({
      name,
      email,
      password,
      mobile,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: result.user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
