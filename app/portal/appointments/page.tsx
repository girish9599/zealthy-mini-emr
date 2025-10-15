"use client";

import { useCallback, useEffect, useState } from "react";

type Appointment = {
  id: number;
  provider: string;
  start: string; // ISO datetime from API
  repeat: string | null;
};

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setErr("");
    try {
      const res = await fetch("/api/patient/appointments", {
        cache: "no-store",
      });
      if (res.status === 401) {
        // if you want, redirect to /login; for now show message
        throw new Error("Not authenticated");
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Failed to load appointments");
      }
      const data: Appointment[] = await res.json();
      setItems(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p className="p-4">Loading appointments…</p>;
  if (err) return <p className="p-4 text-red-600">{err}</p>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">All appointments (next 3 months)</h1>

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
                No appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
