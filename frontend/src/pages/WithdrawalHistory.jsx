import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/client";

export default function WithdrawalHistory() {
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/members/${memberId}`).then((res) => setMember(res.data));
    api.get(`/withdrawals/member/${memberId}`).then((res) => setData(res.data));
  }, [memberId]);

  const fmt = (n) => `GH₵ ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-1">Member Withdrawal History</h1>
      {member && (
        <p className="text-gray-600 mb-4">
          Member: {member.full_name} ({member.member_code}) — Total Withdrawn:{" "}
          <span className="font-semibold text-red-600">{fmt(data?.totalWithdrawn)}</span>
        </p>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Date</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {data?.history?.map((h) => (
              <tr key={h.id} className="border-t">
                <td className="p-3">{new Date(h.txn_date).toLocaleDateString()}</td>
                <td>{fmt(h.amount)}</td>
                <td>{h.reason || "-"}</td>
                <td>{h.payment_method}</td>
              </tr>
            ))}
            {!data?.history?.length && (
              <tr><td colSpan={4} className="text-center text-gray-400 py-6">No withdrawals recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={() => window.print()} className="border px-4 py-2 rounded text-sm">
          Print
        </button>
      </div>
    </Layout>
  );
}
