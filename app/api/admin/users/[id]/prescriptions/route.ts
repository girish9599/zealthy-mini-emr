import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params; // Next.js 15: await params
  const userId = Number(id);
  const { medication, dosage, quantity, refillOn, refillSchedule } =
    await req.json();

  const created = await prisma.prescription.create({
    data: {
      userId,
      medication,
      dosage,
      quantity: Number(quantity),
      refillOn: new Date(refillOn),
      refillSchedule: refillSchedule ?? "monthly",
    },
  });

  return NextResponse.json(created, { status: 201 });
}
