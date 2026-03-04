import { Link } from "react-router-dom";

const tiles = [
  { to: "/admin/banners", title: "Banners & Other Services", subtitle: "Manage banner pages, images, publish/edit" },
  { to: "/admin/workers", title: "Workers", subtitle: "Pending requests, existing workers, edit/delete" },
  { to: "/admin/works", title: "Works Created", subtitle: "Assigned/unassigned cases with status" },
  { to: "/admin/coupons", title: "Coupons", subtitle: "Create, edit, delete, publish" },
  { to: "/admin/withdrawals", title: "Withdrawals", subtitle: "Pending, approved and rejected" },
];

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to} className="bg-white border border-indigo-100 rounded-xl p-4 shadow hover:shadow-md transition">
            <h2 className="font-semibold text-indigo-700">{tile.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{tile.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
