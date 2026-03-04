import { useEffect, useState } from "react";
import { getWallet, getLedger } from "../api/api";
import { useNavigate } from "react-router-dom";
import { Badge, Card, EmptyState, PageContainer, PrimaryButton } from "../components/ui";

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [ledger, setLedger] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return navigate("/login");
    getWallet(user.id).then((res) => setWallet(res.data));
    getLedger(user.id).then((res) => setLedger(res.data));
  }, [navigate]);

  return (
    <PageContainer title="Wallet" subtitle="Review cashback balance and transaction history.">
      <Card className="soft-panel">
        <p className="text-sm text-gray-500">Cashback Balance</p>
        <p className="mt-1 text-3xl font-semibold">₹{wallet?.balance ?? "—"}</p>
        <PrimaryButton className="mt-3" onClick={() => navigate("/profile/withdraw")}>Withdraw</PrimaryButton>
      </Card>

      <Card>
        <h3 className="text-lg font-medium">Transaction History</h3>
        {ledger.length === 0 ? <EmptyState title="No transactions yet" /> : (
          <div className="mt-3 space-y-2">
            {ledger.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                <span className="text-sm text-gray-600">{entry.type}</span>
                <Badge tone={entry.type === "CREDIT" ? "green" : "red"}>{entry.type === "CREDIT" ? "+" : "-"}₹{entry.amount}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
