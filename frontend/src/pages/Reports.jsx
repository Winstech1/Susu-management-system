import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/client";

const REPORT_TYPES = [
  { key: "savings", label: "Savings Report", icon: "📈" },
  { key: "withdrawals", label: "Withdrawals Report", icon: "📉" },
  { key: "cashbook", label: "Daily Cashbook", icon: "📒" },
];

export default function Reports() {
  const [active, setActive] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState(null);

  async function generate(type) {
    setActive(type);
    setResult(null);
    if (type === "cashbook") {
      const res = await api.get("/reports/daily-cashbook", { params: { date: from || undefined } });
      setResult(res.data);
    } else {
      const res = await api.get(`/reports/${type}`, { params: { from, to } });
      setResult(res.data);
    }
  }

  const fmt = (n) => `GH₵ ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Reports</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.key}
            onClick={() => generate(r.key)}
            className={`bg-white border rounded-lg p-4 w-48 text-left hover:shadow ${
              active === r.key ? "ring-2 ring-susu-green" : ""
            }`}
          >
            <div className="text-2xl mb-1">{r.icon}</div>
            <div className="font-semibold text-sm">{r.label}</div>
          </button>
        ))}
        <Link
          to="/reports/member-statement"
          className="bg-white border rounded-lg p-4 w-48 text-left hover:shadow"
        >
          <div className="text-2xl mb-1">🧾</div>
          <div className="font-semibold text-sm">Member Statement</div>
        </Link>
      </div>

      {active && active !== "cashbook" && (
        <div className="flex gap-3 items-end mb-4">
          <div>
            <label className="text-xs text-gray-500 block">From</label>
            <input type="date" className="border rounded px-2 py-1" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block">To</label>
            <input type="date" className="border rounded px-2 py-1" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button onClick={() => generate(active)} className="bg-susu-green text-white px-3 py-1.5 rounded text-sm">
            Generate
          </button>
        </div>
      )}

      {active === "cashbook" && (
        <div className="flex gap-3 items-end mb-4">
          <div>
            <label className="text-xs text-gray-500 block">Date</label>
            <input type="date" className="border rounded px-2 py-1" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <button onClick={() => generate("cashbook")} className="bg-susu-green text-white px-3 py-1.5 rounded text-sm">
            Generate
          </button>
        </div>
      )}

      {result && (active === "savings" || active === "withdrawals") && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="p-3">Date</th>
                <th>Member</th>
                <th>Amount</th>
                <th>{active === "savings" ? "Note" : "Reason"}</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{new Date(r.txn_date).toLocaleDateString()}</td>
                  <td>{r.member}</td>
                  <td>{fmt(r.amount)}</td>
                  <td>{r.note || r.reason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 font-semibold border-t bg-gray-50">Total: {fmt(result.total)}</div>
        </div>
      )}

      {result && active === "cashbook" && (
        <div className="bg-white border rounded-lg p-4">
          <p className="font-semibold mb-2">Cashbook for {result.date}</p>
          <p className="text-susu-green">Total In: {fmt(result.totalIn)}</p>
          <p className="text-red-600">Total Out: {fmt(result.totalOut)}</p>
          <p className="font-bold mt-1">Net Cashflow: {fmt(result.netCashflow)}</p>
        </div>
      )}
    </Layout>
  );
}
