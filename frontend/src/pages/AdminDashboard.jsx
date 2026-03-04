import { Link } from "react-router-dom";
import { Briefcase, Receipt, ShieldCheck, Ticket } from "lucide-react";
import { NavCardLink, PageContainer, StatCard } from "../components/ui";

const tiles = [
  { to: "/admin/banners", title: "Banners & Other Services", subtitle: "Publish banners, manage marketplace services and items." },
  { to: "/admin/workers", title: "Workers", subtitle: "Approve worker requests and maintain worker accounts." },
  { to: "/admin/works", title: "Works Created", subtitle: "Assign workers and monitor case progression." },
  { to: "/admin/coupons", title: "Coupons", subtitle: "Create active campaign coupons for customers." },
  { to: "/admin/withdrawals", title: "Withdrawals", subtitle: "Review and process user withdrawal requests." },
];

export default function AdminDashboard() {
  return (
    <PageContainer title="Admin Dashboard" subtitle="Operate your marketplace with confidence from one place.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Orders" value="Live" icon={<Receipt size={18} />} tone="indigo" />
        <StatCard title="Total Services" value="Catalog" icon={<Briefcase size={18} />} tone="purple" />
        <StatCard title="Active Users" value="Realtime" icon={<ShieldCheck size={18} />} tone="emerald" />
        <StatCard title="Revenue" value="Insights" icon={<Ticket size={18} />} tone="amber" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tiles.map((tile) => <NavCardLink key={tile.to} {...tile} />)}
      </div>

      <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">← Back to user app</Link>
    </PageContainer>
  );
}
