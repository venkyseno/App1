import { useEffect, useState } from "react";
import api, { uploadFile } from "../../api/api";

const EMPTY_BANNER = { title: "", imageUrl: "", redirectPath: "/", sortOrder: 1, active: true };
const EMPTY_SERVICE = { name: "", menuDetails: "", imageUrl: "", startPrice: "", active: true };

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [otherServices, setOtherServices] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [itemForm, setItemForm] = useState({ name: "", price: "", availableQuantity: "" });
  const [bannerForm, setBannerForm] = useState(EMPTY_BANNER);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE);

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

  const notifyApiError = (err) => alert(err?.response?.data?.message || err?.response?.data || "Request failed");

  const saveBanner = async () => {
    if (!bannerForm.title.trim()) return alert("Banner title is required");
    if (!bannerForm.imageUrl?.trim()) return alert("Banner image is required");
    try {
      await api.post("/admin/banners", { ...bannerForm, sortOrder: Number(bannerForm.sortOrder || 1) });
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
          const imageUrl = await uploadFile(file);
          setBannerForm({ ...bannerForm, imageUrl });
        }} />
        <button onClick={saveBanner} className="bg-indigo-600 text-white px-4 py-2 rounded">Publish Banner</button>
      </section>

      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-3">Create / Manage Other Services</h2>
        <input className="border p-2 rounded w-full mb-2" placeholder="Service name (required)" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} />
        <textarea className="border p-2 rounded w-full mb-2" placeholder="Service description" value={serviceForm.menuDetails} onChange={(e) => setServiceForm({ ...serviceForm, menuDetails: e.target.value })} />
        <input className="border p-2 rounded w-full mb-2" placeholder="Start price" value={serviceForm.startPrice} onChange={(e) => setServiceForm({ ...serviceForm, startPrice: e.target.value })} />
        <input className="border p-2 rounded w-full mb-2" type="file" accept="image/*" capture="environment" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const imageUrl = await uploadFile(file);
          setServiceForm({ ...serviceForm, imageUrl });
        }} />
        <button onClick={saveOtherService} className="bg-green-600 text-white px-4 py-2 rounded">Publish Other Service</button>

        <div className="mt-4 space-y-2">
          {otherServices.map((s) => (
            <div key={s.id} className="border rounded p-2 flex justify-between items-center">
              <span>{s.name}</span>
              <button onClick={() => setSelectedServiceId(String(s.id))} className="text-indigo-600">Manage menu items</button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-3">Menu Items (Other Services)</h2>
        <select className="border p-2 rounded w-full mb-2" value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}>
          <option value="">Select service</option>
          {otherServices.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
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
    </div>
  );
}
