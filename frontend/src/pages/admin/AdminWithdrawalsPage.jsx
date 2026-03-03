import { useEffect, useState } from "react";
import api from "../../api/api";

export default function AdminWithdrawalsPage() {
  const [status, setStatus] = useState("PENDING");
  const [withdrawals, setWithdrawals] = useState([]);
  const admin = JSON.parse(localStorage.getItem("user") || "null");

  const load = async (s = status) => {
    const res = await api.get(`/admin/withdrawals?status=${s}`);
    setWithdrawals(res.data || []);
  };

  useEffect(() => { load(); }, [status]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Withdrawals</h1>
      <div className="flex gap-2">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1 rounded ${status === s ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>{s}</button>
        ))}
      </div>
      {withdrawals.map((w) => (
        <div key={w.id} className="bg-white border rounded p-3">
          <div>User #{w.userId} • ₹{w.amount} • {w.status}</div>
          {status === "PENDING" && (
            <div className="mt-2 space-x-2">
              <button onClick={async () => { await api.post(`/admin/withdrawals/${w.id}/approve?adminId=${admin?.id}`); load(); }} className="bg-green-600 text-white px-2 py-1 rounded">Approve</button>
              <button onClick={async () => {
                const reason = prompt("Rejection reason");
                if (!reason) return;
                await api.post(`/admin/withdrawals/${w.id}/reject?adminId=${admin?.id}`, { reason });
                load();
              }} className="bg-red-600 text-white px-2 py-1 rounded">Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
