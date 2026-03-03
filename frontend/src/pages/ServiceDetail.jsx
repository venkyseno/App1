import { useParams, useNavigate } from "react-router-dom";
import { services } from "../data/Services";
import { useState } from "react";
import api from "../api/api";
import { fileToDataUrl } from "../utils/file";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const service = services.find((s) => s.id === Number(id));
  if (!service) return <div className="p-6 text-center"><h2 className="text-xl font-semibold">Service not found</h2></div>;

  const handleBook = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return navigate("/login");
    setLoading(true);
    try {
      const res = await api.post("/cases", {
        serviceId: service.id,
        description: description || service.name,
        customerPhone: user.mobile,
        assistedByUserId: user.id,
        attachmentUrl,
      });
      if (res.data?.data?.id) navigate("/profile/orders");
    } catch (err) { alert("Booking failed: " + (err.response?.data || err.message)); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-4">
      <img src={service.image} alt={service.name} className="rounded-xl mb-4 w-full h-48 object-cover" />
      <h1 className="text-2xl font-bold mb-2">{service.name}</h1>
      <p className="text-gray-600 mb-4">{service.description}</p>
      <textarea className="border p-2 rounded w-full mb-3" rows="4" placeholder="Describe your issue" value={description} onChange={e=>setDescription(e.target.value)} />
      <input
        className="border p-2 rounded w-full mb-2"
        type="file"
        accept="image/*,video/*,.pdf"
        capture="environment"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const dataUrl = await fileToDataUrl(file);
          setAttachmentUrl(dataUrl);
        }}
      />
      {!!attachmentUrl && <p className="text-xs text-green-700 mb-4">Attachment selected successfully.</p>}
      <input className="border p-2 rounded w-full mb-6" placeholder="Attachment URL (optional)" value={attachmentUrl} onChange={e=>setAttachmentUrl(e.target.value)} />
      <button onClick={handleBook} disabled={loading} className="bg-black text-white w-full py-3 rounded-xl disabled:opacity-50">{loading ? "Booking..." : "Confirm Booking"}</button>
    </div>
  );
}
