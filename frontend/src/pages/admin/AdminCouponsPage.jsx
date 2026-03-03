import { useEffect, useState } from "react";
import api from "../../api/api";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", message: "", active: true });

  const load = async () => {
    const res = await api.get("/admin/coupons");
    setCoupons(res.data || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Coupons Management</h1>
      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-2">Add Coupon</h2>
        <input className="border p-2 rounded w-full mb-2" placeholder="Coupon code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <textarea className="border p-2 rounded w-full mb-2" placeholder="Coupon message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <button onClick={async () => { await api.post('/admin/coupons', form); setForm({ code: "", message: "", active: true }); load(); }} className="bg-indigo-600 text-white px-4 py-2 rounded">Add Coupon</button>
      </section>

      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-2">Existing Coupons</h2>
        {coupons.map((c) => (
          <div key={c.id} className="border rounded p-2 mb-2 flex justify-between">
            <span>{c.code} - {c.message}</span>
            <div className="space-x-2">
              <button onClick={async () => {
                const code = prompt("Code", c.code);
                const message = prompt("Message", c.message);
                if (!code || !message) return;
                await api.put(`/admin/coupons/${c.id}`, { ...c, code, message });
                load();
              }} className="text-blue-600">Edit</button>
              <button onClick={async () => { await api.delete(`/admin/coupons/${c.id}`); load(); }} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
