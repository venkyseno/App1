import { useEffect, useState } from "react";
import api from "../../api/api";
import { Card, DangerButton, EmptyState, InputField, PageContainer, PrimaryButton, SectionHeader, SecondaryButton, TextAreaField } from "../../components/ui";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", message: "", active: true });

  const load = async () => {
    const res = await api.get("/admin/coupons");
    setCoupons(res.data || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <PageContainer title="Coupons Management" subtitle="Create and manage active coupon campaigns.">
      <Card>
        <SectionHeader title="Add Coupon" />
        <div className="grid gap-3 md:grid-cols-2">
          <InputField label="Coupon code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <TextAreaField label="Coupon message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        <PrimaryButton className="mt-3" onClick={async () => { await api.post('/admin/coupons', form); setForm({ code: "", message: "", active: true }); load(); }}>Add Coupon</PrimaryButton>
      </Card>

      <Card>
        <SectionHeader title="Existing Coupons" />
        {coupons.length === 0 ? <EmptyState title="No coupons created yet" /> : coupons.map((c) => (
          <div key={c.id} className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 p-3">
            <span className="text-sm text-gray-700">{c.code} - {c.message}</span>
            <div className="flex gap-2">
              <SecondaryButton onClick={async () => { const code = prompt("Code", c.code); const message = prompt("Message", c.message); if (!code || !message) return; await api.put(`/admin/coupons/${c.id}`, { ...c, code, message }); load(); }}>Edit</SecondaryButton>
              <DangerButton onClick={async () => { await api.delete(`/admin/coupons/${c.id}`); load(); }}>Delete</DangerButton>
            </div>
          </div>
        ))}
      </Card>
    </PageContainer>
  );
}
