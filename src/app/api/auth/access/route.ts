import { NextResponse } from "next/server";
import { getAuthenticatedUserOrNull, isUserAdmin } from "@/lib/server/dashboard-auth";

export const runtime = "edge";

export async function GET() {
  const auth = await getAuthenticatedUserOrNull();
  if ("response" in auth) {
    return auth.response;
  }
  if (!auth.user) {
    return NextResponse.json({ authenticated: false, isAdmin: false });
  }
  const admin = await isUserAdmin(auth.user);
  return NextResponse.json({ authenticated: true, isAdmin: admin });
}
