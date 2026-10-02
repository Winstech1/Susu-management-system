import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/client";

export default function MemberAccount() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/members/${id}/account`).then((res) => setData(res.data));
  }, [id]);

  const fmt = (n) =>
    `GH₵ ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  if (!data) {
    return (
      <Layout>
        <p className="text-gray-400">Loading account...</p>
      </Layout>
    );
  }

  const { member, totalSavings, totalWithdrawals, currentBalance, savingsHistory, withdrawalHistory } = data;

  return (
    <Layout>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-xl font-bold">{member.full_name}</h1>
          <p className="text-gray-500 text-sm">
            Member ID: {member.member_code} · {member.group_name || "No group"} · Joined{" "}
            {new Date(member.date_joined).toLocaleDateString()}
          </p>
        </div>
        <Link to="/members" className="text-sm text-susu-green underline">
          ← Back to Members
        </Link>
      </div>

      {/* Account summary cards */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="bg-white border rounded-lg p-4 shadow-sm flex-1 min-w-[160px]">
          <p className="text-xs text-gray-500">Total Deposited</p>
          <p className="text-2xl font-bold text-susu-green">{fmt(totalSavings)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm flex-1 min-w-[160px]">
          <p className="text-xs text-gray-500">Total Withdrawn</p>
          <p className="text-2xl font-bold text-red-600">{fmt(totalWithdrawals)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm flex-1 min-w-[160px]">
          <p className="text-xs text-gray-500">Current Balance</p>
          <p className="text-2xl font-bold text-susu-gold">{fmt(currentBalance)}</p>
        </div>
      </div>

      {/* Savings history */}
      <div className="bg-white border rounded-lg overflow-x-auto mb-6">
        <h2 className="font-semibold p-3 border-b">Savings History</h2>
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {savingsHistory.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{new Date(s.txn_date).toLocaleDateString()}</td>
                <td>{fmt(s.amount)}</td>
                <td>{s.payment_method}</td>
                <td>{s.note || "-"}</td>
              </tr>
            ))}
            {!savingsHistory.length && (
              <tr><td colSpan={4} className="text-center text-gray-400 py-6">No savings recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Withdrawal history */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <h2 className="font-semibold p-3 border-b">Withdrawal History</h2>
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Date</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {withdrawalHistory.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="p-3">{new Date(w.txn_date).toLocaleDateString()}</td>
                <td>{fmt(w.amount)}</td>
                <td>{w.reason || "-"}</td>
                <td>{w.payment_method}</td>
              </tr>
            ))}
            {!withdrawalHistory.length && (
              <tr><td colSpan={4} className="text-center text-gray-400 py-6">No withdrawals recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}