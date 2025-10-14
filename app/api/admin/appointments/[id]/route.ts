import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await prisma.appointment.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
