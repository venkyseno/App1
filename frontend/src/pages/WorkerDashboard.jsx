import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const STATUS_COLORS = {
  CREATED: "bg-gray-100 text-gray-600",
  ASSIGNED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  CLOSED: "bg-green-100 text-green-700",
};

export default function WorkerDashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [earned, setEarned] = useState(0);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchAssignedCases();
  }, []);

  const fetchAssignedCases = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/worker/cases/${user.id}`);
      const data = res.data.data ?? [];
      setCases(data);
      setEarned(data.filter(c => c.status === "CLOSED").reduce((sum, c) => sum + Number(c.serviceAmount || 0), 0));
    } catch (err) {
      console.error("Failed to load worker cases", err);
    } finally {
      setLoading(false);
    }
  };

  const startWork = async (caseId) => {
    try {
      await api.post(`/cases/${caseId}/start-work?workerId=${user.id}`);
      fetchAssignedCases();
    } catch (err) {
      alert(err.response?.data || "Failed to start work");
    }
  };

  const completeWork = async (caseId) => {
    try {
      await api.post(`/cases/${caseId}/complete-work?workerId=${user.id}`);
      fetchAssignedCases();
    } catch (err) {
      alert(err.response?.data || "Failed to complete work");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">Worker Dashboard</h1>
      <p className="text-gray-500 text-sm mb-1">Welcome, {user?.name}</p>
      <p className="text-sm mb-4">Works done: {cases.filter(c => c.status === "CLOSED").length} | Earned: ₹{earned}</p>

      {loading && <p className="text-gray-400">Loading cases...</p>}

      {!loading && cases.length === 0 && (
        <p className="text-gray-500">No assigned work yet.</p>
      )}

      {cases.map((c) => (
        <div key={c.id} className="bg-white border rounded-xl p-4 mb-3 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="font-semibold">Case #{c.id}</p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[c.status] || ""}`}>
              {c.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1"><strong>Service:</strong> {c.description}</p>
          <p className="text-sm text-gray-600 mb-3"><strong>Customer:</strong> {c.customerPhone}</p>

          <div className="flex gap-2">
            {c.status === "ASSIGNED" && (
              <button
                onClick={() => startWork(c.id)}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm"
              >
                Start Work
              </button>
            )}
            {c.status === "IN_PROGRESS" && (
              <button
                onClick={() => completeWork(c.id)}
                className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
