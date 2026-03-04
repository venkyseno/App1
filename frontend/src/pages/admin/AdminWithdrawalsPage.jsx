import { useEffect, useState } from "react";
import api from "../../api/api";
import { Badge, Card, DangerButton, EmptyState, PageContainer, PrimaryButton, SectionHeader, SecondaryButton } from "../../components/ui";

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
    <PageContainer title="Withdrawals" subtitle="Review and process cashback withdrawal requests.">
      <div className="flex gap-2">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-lg px-3 py-2 text-sm font-medium ${status === s ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700"}`}>{s}</button>
        ))}
      </div>
      <Card>
        <SectionHeader title={`${status} Requests`} />
        {withdrawals.length === 0 ? <EmptyState title="No withdrawals found" /> : withdrawals.map((w) => (
          <div key={w.id} className="mb-2 rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>User #{w.userId} • ₹{w.amount}</span>
              <Badge tone={status === "APPROVED" ? "green" : status === "REJECTED" ? "red" : "yellow"}>{w.status}</Badge>
            </div>
            {status === "PENDING" && (
              <div className="mt-3 flex gap-2">
                <PrimaryButton onClick={async () => { await api.post(`/admin/withdrawals/${w.id}/approve?adminId=${admin?.id}`); load(); }}>Approve</PrimaryButton>
                <DangerButton onClick={async () => { const reason = prompt("Rejection reason"); if (!reason) return; await api.post(`/admin/withdrawals/${w.id}/reject?adminId=${admin?.id}`, { reason }); load(); }}>Reject</DangerButton>
              </div>
            )}
          </div>
        ))}
      </Card>
    </PageContainer>
  );
}
