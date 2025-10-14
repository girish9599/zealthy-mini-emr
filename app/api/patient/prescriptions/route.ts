import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const now = new Date();
  const in90 = new Date(now);
  in90.setDate(now.getDate() + 90);

  const rx = await prisma.prescription.findMany({
    where: {
      userId: Number(userId),
      refillOn: { gte: now, lte: in90 },
    },
    orderBy: { refillOn: "asc" },
  });

  return NextResponse.json(rx);
}
