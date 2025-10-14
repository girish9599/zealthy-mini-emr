import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST() {
  // remove the session cookie
  await clearSession();

  // send the user back to /login
  return NextResponse.redirect(
    new URL(
      "/login",
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    )
  );
}
