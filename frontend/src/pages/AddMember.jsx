import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/client";

export default function AddMember() {
  const { id } = useParams(); // present when editing
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    groupId: "",
    dateJoined: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/groups").then((res) => setGroups(res.data));
    if (isEdit) {
      api.get(`/members/${id}`).then((res) => {
        const m = res.data;
        setForm({
          fullName: m.full_name,
          phoneNumber: m.phone_number,
          address: m.address || "",
          groupId: m.group_id || "",
          dateJoined: m.date_joined?.slice(0, 10),
        });
      });
    }
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    try {
      if (isEdit) {
        await api.put(`/members/${id}`, form);
      } else {
        await api.post("/members", form);
      }
      navigate("/members");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save member");
    }
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">{isEdit ? "Edit Member" : "Add New Member"}</h1>

      <form onSubmit={handleSave} className="bg-white border rounded-lg p-6 max-w-md space-y-4">
        {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}

        <div>
          <label className="text-sm text-gray-600">Full Name</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Phone Number</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Address</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Group</label>
          <select
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.groupId}
            onChange={(e) => setForm({ ...form, groupId: e.target.value })}
          >
            <option value="">Select Group</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">Date Joined</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.dateJoined}
            onChange={(e) => setForm({ ...form, dateJoined: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-susu-green text-white px-4 py-2 rounded font-semibold">
            Save
          </button>
          <button
            type="button"
            onClick={() => navigate("/members")}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </Layout>
  );
}
