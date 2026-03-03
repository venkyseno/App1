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
    <div className="cursor-pointer" onClick={() => navigate(banner.redirectPath || "/")}> 
      <img
        src={banner.imageUrl}
        alt={banner.title}
        className="rounded-xl w-full aspect-[16/9] object-cover"
      />
      <div className="gradient-card text-white text-center p-2 rounded-b-xl text-sm font-medium">
        {banner.title}
      </div>
      <div className="flex justify-center gap-1 mt-2">
        {banners.map((_, i) => <span key={i} className={`h-1.5 w-4 rounded-full ${i===index ? 'bg-indigo-600' : 'bg-gray-300'}`} />)}
      </div>
    </div>
  );
}
