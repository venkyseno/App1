import { useParams, useNavigate } from "react-router-dom";
import { services } from "../data/Services";
import { useState } from "react";
import api from "../api/api";
import { fileToDataUrl } from "../utils/file";
import { Card, InputField, PageContainer, PrimaryButton, TextAreaField } from "../components/ui";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const service = services.find((s) => s.id === Number(id));
  if (!service) return <PageContainer><Card><h2 className="text-xl font-semibold">Service not found</h2></Card></PageContainer>;

  const handleBook = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return navigate("/login");
    setLoading(true);
    try {
      const res = await api.post("/cases", { serviceId: service.id, description: description || service.name, customerPhone: user.mobile, assistedByUserId: user.id, attachmentUrl });
      if (res.data?.data?.id) navigate("/profile/orders");
    } catch (err) { alert("Booking failed: " + (err.response?.data || err.message)); }
    finally { setLoading(false); }
  };

  return (
    <PageContainer title={service.name} subtitle="Describe your requirement and confirm booking.">
      <Card>
        <img src={service.image} alt={service.name} className="mb-4 h-56 w-full rounded-xl object-cover" />
        <p className="text-sm text-gray-600 mb-4">{service.description}</p>
        <TextAreaField rows="4" label="Issue description" placeholder="Describe your issue" value={description} onChange={(e)=>setDescription(e.target.value)} />
        <div className="mt-3">
          <InputField type="file" label="Attachment (image/video/pdf)" accept="image/*,video/*,.pdf" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const dataUrl = await fileToDataUrl(file); setAttachmentUrl(dataUrl); }} />
          {!!attachmentUrl && <p className="mt-2 text-xs text-green-700">Attachment selected successfully.</p>}
        </div>
        <PrimaryButton onClick={handleBook} disabled={loading} className="mt-4 w-full">{loading ? "Booking..." : "Confirm Booking"}</PrimaryButton>
      </Card>
    </PageContainer>
  );
}
