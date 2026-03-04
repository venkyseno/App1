import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { Badge, Card, EmptyState, PageContainer, PrimaryButton } from "../components/ui";

const STATUS_TONE = { CREATED: "gray", ASSIGNED: "blue", IN_PROGRESS: "yellow", CLOSED: "green", WORK_DONE: "purple" };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try { const res = await api.get(`/cases/user/${user.id}`); setOrders(res.data?.data ?? []); }
    catch { setOrders([]); }
    finally { setLoading(false); }
  };

  return (
    <PageContainer title="My Orders" subtitle="Track booking lifecycle and service progress.">
      {loading && <p className="text-gray-400">Loading...</p>}
      {!loading && orders.length === 0 && <EmptyState title="No orders yet" action={<PrimaryButton onClick={() => navigate("/")}>Book a Service</PrimaryButton>} />}
      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="mt-1 text-sm text-gray-500">{order.description}</p>
              </div>
              <Badge tone={STATUS_TONE[order.status] || "gray"}>{order.status}</Badge>
            </div>
            {order.serviceAmount && <p className="mt-3 text-sm text-gray-600">Amount: ₹{order.serviceAmount}</p>}
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
