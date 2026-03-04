import { useEffect, useMemo, useState } from "react";
import api, { uploadFile } from "../../api/api";

const EMPTY_BANNER = {
  title: "",
  imageUrl: "",
  redirectType: "SERVICE",
  targetId: "",
  redirectPath: "/",
  sortOrder: 1,
  active: true,
};

const EMPTY_SERVICE = { name: "", menuDetails: "", imageUrl: "", startPrice: "", active: true };

const buildRedirectPath = (type, targetId) => {
  if (type === "ALL_SERVICES") return "/#all-services";
  if (type === "OTHER_SERVICES") return "/#other-services";
  if (type === "SERVICE") return `/service/${targetId || 1}`;
  if (type === "OTHER_SERVICE") return `/other-services/${targetId || 1}`;
  return "/";
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [otherServices, setOtherServices] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [itemForm, setItemForm] = useState({ name: "", price: "", availableQuantity: "" });
  const [bannerForm, setBannerForm] = useState(EMPTY_BANNER);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE);
  const [editingService, setEditingService] = useState(null);

  const load = async () => {
    const [b, s] = await Promise.all([api.get("/admin/banners"), api.get("/admin/other-services")]);
    setBanners(b.data || []);
    setOtherServices(s.data || []);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!selectedServiceId) return setItems([]);
    api.get(`/admin/other-services/${selectedServiceId}/items`).then((r) => setItems(r.data || []));
  }, [selectedServiceId]);

  const notifyApiError = (err) => alert(err?.response?.data || err?.message || "Request failed");

  const redirectPreview = useMemo(
    () => buildRedirectPath(bannerForm.redirectType, bannerForm.targetId),
    [bannerForm.redirectType, bannerForm.targetId],
  );

  const saveBanner = async () => {
    if (!bannerForm.title.trim()) return alert("Banner title is required");
    if (!bannerForm.imageUrl?.trim()) return alert("Banner image is required");

    try {
      await api.post("/admin/banners", {
        title: bannerForm.title,
        imageUrl: bannerForm.imageUrl,
        redirectPath: redirectPreview,
        sortOrder: Number(bannerForm.sortOrder || 1),
        active: true,
      });
      setBannerForm({ ...EMPTY_BANNER, sortOrder: banners.length + 1 });
      load();
    } catch (err) { notifyApiError(err); }
  };

  const saveOtherService = async () => {
    if (!serviceForm.name.trim()) return alert("Other service name is required");
    if (!serviceForm.imageUrl?.trim()) return alert("Other service image is required");
    try {
      await api.post("/admin/other-services", serviceForm);
      setServiceForm(EMPTY_SERVICE);
      load();
    } catch (err) { notifyApiError(err); }
  };

  const updateService = async () => {
    if (!editingService) return;
    if (!editingService.name?.trim()) return alert("Service name is required");
    if (!editingService.imageUrl?.trim()) return alert("Service image is required");
    try {
      await api.put(`/admin/other-services/${editingService.id}`, editingService);
      setEditingService(null);
      load();
    } catch (err) { notifyApiError(err); }
  };

  const addMenuItem = async () => {
    if (!selectedServiceId) return alert("Select a service");
    if (!itemForm.name.trim()) return alert("Item name is required");
    if (!itemForm.price) return alert("Item price is required");
    if (!itemForm.availableQuantity) return alert("Quantity is required");

    try {
      await api.post(`/admin/other-services/${selectedServiceId}/items`, {
        name: itemForm.name,
        price: Number(itemForm.price),
        availableQuantity: Number(itemForm.availableQuantity),
      });
      setItemForm({ name: "", price: "", availableQuantity: "" });
      const res = await api.get(`/admin/other-services/${selectedServiceId}/items`);
      setItems(res.data || []);
    } catch (err) { notifyApiError(err); }
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-indigo-50 to-cyan-50 min-h-screen">
      <h1 className="text-2xl font-bold text-indigo-900">Banner & Service Management</h1>

      <section className="bg-white rounded-2xl p-5 shadow border border-indigo-100">
        <h2 className="font-semibold mb-3">Create New Banner</h2>
        <input className="border p-2 rounded w-full mb-2" placeholder="Title (required)" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} />
        <div className="grid md:grid-cols-2 gap-2 mb-2">
          <select className="border p-2 rounded" value={bannerForm.redirectType} onChange={(e) => setBannerForm({ ...bannerForm, redirectType: e.target.value })}>
            <option value="SERVICE">Service page</option>
            <option value="OTHER_SERVICE">Other service page</option>
            <option value="ALL_SERVICES">All services section</option>
            <option value="OTHER_SERVICES">Other services section</option>
          </select>
          {(bannerForm.redirectType === "SERVICE" || bannerForm.redirectType === "OTHER_SERVICE") && (
            <input className="border p-2 rounded" placeholder="Target ID" value={bannerForm.targetId} onChange={(e) => setBannerForm({ ...bannerForm, targetId: e.target.value })} />
          )}
        </div>
        <p className="text-xs text-gray-500 mb-2">Redirect preview: <b>{redirectPreview}</b></p>
        <input className="border p-2 rounded w-full mb-2" placeholder="Sort order" type="number" value={bannerForm.sortOrder} onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: e.target.value })} />
        <input className="border p-2 rounded w-full mb-2" type="file" accept="image/*" capture="environment" onChange={async (e) => {
          try {
            const file = e.target.files?.[0];
            if (!file) return;
            const imageUrl = await uploadFile(file);
            setBannerForm((prev) => ({ ...prev, imageUrl }));
          } catch (err) { notifyApiError(err); }
        }} />
        <button onClick={saveBanner} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Publish Banner</button>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow border border-indigo-100">
        <h2 className="font-semibold mb-3">Create Other Service</h2>
        <input className="border p-2 rounded w-full mb-2" placeholder="Service name (required)" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} />
        <textarea className="border p-2 rounded w-full mb-2" placeholder="Service description" value={serviceForm.menuDetails} onChange={(e) => setServiceForm({ ...serviceForm, menuDetails: e.target.value })} />
        <input className="border p-2 rounded w-full mb-2" placeholder="Start price" value={serviceForm.startPrice} onChange={(e) => setServiceForm({ ...serviceForm, startPrice: e.target.value })} />
        <input className="border p-2 rounded w-full mb-2" type="file" accept="image/*" capture="environment" onChange={async (e) => {
          try {
            const file = e.target.files?.[0];
            if (!file) return;
            const imageUrl = await uploadFile(file);
            setServiceForm((prev) => ({ ...prev, imageUrl }));
          } catch (err) { notifyApiError(err); }
        }} />
        <button onClick={saveOtherService} className="bg-emerald-600 text-white px-4 py-2 rounded-lg">Publish Other Service</button>

        <div className="mt-4 space-y-2">
          {otherServices.map((s) => (
            <div key={s.id} className="border rounded p-2 flex justify-between items-center">
              <span>{s.name}</span>
              <div className="space-x-3">
                <button onClick={() => { setSelectedServiceId(String(s.id)); setEditingService(s); }} className="text-indigo-600">Edit</button>
                <button onClick={async () => { await api.delete(`/admin/other-services/${s.id}`); load(); }} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {editingService && (
        <section className="bg-white rounded-2xl p-5 shadow border border-indigo-100">
          <h2 className="font-semibold mb-3">Edit Service & Manage Items: {editingService.name}</h2>
          <input className="border p-2 rounded w-full mb-2" value={editingService.name || ""} onChange={(e) => setEditingService({ ...editingService, name: e.target.value })} />
          <textarea className="border p-2 rounded w-full mb-2" value={editingService.menuDetails || ""} onChange={(e) => setEditingService({ ...editingService, menuDetails: e.target.value })} />
          <input className="border p-2 rounded w-full mb-2" value={editingService.startPrice || ""} onChange={(e) => setEditingService({ ...editingService, startPrice: e.target.value })} />
          <input className="border p-2 rounded w-full mb-2" type="file" accept="image/*" capture="environment" onChange={async (e) => {
            try {
              const file = e.target.files?.[0];
              if (!file) return;
              const imageUrl = await uploadFile(file);
              setEditingService((prev) => ({ ...prev, imageUrl }));
            } catch (err) { notifyApiError(err); }
          }} />
          <button onClick={updateService} className="bg-indigo-600 text-white px-4 py-2 rounded-lg mb-3">Save Service</button>

          <h3 className="font-medium mb-2">Menu Items</h3>
          <input className="border p-2 rounded w-full mb-2" placeholder="Item name" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
          <input className="border p-2 rounded w-full mb-2" type="number" placeholder="Price" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} />
          <input className="border p-2 rounded w-full mb-2" type="number" placeholder="Available quantity" value={itemForm.availableQuantity} onChange={(e) => setItemForm({ ...itemForm, availableQuantity: e.target.value })} />
          <button onClick={addMenuItem} className="bg-black text-white px-4 py-2 rounded">Add Menu Item</button>

          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <div key={item.id} className="border rounded p-2 flex justify-between">
                <span>{item.name} • ₹{item.price} • Qty {item.availableQuantity}</span>
                <button onClick={async () => {
                  await api.delete(`/admin/other-services/items/${item.id}`);
                  const res = await api.get(`/admin/other-services/${selectedServiceId}/items`);
                  setItems(res.data || []);
                }} className="text-red-600">Delete</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
