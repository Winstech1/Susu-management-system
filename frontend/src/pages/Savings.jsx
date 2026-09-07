import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/client";

export default function Savings() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    memberId: "",
    txnDate: new Date().toISOString().slice(0, 10),
    amount: "",
    paymentMethod: "Cash",
    note: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/members", { params: { limit: 1000 } }).then((res) => setMembers(res.data.members));
  }, []);

  function clearForm() {
    setForm({ memberId: "", txnDate: new Date().toISOString().slice(0, 10), amount: "", paymentMethod: "Cash", note: "" });
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/savings", form);
      setMessage("✅ Savings recorded successfully");
      clearForm();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to record savings");
    }
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Record Savings</h1>

      <form onSubmit={handleSave} className="bg-white border rounded-lg p-6 max-w-md space-y-4">
        {message && <p className="text-sm bg-gray-50 border p-2 rounded">{message}</p>}

        <div>
          <label className="text-sm text-gray-600">Member</label>
          <select
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.memberId}
            onChange={(e) => setForm({ ...form, memberId: e.target.value })}
            required
          >
            <option value="">Select Member</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.full_name} ({m.member_code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.txnDate}
            onChange={(e) => setForm({ ...form, txnDate: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Amount (GHC)</label>
          <input
            type="number"
            step="0.01"
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Payment Method</label>
          <select
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          >
            <option>Cash</option>
            <option>Momo</option>
            <option>Bank</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">Note (optional)</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-susu-green text-white px-4 py-2 rounded font-semibold">
            Save
          </button>
          <button type="button" onClick={clearForm} className="border px-4 py-2 rounded">
            Clear
          </button>
          {form.memberId && (
            <button
              type="button"
              onClick={() => navigate(`/savings/history/${form.memberId}`)}
              className="text-susu-green underline text-sm self-center"
            >
              View History
            </button>
          )}
        </div>
      </form>
    </Layout>
  );
}
