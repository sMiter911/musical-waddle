import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logActivity } from "@/lib/actions/activity";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log the signup activity
    await logActivity({
      userId: session.user.id,
      type: "MEMBER",
      action: "signed up as a new member",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging signup:", error);
    return NextResponse.json(
      { error: "Failed to log signup" },
      { status: 500 }
    );
  }
}
