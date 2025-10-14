import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const now = new Date();
  const weekAhead = new Date(now);
  weekAhead.setDate(now.getDate() + 7);

  const idNum = Number(userId);

  // load the user with next-7-days data we want to show on the portal
  const user = await prisma.user.findUnique({
    where: { id: idNum },
    include: {
      appointments: {
        where: { start: { gte: now, lte: weekAhead } },
        orderBy: { start: "asc" },
      },
      prescriptions: {
        where: { refillOn: { gte: now, lte: weekAhead } },
        orderBy: { refillOn: "asc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    upcomingAppointments: user.appointments,
    upcomingRefills: user.prescriptions,
  });
}
