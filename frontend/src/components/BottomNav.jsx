import { Home, MessageCircle, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const itemCls = (active) => `flex flex-col items-center gap-1 text-xs ${active ? "text-indigo-600" : "text-gray-500"}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-lg items-center justify-around py-2">
        <button onClick={() => navigate("/")} className={itemCls(pathname === "/")}><Home size={18} /><span>Home</span></button>
        <button onClick={() => navigate("/ask-ai")} className={itemCls(pathname.startsWith("/ask-ai"))}><MessageCircle size={18} /><span>Ask AI</span></button>
        <button onClick={() => navigate("/profile")} className={itemCls(pathname.startsWith("/profile"))}><User size={18} /><span>Profile</span></button>
      </div>
    </div>
  );
}
