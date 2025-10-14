// prisma/seed.ts
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import fs from "fs";

interface Data {
  medications: string[];
  dosages: string[];
  users: Array<{
    name: string;
    email: string;
    password: string;
    appointments: Array<{
      provider: string;
      datetime: string;
      repeat?: "none" | "weekly" | "monthly";
    }>;
    prescriptions: Array<{
      medication: string;
      dosage: string;
      quantity: number;
      refill_on: string;
      refill_schedule?: "monthly" | "weekly" | "none";
    }>;
  }>;
}

async function main() {
  console.log("🌱 Starting database seeding...");

  // Read JSON data
  const raw = fs.readFileSync("prisma/data.json", "utf-8");
  const data = JSON.parse(raw) as Data;

  // --- Seed Medication References ---
  for (const name of data.medications) {
    await prisma.medicationRef.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  // --- Seed Dosage References ---
  for (const value of data.dosages) {
    await prisma.dosageRef.upsert({
      where: { value },
      create: { value },
      update: {},
    });
  }

  // --- Seed Users, Appointments, and Prescriptions ---
  for (const u of data.users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
      },
      update: { name: u.name },
    });

    // Appointments
    for (const a of u.appointments) {
      await prisma.appointment.create({
        data: {
          userId: user.id,
          provider: a.provider,
          start: new Date(a.datetime),
          repeat: a.repeat ?? "none",
        },
      });
    }

    // Prescriptions
    for (const p of u.prescriptions) {
      await prisma.prescription.create({
        data: {
          userId: user.id,
          medication: p.medication,
          dosage: p.dosage,
          quantity: p.quantity,
          refillOn: new Date(p.refill_on),
          refillSchedule: p.refill_schedule ?? "monthly",
        },
      });
    }
  }

  console.log("✅ Database successfully seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
