import { useEffect, useState } from "react";
import api from "../api/api";

export default function AdminDashboard() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [cases, setCases] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [banners, setBanners] = useState([]);
  const [otherServices, setOtherServices] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const admin = JSON.parse(localStorage.getItem("user") || "null");

  const fetchAll = async () => {
    const [w, c, wk, apps, bn, os, cp] = await Promise.all([
      api.get("/admin/withdrawals?status=PENDING").catch(() => ({ data: [] })),
      api.get("/admin/cases").catch(() => ({ data: [] })),
      api.get("/admin/users/workers").catch(() => ({ data: [] })),
      api.get("/admin/worker-applications").catch(() => ({ data: [] })),
      api.get("/admin/banners").catch(() => ({ data: [] })),
      api.get("/admin/other-services").catch(() => ({ data: [] })),
      api.get("/admin/coupons").catch(() => ({ data: [] })),
    ]);
    setWithdrawals(w.data); setCases(c.data); setWorkers(wk.data); setApplications(apps.data); setBanners(bn.data); setOtherServices(os.data); setCoupons(cp.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const approveWithdrawal = async (id) => { await api.post(`/admin/withdrawals/${id}/approve?adminId=${admin?.id}`); fetchAll(); };
  const approveApplication = async (id) => { await api.post(`/admin/worker-applications/${id}/approve`); fetchAll(); };
  const assignCase = async (caseId, workerId) => { await api.post(`/cases/${caseId}/assign-worker?workerId=${workerId}`); fetchAll(); };
  const createBanner = async () => {
    const title = prompt("Banner title"); const imageUrl = prompt("Banner image URL");
    if (!title || !imageUrl) return;
    await api.post("/admin/banners", { title, imageUrl, redirectPath: "/", sortOrder: banners.length + 1, active: true });
    fetchAll();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <section><h2 className="text-lg font-semibold mb-2">Banner management</h2><button onClick={createBanner} className="bg-indigo-600 text-white px-3 py-1 rounded">Add banner</button>{banners.map(b => <div key={b.id} className="text-sm mt-1">• {b.title}</div>)}</section>

      <section><h2 className="text-lg font-semibold mb-2">Pending worker submissions</h2>{applications.map(a => <div key={a.id} className="border p-2 mb-2 rounded">{a.workerType} - {a.experienceLevel} - {a.mobile} ({a.status}) {a.status==='PENDING' && <button onClick={() => approveApplication(a.id)} className="ml-2 bg-green-600 text-white px-2 rounded">Approve</button>}</div>)}</section>

      <section><h2 className="text-lg font-semibold mb-2">All workers</h2>{workers.map(w => <div key={w.id} className="text-sm">• {w.name} ({w.mobile})</div>)}</section>

      <section><h2 className="text-lg font-semibold mb-2">Cases / works</h2>{cases.map(c => <div key={c.id} className="border p-2 mb-2 rounded">Case #{c.id} {c.description} [{c.status}]<select className="border ml-2" onChange={(e) => e.target.value && assignCase(c.id, e.target.value)}><option value="">Assign worker</option>{workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>)}</section>

      <section><h2 className="text-lg font-semibold mb-2">Other services</h2>{otherServices.map(s => <div key={s.id}>• {s.name} ({s.startPrice})</div>)}</section>
      <section><h2 className="text-lg font-semibold mb-2">Coupons</h2>{coupons.map(c => <div key={c.id}>• {c.code}</div>)}</section>

      <section><h2 className="text-lg font-semibold mb-2">Pending Withdrawals</h2>{withdrawals.length===0 && <p>No pending withdrawals.</p>}{withdrawals.map(w => <div key={w.id} className="border p-2 rounded mb-2">{w.userId} ₹{w.amount} <button onClick={() => approveWithdrawal(w.id)} className="bg-green-600 text-white px-2 rounded ml-2">Approve</button></div>)}</section>
    </div>
  );
}
