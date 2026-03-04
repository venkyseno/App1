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
        <SectionHeader title="All Services" subtitle="Home services curated for your daily needs." />
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <Link key={service.id} to={`/service/${service.id}`}>
              <Card className="h-full bg-gradient-to-br from-white to-indigo-50 hover:-translate-y-0.5">
                <div className="text-3xl">{service.icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{service.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                <p className="mt-4 text-sm font-medium text-indigo-600">Starting {service.price}</p>
                <PrimaryButton className="mt-4 w-full">Book Now</PrimaryButton>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section id="other-services">
        <SectionHeader title="Other Services" subtitle="Explore menu-based services with item-level booking." />
        {otherServices.length === 0 ? (
          <EmptyState title="No other services available yet" description="Admin can publish services from dashboard." />
        ) : (
          <div className="space-y-4">
            {otherServices.map((service) => (
              <Link key={service.id} to={`/other-services/${service.id}`}>
                <Card className="h-full bg-gradient-to-r from-white to-cyan-50 hover:-translate-y-0.5">
                  <div className="flex gap-4">
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.name} className="h-28 w-36 rounded-lg object-cover" />
                    ) : (
                      <div className="h-28 w-36 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">No image</div>
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
