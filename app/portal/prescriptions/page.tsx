"use client";

import { useCallback, useEffect, useState } from "react";

type Prescription = {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: string; // ISO date from API
  refillSchedule: string | null;
};

export default function PrescriptionsPage() {
  const [items, setItems] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setErr("");
    try {
      const res = await fetch("/api/patient/prescriptions", {
        cache: "no-store",
      });
      if (res.status === 401) {
        throw new Error("Not authenticated");
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Failed to load prescriptions");
      }
      const data: Prescription[] = await res.json();
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

  if (loading) return <p className="p-4">Loading prescriptions…</p>;
  if (err) return <p className="p-4 text-red-600">{err}</p>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        All upcoming refills (next 3 months)
      </h1>

      <table className="border-collapse border w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Medication</th>
            <th className="border p-2">Dosage</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Refill On</th>
            <th className="border p-2">Schedule</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((p) => (
              <tr key={p.id}>
                <td className="border p-2">{p.medication}</td>
                <td className="border p-2">{p.dosage}</td>
                <td className="border p-2">{p.quantity}</td>
                <td className="border p-2">
                  {new Date(p.refillOn).toLocaleDateString()}
                </td>
                <td className="border p-2">{p.refillSchedule ?? "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border p-2" colSpan={5}>
                No prescriptions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
