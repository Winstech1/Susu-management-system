import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function ManageUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "agent",
  });
  const [message, setMessage] = useState("");

  function load() {
    api.get("/auth/users").then((res) => setUsers(res.data));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/auth/users", form);
      setMessage("✅ User created successfully");
      setForm({ fullName: "", username: "", email: "", password: "", role: "agent" });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create user");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this user's access?")) return;
    await api.delete(`/auth/users/${id}`);
    load();
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Manage Users</h1>

      <form onSubmit={handleCreate} className="bg-white border rounded-lg p-4 mb-6 max-w-md space-y-3">
        <h2 className="font-semibold text-sm text-gray-600">Add New User</h2>
        {message && <p className="text-sm bg-gray-50 border p-2 rounded">{message}</p>}

        <input
          placeholder="Full name"
          className="w-full border rounded px-3 py-2"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />
        <input
          placeholder="Username"
          className="w-full border rounded px-3 py-2"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          placeholder="Email (optional)"
          className="w-full border rounded px-3 py-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          className="w-full border rounded px-3 py-2"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="agent">Agent (limited access)</option>
          <option value="admin">Admin (full access)</option>
        </select>

        <button className="bg-susu-green text-white px-4 py-2 rounded text-sm">
          Create User
        </button>
      </form>

      <div className="bg-white border rounded-lg overflow-hidden max-w-2xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.full_name}</td>
                <td>{u.username}</td>
                <td>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td>
                  {u.id !== user?.id && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-600">
                      remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}