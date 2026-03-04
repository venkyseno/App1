import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BannerSlider from "../components/BannerSlider";
import { services } from "../data/Services";
import api from "../api/api";
import { Card, EmptyState, PageContainer, PrimaryButton, SectionHeader } from "../components/ui";

export default function Home() {
  const [otherServices, setOtherServices] = useState([]);

  useEffect(() => {
    api.get("/config/other-services").then((r) => setOtherServices(r.data || [])).catch(() => setOtherServices([]));
  }, []);

  return (
    <PageContainer title="Discover Services" subtitle="Book trusted professionals and marketplace services in a few clicks.">
      <BannerSlider />

      <section id="all-services">
        <SectionHeader title="All Services" subtitle="Universal 3-column service grid on mobile + desktop." />
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          {services.map((service) => (
            <Link key={service.id} to={`/service/${service.id}`}>
              <Card className="h-full bg-gradient-to-br from-white to-indigo-50 p-3 sm:p-4">
                <div className="text-xl sm:text-2xl">{service.icon}</div>
                <h3 className="mt-2 text-xs sm:text-sm font-semibold leading-tight text-gray-900">{service.name}</h3>
                <p className="mt-1 hidden sm:block text-xs text-gray-500 line-clamp-2">{service.description}</p>
                <p className="mt-2 text-[11px] sm:text-xs font-medium text-indigo-600">{service.price}</p>
                <PrimaryButton className="mt-2 w-full px-2 py-1.5 text-[11px] sm:text-xs">Book</PrimaryButton>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section id="other-services">
        <SectionHeader title="Other Services" subtitle="Menu-based services with a rich one-column marketplace list." />
        {otherServices.length === 0 ? (
          <EmptyState title="No other services available yet" description="Admin can publish services from dashboard." />
        ) : (
          <div className="space-y-4">
            {otherServices.map((service) => (
              <Link key={service.id} to={`/other-services/${service.id}`}>
                <Card className="h-full bg-gradient-to-r from-white to-cyan-50 hover:ring-2 hover:ring-indigo-100">
                  <div className="flex gap-4">
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.name} className="h-24 w-28 sm:h-28 sm:w-36 rounded-lg object-cover" />
                    ) : (
                      <div className="h-24 w-28 sm:h-28 sm:w-36 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">No image</div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{service.menuDetails}</p>
                      <p className="mt-2 text-sm font-medium text-indigo-600">Starting {service.startPrice || "₹0"}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
