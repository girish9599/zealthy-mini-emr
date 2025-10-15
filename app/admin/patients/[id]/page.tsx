"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Appointment = {
  id: number;
  provider: string;
  start: string;
  repeat: string;
};

type Prescription = {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: string;
  refillSchedule?: string;
};

type UserDetail = {
  id: number;
  name: string;
  email: string;
  appointments: Appointment[];
  prescriptions: Prescription[];
};

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("load failed");
      const data: UserDetail = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (!user) return <p className="p-4">Patient not found.</p>;

  return (
    <div className="p-6 space-y-8">
      <button className="underline" onClick={() => router.push("/admin")}>
        ← Back
      </button>

      <header>
        <h1 className="text-2xl font-bold">Patient: {user.name}</h1>
        <p className="text-sm text-gray-500">{user.email}</p>
      </header>

      {/* ------- APPOINTMENTS ------- */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Appointments</h2>

        {/* Create appointment form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const provider = (
              form.elements.namedItem("provider") as HTMLInputElement
            ).value;
            const start = (form.elements.namedItem("start") as HTMLInputElement)
              .value; // datetime-local
            const repeat = (
              form.elements.namedItem("repeat") as HTMLSelectElement
            ).value;

            await fetch(`/api/admin/users/${user.id}/appointments`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ provider, start, repeat }),
            });

            form.reset();
            await load();
          }}
          className="flex flex-wrap gap-2 items-center"
        >
          <input
            name="provider"
            placeholder="Provider"
            required
            className="border p-2"
          />
          <input
            name="start"
            type="datetime-local"
            required
            className="border p-2"
          />
          <select name="repeat" defaultValue="none" className="border p-2">
            <option value="none">none</option>
            <option value="weekly">weekly</option>
            <option value="monthly">monthly</option>
          </select>
          <button type="submit" className="border px-3 py-1 rounded">
            Add appointment
          </button>
        </form>

        <table className="border-collapse border w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Date/Time</th>
              <th className="border p-2">Provider</th>
              <th className="border p-2">Repeat</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {user.appointments.length ? (
              user.appointments.map((a) => (
                <tr key={a.id}>
                  <td className="border p-2">
                    {new Date(a.start).toLocaleString()}
                  </td>
                  <td className="border p-2">{a.provider}</td>
                  <td className="border p-2">{a.repeat}</td>
                  <td className="border p-2">
                    <button
                      className="underline text-red-600"
                      onClick={async () => {
                        if (!confirm("Delete this appointment?")) return;
                        await fetch(`/api/admin/appointments/${a.id}`, {
                          method: "DELETE",
                        });
                        await load();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border p-2" colSpan={4}>
                  No appointments
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* ------- PRESCRIPTIONS ------- */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Prescriptions</h2>

        {/* Create prescription form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const medication = (
              form.elements.namedItem("medication") as HTMLInputElement
            ).value;
            const dosage = (
              form.elements.namedItem("dosage") as HTMLInputElement
            ).value;
            const quantity = Number(
              (form.elements.namedItem("quantity") as HTMLInputElement).value
            );
            const refillOn = (
              form.elements.namedItem("refillOn") as HTMLInputElement
            ).value; // date
            const refillSchedule = (
              form.elements.namedItem("refillSchedule") as HTMLSelectElement
            ).value;

            await fetch(`/api/admin/users/${user.id}/prescriptions`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                medication,
                dosage,
                quantity,
                refillOn,
                refillSchedule,
              }),
            });

            form.reset();
            await load();
          }}
          className="flex flex-wrap gap-2 items-center"
        >
          <input
            name="medication"
            placeholder="Medication"
            required
            className="border p-2"
          />
          <input
            name="dosage"
            placeholder="Dosage"
            required
            className="border p-2"
          />
          <input
            name="quantity"
            type="number"
            min={1}
            required
            className="border p-2 w-24"
          />
          <input name="refillOn" type="date" required className="border p-2" />
          <select
            name="refillSchedule"
            defaultValue="monthly"
            className="border p-2"
          >
            <option value="monthly">monthly</option>
            <option value="weekly">weekly</option>
            <option value="none">none</option>
          </select>
          <button type="submit" className="border px-3 py-1 rounded">
            Add prescription
          </button>
        </form>

        <table className="border-collapse border w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Medication</th>
              <th className="border p-2">Dosage</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Refill On</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {user.prescriptions.length ? (
              user.prescriptions.map((p) => (
                <tr key={p.id}>
                  <td className="border p-2">{p.medication}</td>
                  <td className="border p-2">{p.dosage}</td>
                  <td className="border p-2">{p.quantity}</td>
                  <td className="border p-2">
                    {new Date(p.refillOn).toLocaleDateString()}
                  </td>
                  <td className="border p-2">
                    <button
                      className="underline text-red-600"
                      onClick={async () => {
                        if (!confirm("Delete this prescription?")) return;
                        await fetch(`/api/admin/prescriptions/${p.id}`, {
                          method: "DELETE",
                        });
                        await load();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border p-2" colSpan={5}>
                  No prescriptions
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
