import { useEffect, useState } from "react";
import api from "../../api/api";
import { Card, DangerButton, EmptyState, PageContainer, PrimaryButton, SectionHeader, SecondaryButton } from "../../components/ui";

export default function AdminWorkersPage() {
  const [applications, setApplications] = useState([]);
  const [workers, setWorkers] = useState([]);

  const load = async () => {
    const [a, w] = await Promise.all([api.get("/admin/worker-applications"), api.get("/admin/users/workers")]);
    setApplications(a.data || []);
    setWorkers(w.data || []);
  };

  useEffect(() => { load(); }, []);
  const pending = applications.filter((x) => x.status === "PENDING");

  return (
    <PageContainer title="Workers Management" subtitle="Approve incoming worker applications and maintain worker accounts.">
      <Card>
        <SectionHeader title="Pending Worker Requests" />
        {pending.length === 0 ? <EmptyState title="No pending requests" /> : pending.map((a) => (
          <div key={a.id} className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm">
            <span>{a.workerType} | {a.experienceLevel} | {a.mobile}</span>
            <div className="flex gap-2">
              <PrimaryButton onClick={async () => { await api.post(`/admin/worker-applications/${a.id}/approve`); load(); }}>Approve</PrimaryButton>
              <DangerButton onClick={async () => { await api.post(`/admin/worker-applications/${a.id}/reject`); load(); }}>Reject</DangerButton>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <SectionHeader title="Existing Workers" />
        {workers.length === 0 ? <EmptyState title="No workers available" /> : workers.map((w) => (
          <div key={w.id} className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm">
            <span>{w.name} ({w.mobile})</span>
            <div className="flex gap-2">
              <SecondaryButton onClick={async () => { const name = prompt("Name", w.name); if (!name) return; await api.put(`/admin/users/workers/${w.id}`, { ...w, name }); load(); }}>Edit</SecondaryButton>
              <DangerButton onClick={async () => { await api.delete(`/admin/users/workers/${w.id}`); load(); }}>Delete</DangerButton>
            </div>
          </div>
        ))}
      </Card>
    </PageContainer>
  );
}
