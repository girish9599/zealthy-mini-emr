"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Appointment = {
  id: number;
  provider: string;
  start: string;
  repeat: string | null;
};

type Prescription = {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: string;
  refillSchedule?: string | null;
};

type Me = {
  id: number;
  name: string;
  email: string;
  upcomingAppointments: Appointment[];
  upcomingRefills: Prescription[];
};

export default function PortalPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        const res = await fetch("/api/patient/me", { cache: "no-store" });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          const j: unknown = await res.json().catch(() => ({}));
          const msg =
            typeof j === "object" && j !== null && "error" in j
              ? String(
                  (j as { error?: unknown }).error ?? "Failed to load portal"
                )
              : "Failed to load portal";
          throw new Error(msg);
        }
        const data: Me = await res.json();
        setMe(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        setErr(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) return <p className="p-4">Loading your portal…</p>;
  if (err) return <p className="p-4 text-red-600">{err}</p>;
  if (!me) return null;

  return (
    <main className="p-6 space-y-6">
      {/* Header + Navigation */}
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {me.name}</h1>
          <p className="text-gray-600 text-sm">{me.email}</p>
        </div>

        <div className="flex items-center space-x-4">
          <nav className="space-x-3">
            <a href="/portal" className="underline hover:text-blue-700">
              Home
            </a>
            <a
              href="/portal/appointments"
              className="underline hover:text-blue-700"
            >
              Appointments
            </a>
            <a
              href="/portal/prescriptions"
              className="underline hover:text-blue-700"
            >
              Prescriptions
            </a>
          </nav>
          <button
            onClick={logout}
            className="border px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Appointments (7 days) */}
      <section>
        <h2 className="text-xl font-semibold mb-2">
          Next 7 days — Appointments
        </h2>
        <table className="border-collapse border w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Date/Time</th>
              <th className="border p-2">Provider</th>
              <th className="border p-2">Repeat</th>
            </tr>
          </thead>
          <tbody>
            {me.upcomingAppointments.length ? (
              me.upcomingAppointments.map((a) => (
                <tr key={a.id}>
                  <td className="border p-2">
                    {new Date(a.start).toLocaleString()}
                  </td>
                  <td className="border p-2">{a.provider}</td>
                  <td className="border p-2">{a.repeat ?? "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border p-2" colSpan={3}>
                  No appointments in the next 7 days.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Refills (7 days) */}
      <section>
        <h2 className="text-xl font-semibold mb-2">
          Next 7 days — Medication refills
        </h2>
        <table className="border-collapse border w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Medication</th>
              <th className="border p-2">Dosage</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Refill On</th>
            </tr>
          </thead>
          <tbody>
            {me.upcomingRefills.length ? (
              me.upcomingRefills.map((p) => (
                <tr key={p.id}>
                  <td className="border p-2">{p.medication}</td>
                  <td className="border p-2">{p.dosage}</td>
                  <td className="border p-2">{p.quantity}</td>
                  <td className="border p-2">
                    {new Date(p.refillOn).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border p-2" colSpan={4}>
                  No refills in the next 7 days.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
