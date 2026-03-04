import { useEffect, useMemo, useState } from "react";
import api, { uploadFile } from "../../api/api";
import { services } from "../../data/Services";
import { Badge, Card, DangerButton, EmptyState, InputField, PageContainer, PrimaryButton, SectionHeader, SelectField, SecondaryButton, TextAreaField } from "../../components/ui";

const EMPTY_BANNER = {
  title: "",
  imageUrl: "",
  redirectType: "SERVICE",
  targetId: "",
  redirectPath: "/",
  sortOrder: 1,
  displaySeconds: 5,
  placement: "HOME",
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

const deriveTypeAndTarget = (redirectPath = "") => {
  if (!redirectPath) return { redirectType: "SERVICE", targetId: "" };
  if (redirectPath === "/#all-services") return { redirectType: "ALL_SERVICES", targetId: "" };
  if (redirectPath === "/#other-services") return { redirectType: "OTHER_SERVICES", targetId: "" };
  if (redirectPath.startsWith("/service/")) return { redirectType: "SERVICE", targetId: redirectPath.split("/service/")[1] || "" };
  if (redirectPath.startsWith("/other-services/")) return { redirectType: "OTHER_SERVICE", targetId: redirectPath.split("/other-services/")[1] || "" };
  return { redirectType: "SERVICE", targetId: "" };
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [otherServices, setOtherServices] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [itemForm, setItemForm] = useState({ name: "", price: "", availableQuantity: "" });
  const [bannerForm, setBannerForm] = useState(EMPTY_BANNER);
  const [editingBanner, setEditingBanner] = useState(null);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE);
  const [editingService, setEditingService] = useState(null);

  const notifyApiError = (err) => alert(err?.response?.data || err?.message || "Request failed");

  const load = async () => {
    const [bannersRes, otherServicesRes] = await Promise.allSettled([api.get("/admin/banners"), api.get("/admin/other-services")]);
    if (bannersRes.status === "fulfilled") setBanners(bannersRes.value.data || []);
    else { setBanners([]); notifyApiError(bannersRes.reason); }

    if (otherServicesRes.status === "fulfilled") setOtherServices(otherServicesRes.value.data || []);
    else { setOtherServices([]); notifyApiError(otherServicesRes.reason); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selectedServiceId) return setItems([]);
    api.get(`/admin/other-services/${selectedServiceId}/items`)
      .then((r) => setItems(r.data || []))
      .catch((err) => { setItems([]); notifyApiError(err); });
  }, [selectedServiceId]);

  const redirectPreview = useMemo(() => buildRedirectPath(bannerForm.redirectType, bannerForm.targetId), [bannerForm.redirectType, bannerForm.targetId]);

  const serviceTargetOptions = useMemo(() => services.map((service) => ({ id: String(service.id), label: `${service.id} - ${service.name}` })), []);
  const otherServiceTargetOptions = useMemo(() => otherServices.map((service) => ({ id: String(service.id), label: `${service.id} - ${service.name}` })), [otherServices]);

  const validateBanner = (form) => {
    if (!form.title.trim()) return "Banner title is required";
    if (!form.imageUrl?.trim()) return "Banner image is required";
    if ((form.redirectType === "SERVICE" || form.redirectType === "OTHER_SERVICE") && !form.targetId) return "Please select a target ID";
    return null;
  };

  const saveBanner = async () => {
    const error = validateBanner(bannerForm);
    if (error) return alert(error);

    try {
      await api.post("/admin/banners", {
        title: bannerForm.title,
        imageUrl: bannerForm.imageUrl,
        redirectPath: redirectPreview,
        sortOrder: Number(bannerForm.sortOrder || 1),
        displaySeconds: Number(bannerForm.displaySeconds || 5),
        placement: bannerForm.placement || "HOME",
        active: true,
      });
      setBannerForm({ ...EMPTY_BANNER, sortOrder: banners.length + 1 });
      load();
    } catch (err) { notifyApiError(err); }
  };

  const startEditBanner = (banner) => {
    const parsed = deriveTypeAndTarget(banner.redirectPath);
    setEditingBanner({
      ...banner,
      redirectType: parsed.redirectType,
      targetId: parsed.targetId,
      displaySeconds: banner.displaySeconds || 5,
      placement: banner.placement || "HOME",
    });
  };

  const updateBanner = async () => {
    if (!editingBanner) return;
    const error = validateBanner(editingBanner);
    if (error) return alert(error);

    try {
      await api.put(`/admin/banners/${editingBanner.id}`, {
        ...editingBanner,
        redirectPath: buildRedirectPath(editingBanner.redirectType, editingBanner.targetId),
        sortOrder: Number(editingBanner.sortOrder || 1),
        displaySeconds: Number(editingBanner.displaySeconds || 5),
        placement: editingBanner.placement || "HOME",
      });
      setEditingBanner(null);
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
    <PageContainer title="Banner & Service Management" subtitle="Publish campaigns, attach redirect targets, and manage service menu items.">
      <Card>
        <SectionHeader title="Create Banner" subtitle="Add title, placement, timing, image and redirect destination." />
        <div className="grid gap-3 md:grid-cols-2">
          <InputField label="Title" placeholder="Festival Offer Banner" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} />
          <InputField label="Sort order" type="number" value={bannerForm.sortOrder} onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: e.target.value })} />
          <InputField label="Display seconds" type="number" value={bannerForm.displaySeconds} onChange={(e) => setBannerForm({ ...bannerForm, displaySeconds: e.target.value })} />
          <SelectField label="Placement" value={bannerForm.placement} onChange={(e) => setBannerForm({ ...bannerForm, placement: e.target.value })}>
            <option value="HOME">Home</option>
            <option value="TOP">Top</option>
          </SelectField>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <SelectField label="Redirect Type" value={bannerForm.redirectType} onChange={(e) => setBannerForm({ ...bannerForm, redirectType: e.target.value, targetId: "" })}>
            <option value="SERVICE">Service page</option>
            <option value="OTHER_SERVICE">Other service page</option>
            <option value="ALL_SERVICES">All services section</option>
            <option value="OTHER_SERVICES">Other services section</option>
          </SelectField>

          {bannerForm.redirectType === "SERVICE" && (
            <SelectField label="Target ID (Service)" value={bannerForm.targetId} onChange={(e) => setBannerForm({ ...bannerForm, targetId: e.target.value })}>
              <option value="">Select service</option>
              {serviceTargetOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </SelectField>
          )}

          {bannerForm.redirectType === "OTHER_SERVICE" && (
            <SelectField label="Target ID (Other Service)" value={bannerForm.targetId} onChange={(e) => setBannerForm({ ...bannerForm, targetId: e.target.value })}>
              <option value="">Select other service</option>
              {otherServiceTargetOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </SelectField>
          )}
        </div>

        <div className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
          <p className="font-medium">Target ID Guide</p>
          <ul className="mt-1 list-disc pl-5 text-xs text-indigo-800">
            <li><b>Service page</b>: select a fixed service ID.</li>
            <li><b>Other service page</b>: select an existing other-service ID.</li>
            <li><b>All services / Other services</b>: no target ID needed.</li>
          </ul>
          <p className="mt-2">Redirect preview: <span className="font-semibold">{redirectPreview}</span></p>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <input type="file" accept="image/*" className="block w-full text-sm" onChange={async (e) => {
            try {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 20 * 1024 * 1024) return alert("File must be below 20MB");
              const imageUrl = await uploadFile(file);
              setBannerForm((prev) => ({ ...prev, imageUrl }));
            } catch (err) { notifyApiError(err); }
          }} />
          <PrimaryButton onClick={saveBanner}>Publish Banner</PrimaryButton>
        </div>
        {bannerForm.imageUrl && <img src={bannerForm.imageUrl} alt="banner-preview" className="mt-3 h-28 w-full rounded-lg object-cover" />}
      </Card>

      <Card>
        <SectionHeader title="Existing Banners" subtitle="Edit or delete already published banners." />
        {banners.length === 0 ? <EmptyState title="No banners available" /> : (
          <div className="space-y-2">
            {banners.map((banner) => (
              <div key={banner.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">#{banner.id} - {banner.title}</p>
                  <p className="truncate text-xs text-gray-500">{banner.redirectPath || "/"}</p>
                  <p className="text-xs text-indigo-600">Placement: {banner.placement || "HOME"} • {banner.displaySeconds || 5}s</p>
                </div>
                <div className="flex gap-2">
                  <SecondaryButton onClick={() => startEditBanner(banner)}>Edit</SecondaryButton>
                  <DangerButton onClick={async () => { await api.delete(`/admin/banners/${banner.id}`); if (editingBanner?.id === banner.id) setEditingBanner(null); load(); }}>Delete</DangerButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {editingBanner && (
        <Card>
          <SectionHeader title={`Edit Banner: ${editingBanner.title}`} action={<Badge tone="purple">Banner ID #{editingBanner.id}</Badge>} />
          <div className="grid gap-3 md:grid-cols-2">
            <InputField label="Banner Name" value={editingBanner.title || ""} onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })} />
            <InputField label="Sort order" type="number" value={editingBanner.sortOrder || 1} onChange={(e) => setEditingBanner({ ...editingBanner, sortOrder: e.target.value })} />
            <InputField label="Display seconds" type="number" value={editingBanner.displaySeconds || 5} onChange={(e) => setEditingBanner({ ...editingBanner, displaySeconds: e.target.value })} />
            <SelectField label="Placement" value={editingBanner.placement || "HOME"} onChange={(e) => setEditingBanner({ ...editingBanner, placement: e.target.value })}>
              <option value="HOME">Home</option>
              <option value="TOP">Top</option>
            </SelectField>
            <SelectField label="Redirect Type" value={editingBanner.redirectType || "SERVICE"} onChange={(e) => setEditingBanner({ ...editingBanner, redirectType: e.target.value, targetId: "" })}>
              <option value="SERVICE">Service page</option>
              <option value="OTHER_SERVICE">Other service page</option>
              <option value="ALL_SERVICES">All services section</option>
              <option value="OTHER_SERVICES">Other services section</option>
            </SelectField>
            {editingBanner.redirectType === "SERVICE" && (
              <SelectField label="Target ID (Service)" value={editingBanner.targetId || ""} onChange={(e) => setEditingBanner({ ...editingBanner, targetId: e.target.value })}>
                <option value="">Select service</option>
                {serviceTargetOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </SelectField>
            )}
            {editingBanner.redirectType === "OTHER_SERVICE" && (
              <SelectField label="Target ID (Other Service)" value={editingBanner.targetId || ""} onChange={(e) => setEditingBanner({ ...editingBanner, targetId: e.target.value })}>
                <option value="">Select other service</option>
                {otherServiceTargetOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </SelectField>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <input type="file" accept="image/*" className="block w-full text-sm" onChange={async (e) => {
              try {
                const file = e.target.files?.[0];
                if (!file) return;
                const imageUrl = await uploadFile(file);
                setEditingBanner((prev) => ({ ...prev, imageUrl }));
              } catch (err) { notifyApiError(err); }
            }} />
            <PrimaryButton onClick={updateBanner}>Save Banner</PrimaryButton>
            <SecondaryButton onClick={() => setEditingBanner(null)}>Cancel</SecondaryButton>
          </div>
          {editingBanner.imageUrl && <img src={editingBanner.imageUrl} alt="edit-banner-preview" className="mt-3 h-28 w-full rounded-lg object-cover" />}
        </Card>
      )}

      <Card>
        <SectionHeader title="Create Other Service" subtitle="Create marketplace services with image, description and starting price." />
        <div className="grid gap-3 md:grid-cols-2">
          <InputField label="Service name" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} />
          <InputField label="Start price" value={serviceForm.startPrice} onChange={(e) => setServiceForm({ ...serviceForm, startPrice: e.target.value })} />
        </div>
        <TextAreaField label="Description" className="mt-3" value={serviceForm.menuDetails} onChange={(e) => setServiceForm({ ...serviceForm, menuDetails: e.target.value })} />
        <div className="mt-3 flex items-center gap-3">
          <input type="file" accept="image/*" className="block w-full text-sm" onChange={async (e) => {
            try {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 20 * 1024 * 1024) return alert("File must be below 20MB");
              const imageUrl = await uploadFile(file);
              setServiceForm((prev) => ({ ...prev, imageUrl }));
            } catch (err) { notifyApiError(err); }
          }} />
          <PrimaryButton onClick={saveOtherService}>Publish Service</PrimaryButton>
        </div>
        {serviceForm.imageUrl && <img src={serviceForm.imageUrl} alt="service-preview" className="mt-3 h-28 w-full rounded-lg object-cover" />}
      </Card>

      <Card>
        <SectionHeader title="Existing Other Services" />
        {otherServices.length === 0 ? <EmptyState title="No services published yet" /> : (
          <div className="space-y-2">
            {otherServices.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                <div>
                  <p className="font-medium text-gray-900">#{s.id} - {s.name}</p>
                  <p className="text-xs text-gray-500">{s.menuDetails}</p>
                </div>
                <div className="flex gap-2">
                  <SecondaryButton onClick={() => { setSelectedServiceId(String(s.id)); setEditingService(s); }}>Edit</SecondaryButton>
                  <DangerButton onClick={async () => { await api.delete(`/admin/other-services/${s.id}`); load(); }}>Delete</DangerButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {editingService && (
        <Card>
          <SectionHeader title={`Edit Service & Manage Items: ${editingService.name}`} action={<Badge tone="purple">Service ID #{editingService.id}</Badge>} />
          <div className="grid gap-3 md:grid-cols-2">
            <InputField label="Name" value={editingService.name || ""} onChange={(e) => setEditingService({ ...editingService, name: e.target.value })} />
            <InputField label="Start price" value={editingService.startPrice || ""} onChange={(e) => setEditingService({ ...editingService, startPrice: e.target.value })} />
          </div>
          <TextAreaField label="Description" className="mt-3" value={editingService.menuDetails || ""} onChange={(e) => setEditingService({ ...editingService, menuDetails: e.target.value })} />
          <div className="mt-3 flex items-center gap-3">
            <input type="file" accept="image/*" className="block w-full text-sm" onChange={async (e) => {
              try {
                const file = e.target.files?.[0];
                if (!file) return;
                const imageUrl = await uploadFile(file);
                setEditingService((prev) => ({ ...prev, imageUrl }));
              } catch (err) { notifyApiError(err); }
            }} />
            <PrimaryButton onClick={updateService}>Save Service</PrimaryButton>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 p-4">
            <SectionHeader title="Menu Items" subtitle="Add or remove item name, price and available quantity." />
            <div className="grid gap-3 md:grid-cols-3">
              <InputField label="Item name" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
              <InputField label="Price" type="number" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} />
              <InputField label="Available quantity" type="number" value={itemForm.availableQuantity} onChange={(e) => setItemForm({ ...itemForm, availableQuantity: e.target.value })} />
            </div>
            <PrimaryButton className="mt-3" onClick={addMenuItem}>Add Menu Item</PrimaryButton>
            <div className="mt-4 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-2 text-sm">
                  <span>{item.name} • ₹{item.price} • Qty {item.availableQuantity}</span>
                  <DangerButton onClick={async () => {
                    await api.delete(`/admin/other-services/items/${item.id}`);
                    const res = await api.get(`/admin/other-services/${selectedServiceId}/items`);
                    setItems(res.data || []);
                  }}>Delete</DangerButton>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
