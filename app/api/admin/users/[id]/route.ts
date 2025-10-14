import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

// ---------------- GET: Fetch one user ----------------
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = Number(id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      appointments: true,
      prescriptions: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// ---------------- PUT: Update user info ----------------
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = Number(id);
    const body = await request.json();
    const { name, email, password } = body;

    const data: any = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      data.passwordHash = hashed;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    console.error("Failed to update user:", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
