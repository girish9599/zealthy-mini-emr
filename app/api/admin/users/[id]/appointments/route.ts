import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const userId = Number(id);
  const { provider, start, repeat } = await req.json();

  const created = await prisma.appointment.create({
    data: {
      userId,
      provider,
      start: new Date(start),
      repeat: repeat ?? "none",
    },
  });

  return NextResponse.json(created, { status: 201 });
}
