import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

export default function OtherServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    api.get("/config/other-services").then((r) => setService((r.data || []).find((x) => String(x.id) === String(id)) || null));
    api.get(`/config/other-services/${id}/items`).then((r) => setItems(r.data || [])).catch(() => setItems([]));
  }, [id]);

  const total = useMemo(() => items.reduce((sum, i) => sum + (Number(cart[i.id] || 0) * Number(i.price || 0)), 0), [items, cart]);

  const confirmBooking = async () => {
    if (!user) return navigate("/login");
    const selected = items
      .map((i) => ({ itemId: i.id, quantity: Number(cart[i.id] || 0) }))
      .filter((i) => i.quantity > 0);
    if (!selected.length) return alert("Add at least one menu item");

    await api.post("/other-service-orders", {
      userId: user.id,
      otherServiceId: Number(id),
      items: selected,
    });
    alert("Other service booking confirmed");
    navigate("/profile/orders");
  };

  if (!service) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-xl p-4 border">
        <h1 className="text-xl font-bold">{service.name}</h1>
        <p className="text-sm text-gray-500">{service.menuDetails}</p>
      </div>

      <div className="bg-white rounded-xl p-4 border">
        <h2 className="font-semibold mb-2">Menu Items</h2>
        {items.map((item) => (
          <div key={item.id} className="border rounded p-2 mb-2 flex justify-between items-center">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-500">₹{item.price} • Available {item.availableQuantity}</div>
            </div>
            <input
              type="number"
              min="0"
              max={item.availableQuantity}
              value={cart[item.id] || 0}
              onChange={(e) => setCart({ ...cart, [item.id]: Math.max(0, Number(e.target.value || 0)) })}
              className="w-20 border rounded p-1"
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 border">
        <div className="font-semibold mb-2">Total: ₹{total.toFixed(2)}</div>
        <button onClick={confirmBooking} className="w-full bg-black text-white py-3 rounded-xl">Confirm Booking</button>
      </div>
    </div>
  );
}
