import { useEffect, useState } from "react";
import api from "../api/api";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    api.get("/config/coupons").then((res) => setCoupons(res.data || [])).catch(() => setCoupons([]));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Coupons</h1>
      {coupons.length === 0 && <p className="text-gray-500">No coupons available.</p>}
      <div className="space-y-3">
        {coupons.map((c) => (
          <div key={c.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="font-semibold">{c.code}</div>
            <div className="text-sm text-gray-700">{c.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
