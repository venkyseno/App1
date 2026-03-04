import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";

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
    <div className="border rounded p-3 mb-2">
      <div className="text-sm font-semibold">Case #{c.id} • {c.status}</div>
      <div className="text-sm text-gray-600">{c.description}</div>
      <div className="text-xs text-gray-500">Customer: {c.customerPhone} {c.workerId ? `| Worker ID: ${c.workerId}` : "| Not assigned"}</div>
      {!c.workerId && (
        <select className="border rounded p-1 mt-2" onChange={async (e) => {
          if (!e.target.value) return;
          await api.post(`/cases/${c.id}/assign-worker?workerId=${e.target.value}`);
          load();
        }}>
          <option value="">Assign worker</option>
          {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Works Created</h1>
      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-2">Unassigned Works</h2>
        {unassigned.map((c) => <CaseRow key={c.id} c={c} />)}
      </section>
      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-2">Assigned Works</h2>
        {assigned.map((c) => <CaseRow key={c.id} c={c} />)}
      </section>
    </div>
  );
}
