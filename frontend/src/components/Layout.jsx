import { Menu, ShieldCheck, Sparkles, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";

const adminNav = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/banners", label: "Banners & Services" },
  { to: "/admin/workers", label: "Workers" },
  { to: "/admin/works", label: "Works" },
  { to: "/admin/coupons", label: "Coupons" },
  { to: "/admin/withdrawals", label: "Withdrawals" },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isAdmin = location.pathname.startsWith("/admin");
  const title = useMemo(() => {
    if (isAdmin) return "Admin Control Center";
    return "Local Services";
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button className="rounded-lg border border-gray-200 p-2 lg:hidden" onClick={() => setOpen((v) => !v)}>
                <Menu size={18} />
              </button>
            )}
            <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center gap-2 font-semibold text-gray-900">
              <span className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-500 p-1.5 text-white">
                {isAdmin ? <ShieldCheck size={16} /> : <Sparkles size={16} />}
              </span>
              {title}
            </Link>
          </div>
          <Link to="/profile" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
            <User size={16} /> Profile
          </Link>
        </div>
      </header>

      <div className={`mx-auto flex w-full max-w-7xl gap-6 px-4 pb-20 pt-6 sm:px-6 lg:px-8 ${isAdmin ? "lg:pb-8" : ""}`}>
        {isAdmin && (
          <aside className={`${open ? "block" : "hidden"} lg:block w-full max-w-xs rounded-xl border border-gray-200 bg-white p-3 shadow-sm h-fit`}>
            <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-400">Navigation</p>
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {!isAdmin && <BottomNav />}
    </div>
  );
}
