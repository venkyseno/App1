import { useEffect, useState } from "react";
import api from "../../api/api";
import { fileToDataUrl } from "../../utils/file";

const EMPTY_BANNER = { title: "", imageUrl: "", redirectPath: "/", sortOrder: 1, active: true };
const EMPTY_SERVICE = { name: "", menuDetails: "", imageUrl: "", startPrice: "", active: true };

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [otherServices, setOtherServices] = useState([]);
  const [bannerForm, setBannerForm] = useState(EMPTY_BANNER);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE);

  const load = async () => {
    const [b, s] = await Promise.all([api.get("/admin/banners"), api.get("/admin/other-services")]);
    setBanners(b.data || []);
    setOtherServices(s.data || []);
  };

  useEffect(() => { load(); }, []);

  const notifyApiError = (err) => {
    alert(err?.response?.data?.message || err?.response?.data || "Request failed. Please check fields and retry.");
  };

  const saveBanner = async () => {
    if (!bannerForm.title.trim()) return alert("Banner title is required");
    if (!bannerForm.imageUrl?.trim()) return alert("Banner image is required");

    try {
      await api.post("/admin/banners", { ...bannerForm, sortOrder: Number(bannerForm.sortOrder || 1) });
      setBannerForm({ ...EMPTY_BANNER, sortOrder: banners.length + 1 });
      load();
    } catch (err) {
      notifyApiError(err);
    }
  };

  const saveOtherService = async () => {
    if (!serviceForm.name.trim()) return alert("Other service name is required");
    if (!serviceForm.imageUrl?.trim()) return alert("Other service image is required");

    try {
      await api.post("/admin/other-services", serviceForm);
      setServiceForm(EMPTY_SERVICE);
      load();
    } catch (err) {
      notifyApiError(err);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Banner & Other Services Management</h1>

      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-3">Create New Banner</h2>
        <input className="border p-2 rounded w-full mb-2" placeholder="Title (required)" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} />
        <input className="border p-2 rounded w-full mb-2" placeholder="Redirect path" value={bannerForm.redirectPath} onChange={(e) => setBannerForm({ ...bannerForm, redirectPath: e.target.value })} />
        <input className="border p-2 rounded w-full mb-2" placeholder="Sort order" type="number" value={bannerForm.sortOrder} onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: e.target.value })} />
        <input className="border p-2 rounded w-full mb-2" type="file" accept="image/*" capture="environment" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const dataUrl = await fileToDataUrl(file);
          setBannerForm({ ...bannerForm, imageUrl: dataUrl });
        }} />
        <button onClick={saveBanner} className="bg-indigo-600 text-white px-4 py-2 rounded">Publish Banner</button>

        <div className="mt-4 space-y-2">
          {banners.map((banner) => (
            <div key={banner.id} className="border rounded p-2 flex justify-between items-center">
              <span>{banner.title}</span>
              <div className="space-x-2">
                <button onClick={async () => {
                  const title = prompt("Edit title", banner.title);
                  if (!title) return;
                  try {
                    await api.put(`/admin/banners/${banner.id}`, { ...banner, title });
                    load();
                  } catch (err) { notifyApiError(err); }
                }} className="text-blue-600">Edit</button>
                <button onClick={async () => { await api.delete(`/admin/banners/${banner.id}`); load(); }} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-3">Create / Manage Other Services</h2>
        <input className="border p-2 rounded w-full mb-2" placeholder="Service name (required)" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} />
        <textarea className="border p-2 rounded w-full mb-2" placeholder="Menu details" value={serviceForm.menuDetails} onChange={(e) => setServiceForm({ ...serviceForm, menuDetails: e.target.value })} />
        <input className="border p-2 rounded w-full mb-2" placeholder="Start price" value={serviceForm.startPrice} onChange={(e) => setServiceForm({ ...serviceForm, startPrice: e.target.value })} />
        <input className="border p-2 rounded w-full mb-2" type="file" accept="image/*" capture="environment" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const dataUrl = await fileToDataUrl(file);
          setServiceForm({ ...serviceForm, imageUrl: dataUrl });
        }} />
        <button onClick={saveOtherService} className="bg-green-600 text-white px-4 py-2 rounded">Publish Other Service</button>

        <div className="mt-4 space-y-2">
          {otherServices.map((s) => (
            <div key={s.id} className="border rounded p-2 flex justify-between items-center">
              <span>{s.name}</span>
              <div className="space-x-2">
                <button onClick={async () => {
                  const name = prompt("Edit service name", s.name);
                  if (!name) return;
                  try {
                    await api.put(`/admin/other-services/${s.id}`, { ...s, name });
                    load();
                  } catch (err) { notifyApiError(err); }
                }} className="text-blue-600">Edit</button>
                <button onClick={async () => { await api.delete(`/admin/other-services/${s.id}`); load(); }} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
