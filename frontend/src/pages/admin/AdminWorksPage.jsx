import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import { Badge, Card, EmptyState, PageContainer, SectionHeader, SelectField } from "../../components/ui";

export default function AdminWorksPage() {
  const [cases, setCases] = useState([]);
  const [workers, setWorkers] = useState([]);

  const load = async () => {
    const [c, w] = await Promise.all([api.get("/admin/cases"), api.get("/admin/users/workers")]);
    setCases(c.data || []);
    setWorkers(w.data || []);
  };
  useEffect(() => { load(); }, []);

  const unassigned = useMemo(() => cases.filter((c) => !c.workerId), [cases]);
  const assigned = useMemo(() => cases.filter((c) => c.workerId), [cases]);

  const CaseRow = ({ c }) => (
    <div className="mb-2 rounded-lg border border-gray-200 p-3">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-sm font-semibold">Case #{c.id}</div>
        <Badge tone={c.workerId ? "blue" : "yellow"}>{c.status}</Badge>
      </div>
      <div className="text-sm text-gray-600">{c.description}</div>
      <div className="mt-1 text-xs text-gray-500">Customer: {c.customerPhone} {c.workerId ? `| Worker ID: ${c.workerId}` : "| Not assigned"}</div>
      {!c.workerId && (
        <SelectField className="mt-2" onChange={async (e) => { if (!e.target.value) return; await api.post(`/cases/${c.id}/assign-worker?workerId=${e.target.value}`); load(); }}>
          <option value="">Assign worker</option>
          {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </SelectField>
      )}
    </div>
  );

  return (
    <PageContainer title="Works Created" subtitle="Track open cases and assign available workers.">
      <Card>
        <SectionHeader title="Unassigned Works" />
        {unassigned.length === 0 ? <EmptyState title="No unassigned cases" /> : unassigned.map((c) => <CaseRow key={c.id} c={c} />)}
      </Card>
      <Card>
        <SectionHeader title="Assigned Works" />
        {assigned.length === 0 ? <EmptyState title="No assigned cases" /> : assigned.map((c) => <CaseRow key={c.id} c={c} />)}
      </Card>
    </PageContainer>
  );
}
