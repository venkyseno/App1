import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BannerSlider from "../components/BannerSlider";
import { services } from "../data/Services";
import api from "../api/api";

export default function Home() {
  const [otherServices, setOtherServices] = useState([]);

  useEffect(() => {
    api.get("/config/other-services").then((r) => setOtherServices(r.data || [])).catch(() => setOtherServices([]));
  }, []);

  return (
    <div className="p-4 space-y-6">
      <BannerSlider />

      <h2 className="text-xl font-bold">All Services</h2>
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => (
          <Link key={service.id} to={`/service/${service.id}`} className="bg-white shadow rounded-xl p-4 border border-indigo-100">
            <div className="text-2xl">{service.icon}</div>
            <div className="text-lg font-semibold">{service.name}</div>
            <div className="text-sm text-gray-500">{service.price}</div>
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-bold">Other Services</h2>
      <div className="space-y-3">
        {otherServices.map((service) => (
          <Link key={service.id} to={`/other-services/${service.id}`} className="block bg-white shadow rounded-xl p-3 border">
            <div className="flex gap-3">
              {service.imageUrl ? (
                <img src={service.imageUrl} alt={service.name} className="w-24 h-16 object-cover rounded-lg" />
              ) : (
                <div className="w-24 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">No image</div>
              )}
              <div>
                <div className="font-semibold">{service.name}</div>
                <div className="text-xs text-gray-500">{service.menuDetails}</div>
                <div className="text-sm text-indigo-600">Starting {service.startPrice}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
