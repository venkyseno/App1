import { useEffect, useState } from "react";
import api from "../api/api";
import { Badge, Card, EmptyState, PageContainer } from "../components/ui";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    api.get("/config/coupons").then((res) => setCoupons(res.data || [])).catch(() => setCoupons([]));
  }, []);

  return (
    <PageContainer title="Coupons" subtitle="Available offers for your next booking.">
      {coupons.length === 0 ? <EmptyState title="No coupons available" /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {coupons.map((c) => (
            <Card key={c.id} className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">{c.code}</div>
                <Badge tone="yellow">Offer</Badge>
              </div>
              <div className="mt-2 text-sm text-gray-700">{c.message}</div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
