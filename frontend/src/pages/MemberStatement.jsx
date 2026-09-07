import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/client";

export default function MemberStatement() {
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get("/members", { params: { limit: 1000 } }).then((res) => setMembers(res.data.members));
  }, []);

  async function generate() {
    if (!memberId) return;
    const res = await api.get(`/reports/member-statement/${memberId}`, { params: { from, to } });
    setResult(res.data);
  }

  const fmt = (n) => `GH₵ ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Member Statement</h1>

      <div className="bg-white border rounded-lg p-4 max-w-md space-y-3 mb-4">
        <div>
          <label className="text-sm text-gray-600">Select Member</label>
          <select
            className="w-full border rounded px-3 py-2 mt-1"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          >
            <option value="">-- choose --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.full_name} ({m.member_code})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500">From</label>
            <input type="date" className="w-full border rounded px-2 py-1" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">To</label>
            <input type="date" className="w-full border rounded px-2 py-1" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <button onClick={generate} className="bg-susu-green text-white px-4 py-2 rounded text-sm w-full">
          Generate
        </button>
      </div>

      {result && (
        <div className="bg-white border rounded-lg p-4 max-w-sm space-y-2">
          <p className="font-semibold">{result.member?.full_name}</p>
          <p className="text-sm">Total Savings: <span className="font-semibold text-susu-green">{fmt(result.totalSavings)}</span></p>
          <p className="text-sm">Total Withdrawals: <span className="font-semibold text-red-600">{fmt(result.totalWithdrawals)}</span></p>
          <p className="text-sm">Current Balance: <span className="font-semibold text-susu-gold">{fmt(result.currentBalance)}</span></p>
        </div>
      )}
    </Layout>
  );
}
