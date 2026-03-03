import { useEffect, useState } from "react";
import api from "../../api/api";

export default function AdminWorkersPage() {
  const [applications, setApplications] = useState([]);
  const [workers, setWorkers] = useState([]);

  const load = async () => {
    const [a, w] = await Promise.all([api.get("/admin/worker-applications"), api.get("/admin/users/workers")]);
    setApplications(a.data || []);
    setWorkers(w.data || []);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Workers Management</h1>

      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-3">Pending Worker Requests</h2>
        {applications.filter((x) => x.status === "PENDING").map((a) => (
          <div key={a.id} className="border rounded p-2 mb-2 flex justify-between items-center">
            <span>{a.workerType} | {a.experienceLevel} | {a.mobile}</span>
            <div className="space-x-2">
              <button onClick={async () => { await api.post(`/admin/worker-applications/${a.id}/approve`); load(); }} className="bg-green-600 text-white px-2 py-1 rounded">Approve</button>
              <button onClick={async () => { await api.post(`/admin/worker-applications/${a.id}/reject`); load(); }} className="bg-red-600 text-white px-2 py-1 rounded">Reject</button>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-3">Existing Workers</h2>
        {workers.map((w) => (
          <div key={w.id} className="border rounded p-2 mb-2 flex justify-between items-center">
            <span>{w.name} ({w.mobile})</span>
            <div className="space-x-2">
              <button onClick={async () => {
                const name = prompt("Name", w.name);
                if (!name) return;
                await api.put(`/admin/users/workers/${w.id}`, { ...w, name });
                load();
              }} className="text-blue-600">Edit</button>
              <button onClick={async () => { await api.delete(`/admin/users/workers/${w.id}`); load(); }} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
