import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/client";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  function load() {
    api
      .get("/members", { params: { search, page, limit } })
      .then((res) => {
        setMembers(res.data.members);
        setTotal(res.data.total);
      });
  }

  useEffect(load, [search, page]);

  async function handleDelete(id) {
    if (!confirm("Delete this member? This cannot be undone.")) return;
    await api.delete(`/members/${id}`);
    load();
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Members</h1>
        <Link
          to="/members/add"
          className="bg-susu-green text-white px-4 py-2 rounded text-sm font-semibold"
        >
          + Add Member
        </Link>
      </div>

      <input
        placeholder="Search member..."
        className="border rounded px-3 py-2 mb-4 w-72"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Group</th>
              <th>Date Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-3">{m.member_code}</td>
                <td>{m.full_name}</td>
                <td>{m.phone_number}</td>
                <td>{m.group_name || "-"}</td>
                <td>{new Date(m.date_joined).toLocaleDateString()}</td>
                <td className="space-x-2">
                  <Link to={`/members/${m.id}/edit`} className="text-blue-600">edit</Link>
                  <Link to={`/savings/history/${m.id}`} className="text-susu-green">view</Link>
                  <button onClick={() => handleDelete(m.id)} className="text-red-600">delete</button>
                </td>
              </tr>
            ))}
            {!members.length && (
              <tr><td colSpan={6} className="text-center text-gray-400 py-6">No members found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-3 text-sm">
        <span>Total: {total} members</span>
        <div className="space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-2 py-1 rounded ${p === page ? "bg-susu-green text-white" : "border"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
