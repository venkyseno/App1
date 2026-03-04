import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { Card, InputField, PageContainer, PrimaryButton } from "../components/ui";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleWithdraw = async () => {
    if (!user) return navigate("/login");
    setLoading(true);
    try {
      const res = await api.post(`/wallet/${user.id}/withdraw`, { amount: Number(amount) });
      alert("Withdrawal requested. ID: " + res.data.id);
      setAmount("");
      navigate("/profile/wallet");
    } catch (err) {
      alert(err.response?.data || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Withdraw Cashback" subtitle="Minimum withdrawal amount is ₹500.">
      <Card>
        <InputField type="number" label="Amount" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <PrimaryButton onClick={handleWithdraw} disabled={loading || !amount} className="mt-4 w-full">{loading ? "Requesting..." : "Withdraw"}</PrimaryButton>
      </Card>
    </PageContainer>
  );
}
