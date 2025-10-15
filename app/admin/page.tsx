"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type User = { id: number; name: string; email: string };

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setErr("");
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Failed to load users");
      }
      const data: User[] = await res.json();
      setUsers(data);
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

  if (loading) return <p className="p-4">Loading patients…</p>;
  if (err) return <p className="p-4 text-red-600">{err}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mini EMR — Admin Dashboard</h1>

      <table className="border-collapse border border-gray-400 w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border p-2">{u.id}</td>
              <td className="border p-2">
                <Link
                  href={`/admin/patients/${u.id}`}
                  className="text-blue-600 underline"
                >
                  {u.name}
                </Link>
              </td>
              <td className="border p-2">{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
