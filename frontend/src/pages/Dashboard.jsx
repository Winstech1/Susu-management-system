import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/client";

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm flex-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  const fmt = (n) => `GH₵ ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        <StatCard label="Total Members" value={data?.totalMembers ?? "..."} color="text-gray-800" />
        <StatCard label="Total Savings" value={fmt(data?.totalSavings)} color="text-susu-green" />
        <StatCard label="Total Withdrawals" value={fmt(data?.totalWithdrawals)} color="text-red-600" />
        <StatCard label="Current Balance" value={fmt(data?.currentBalance)} color="text-susu-gold" />
      </div>

      <div className="bg-white border rounded-lg overflow-x-auto">
        <h2 className="font-semibold mb-3">Recent Transactions</h2>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Date</th>
              <th>Description</th>
              <th>Member</th>
              <th>Amount</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {data?.recentTransactions?.map((t, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2">{new Date(t.date).toLocaleDateString()}</td>
                <td>{t.description}</td>
                <td>{t.member}</td>
                <td>{fmt(t.amount)}</td>
                <td>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      t.type === "Credit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {t.type}
                  </span>
                </td>
              </tr>
            ))}
            {!data?.recentTransactions?.length && (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-4">
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
