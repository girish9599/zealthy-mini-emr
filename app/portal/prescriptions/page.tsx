"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Rx = {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: string;
  refillSchedule?: string | null;
};

export default function AllPrescriptionsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Rx[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/patient/prescriptions", {
          cache: "no-store",
        });
        if (res.status === 401) return router.push("/login");
        if (!res.ok) throw new Error("Failed to load prescriptions");
        const data: Rx[] = await res.json();
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
        Upcoming Prescription Refills (next 3 months)
      </h1>

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
          {items.length ? (
            items.map((p) => (
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
                No refills found in the next 90 days.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
