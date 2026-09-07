import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/client";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function load() {
    api.get("/groups").then((res) => setGroups(res.data));
  }

  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/groups", { name, description });
      setName("");
      setDescription("");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add group");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this group? Members will be unassigned, not deleted.")) return;
    await api.delete(`/groups/${id}`);
    load();
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Groups</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-susu-green text-white px-4 py-2 rounded text-sm font-semibold"
        >
          + Add Group
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border rounded-lg p-4 mb-4 max-w-md space-y-3">
          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
          <input
            placeholder="Group name (e.g. Group A)"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Description (optional)"
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" className="bg-susu-green text-white px-4 py-2 rounded text-sm">
            Save Group
          </button>
        </form>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Group Name</th>
              <th>Members</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} className="border-t">
                <td className="p-3">{g.name}</td>
                <td>{g.member_count}</td>
                <td className="space-x-2">
                  <button className="text-blue-600">edit</button>
                  <button onClick={() => handleDelete(g.id)} className="text-red-600">delete</button>
                </td>
              </tr>
            ))}
            {!groups.length && (
              <tr><td colSpan={3} className="text-center text-gray-400 py-6">No groups yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
