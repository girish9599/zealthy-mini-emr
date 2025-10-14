"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = { id: number; name: string; email: string };

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // create form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState(""); // optional when editing

  async function load() {
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
    } catch (e: any) {
      setError(e?.message ?? "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to create patient");
      }
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Unexpected error");
    }
  }

  function beginEdit(u: User) {
    setEditingId(u.id);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
    setEditPassword("");
  }

  async function saveEdit(id: number) {
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          // password is optional on update; only send if user typed one
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to update patient");
      }
      setEditingId(null);
      setEditName("");
      setEditEmail("");
      setEditPassword("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Unexpected error");
    }
  }

  if (loading) return <p className="p-4">Loading patients...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mini EMR — Admin Dashboard</h1>

      {error && (
        <div className="border border-red-500 bg-red-50 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {/* Create patient */}
      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Name</label>
          <input
            className="border p-2 rounded min-w-[220px]"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Full name"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            className="border p-2 rounded min-w-[260px]"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Password</label>
          <input
            type="password"
            className="border p-2 rounded min-w-[200px]"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="temporary password"
            required
          />
        </div>
        <button
          type="submit"
          className="border px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
        >
          Add patient
        </button>
      </form>

      {/* Patients table */}
      <table className="border-collapse border border-gray-400 w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 w-16">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2 w-40">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isEditing = editingId === u.id;
            return (
              <tr key={u.id}>
                <td className="border p-2">{u.id}</td>

                {/* Name cell */}
                <td className="border p-2">
                  {isEditing ? (
                    <input
                      className="border p-1 rounded w-full"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    <Link
                      href={`/admin/patients/${u.id}`}
                      className="text-blue-600 underline"
                    >
                      {u.name}
                    </Link>
                  )}
                </td>

                {/* Email cell */}
                <td className="border p-2">
                  {isEditing ? (
                    <input
                      className="border p-1 rounded w-full"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  ) : (
                    u.email
                  )}
                </td>

                {/* Actions */}
                <td className="border p-2 space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEdit(u.id)}
                        className="border px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="border px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                      <div className="mt-2">
                        <input
                          type="password"
                          placeholder="(optional) new password"
                          className="border p-1 rounded w-full"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => beginEdit(u)}
                      className="border px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
