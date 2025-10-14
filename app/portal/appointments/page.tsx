"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Appointment = {
  id: number;
  provider: string;
  start: string;
  repeat: string | null;
};

export default function AllAppointmentsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/patient/appointments", {
          cache: "no-store",
        });
        if (res.status === 401) return router.push("/login");
        if (!res.ok) throw new Error("Failed to load appointments");
        const data: Appointment[] = await res.json();
        setItems(data);
      } catch (e: any) {
        setErr(e?.message ?? "Unexpected error");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (err) return <p className="p-4 text-red-600">{err}</p>;

  return (
    <main className="p-6 space-y-4">
      <button className="underline" onClick={() => router.push("/portal")}>
        ← Back to portal
      </button>
      <h1 className="text-2xl font-bold">
        All Upcoming Appointments (next 3 months)
      </h1>

      <table className="border-collapse border w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Date/Time</th>
            <th className="border p-2">Provider</th>
            <th className="border p-2">Repeat</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((a) => (
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
                No appointments found in the next 90 days.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
