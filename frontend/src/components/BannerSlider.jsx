import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function BannerSlider() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    api.get("/config/banners")
      .then((res) => setBanners(res.data || []))
      .catch(() => setBanners([]));
  }, []);

  const visibleBanners = useMemo(
    () => banners.filter((b) => !b.placement || b.placement === "HOME"),
    [banners],
  );

  useEffect(() => {
    if (visibleBanners.length <= 1) return;
    const current = visibleBanners[index] || visibleBanners[0];
    const seconds = Number(current?.displaySeconds || 5);
    const timer = setTimeout(() => setIndex((prev) => (prev + 1) % visibleBanners.length), Math.max(2, seconds) * 1000);
    return () => clearTimeout(timer);
  }, [visibleBanners, index]);

  useEffect(() => {
    if (index >= visibleBanners.length) setIndex(0);
  }, [visibleBanners.length, index]);

  if (!visibleBanners.length) return null;

  const banner = visibleBanners[index];

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      <div className="relative">
        <button className="w-full text-left" onClick={() => navigate(banner.redirectPath || "/")}> 
          <img src={banner.imageUrl} alt={banner.title} className="w-full aspect-[16/6] object-cover" />
          <div className="gradient-card px-4 py-3 text-sm font-medium text-white">{banner.title}</div>
        </button>
        {visibleBanners.length > 1 && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/25 px-2 py-1 backdrop-blur-sm">
            {visibleBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`h-2.5 w-2.5 rounded-full border border-white/40 transition ${i === index ? "bg-white" : "bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
