"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Appointment = {
  id: number;
  provider: string;
  start: string;
  repeat: string | null;
};

export default function PortalAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        const res = await fetch("/api/patient/appointments", {
          cache: "no-store",
        });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load appointments");
        const data: Appointment[] = await res.json();
        setAppointments(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        setErr(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (err) return <p className="p-4 text-red-600">{err}</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        All appointments (next 3 months)
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
          {appointments.map((a) => (
            <tr key={a.id}>
              <td className="border p-2">
                {new Date(a.start).toLocaleString()}
              </td>
              <td className="border p-2">{a.provider}</td>
              <td className="border p-2">{a.repeat ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
