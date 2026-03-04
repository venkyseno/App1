import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function BannerSlider() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    api.get("/config/banners").then((res) => setBanners(res.data || [])).catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners.length) return null;

  const banner = banners[index];

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      <button className="w-full text-left" onClick={() => navigate(banner.redirectPath || "/")}> 
        <img src={banner.imageUrl} alt={banner.title} className="w-full aspect-[16/6] object-cover" />
        <div className="gradient-card px-4 py-3 text-sm font-medium text-white">{banner.title}</div>
      </button>
      <div className="flex justify-center gap-1.5 py-3">
        {banners.map((_, i) => <span key={i} className={`h-1.5 w-5 rounded-full transition ${i===index ? 'bg-indigo-600' : 'bg-gray-300'}`} />)}
      </div>
    </div>
  );
}
