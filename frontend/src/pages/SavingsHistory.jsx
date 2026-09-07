import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/client";

export default function SavingsHistory() {
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/members/${memberId}`).then((res) => setMember(res.data));
    api.get(`/savings/member/${memberId}`).then((res) => setData(res.data));
  }, [memberId]);

  const fmt = (n) => `GH₵ ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-1">Member Savings History</h1>
      {member && (
        <p className="text-gray-600 mb-4">
          Member: {member.full_name} ({member.member_code}) — Current Balance:{" "}
          <span className="font-semibold text-susu-green">{fmt(data?.totalSavings)}</span>
        </p>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Note</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {data?.history?.map((h) => (
              <tr key={h.id} className="border-t">
                <td className="p-3">{new Date(h.txn_date).toLocaleDateString()}</td>
                <td>{fmt(h.amount)}</td>
                <td>{h.payment_method}</td>
                <td>{h.note || "-"}</td>
                <td>{fmt(h.running_balance)}</td>
              </tr>
            ))}
            {!data?.history?.length && (
              <tr><td colSpan={5} className="text-center text-gray-400 py-6">No savings recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="font-semibold">Total Savings: {fmt(data?.totalSavings)}</p>
        <button onClick={() => window.print()} className="border px-4 py-2 rounded text-sm">
          Print
        </button>
      </div>
    </Layout>
  );
}
