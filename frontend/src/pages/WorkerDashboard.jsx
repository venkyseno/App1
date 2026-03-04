import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { Badge, Card, EmptyState, PageContainer, PrimaryButton, StatCard } from "../components/ui";

const STATUS_TONE = { CREATED: "gray", ASSIGNED: "blue", IN_PROGRESS: "yellow", CLOSED: "green", WORK_DONE: "purple" };

export default function WorkerDashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [earned, setEarned] = useState(0);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchAssignedCases();
  }, []);

  const fetchAssignedCases = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/worker/cases/${user.id}`);
      const data = res.data.data ?? [];
      setCases(data);
      setEarned(data.filter((c) => c.status === "CLOSED").reduce((sum, c) => sum + Number(c.serviceAmount || 0), 0));
    } catch (err) {
      console.error("Failed to load worker cases", err);
    } finally {
      setLoading(false);
    }
  };

  const startWork = async (caseId) => {
    try { await api.post(`/cases/${caseId}/start-work?workerId=${user.id}`); fetchAssignedCases(); }
    catch (err) { alert(err.response?.data || "Failed to start work"); }
  };

  const completeWork = async (caseId) => {
    try { await api.post(`/cases/${caseId}/complete-work?workerId=${user.id}`); fetchAssignedCases(); }
    catch (err) { alert(err.response?.data || "Failed to complete work"); }
  };

  return (
    <PageContainer title="Worker Dashboard" subtitle={`Welcome, ${user?.name || "Worker"}`}>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Works done" value={cases.filter((c) => c.status === "CLOSED").length} tone="indigo" />
        <StatCard title="Earned" value={`₹${earned}`} tone="emerald" />
      </div>

      {loading && <p className="text-gray-400">Loading cases...</p>}
      {!loading && cases.length === 0 && <EmptyState title="No assigned work yet" />}

      <div className="space-y-3">
        {cases.map((c) => (
          <Card key={c.id}>
            <div className="mb-2 flex items-start justify-between">
              <p className="font-semibold">Case #{c.id}</p>
              <Badge tone={STATUS_TONE[c.status] || "gray"}>{c.status}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1"><strong>Service:</strong> {c.description}</p>
            <p className="text-sm text-gray-600 mb-3"><strong>Customer:</strong> {c.customerPhone}</p>
            <div className="flex gap-2">
              {c.status === "ASSIGNED" && <PrimaryButton onClick={() => startWork(c.id)}>Start Work</PrimaryButton>}
              {c.status === "IN_PROGRESS" && <PrimaryButton onClick={() => completeWork(c.id)} className="bg-emerald-600 hover:bg-emerald-700">Mark Complete</PrimaryButton>}
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
