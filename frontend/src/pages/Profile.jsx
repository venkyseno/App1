import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

const workerTypes = ["Plumber", "Electrician", "Carpenter", "Painter", "Other"];
const INITIAL_ADDRESS_FORM = {
  addressLine: "",
  city: "",
  landmark: "",
  primaryAddress: false,
};
const INITIAL_WORKER_FORM = {
  workerType: "Plumber",
  experienceLevel: "BEGINNER",
  chargePerDay: "",
  mobile: "",
};

const parseStoredUser = () => {
  const raw = localStorage.getItem("user");
  if (!raw || raw === "undefined" || raw === "null") return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => parseStoredUser());
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [showAddressSection, setShowAddressSection] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(INITIAL_ADDRESS_FORM);
  const [workerForm, setWorkerForm] = useState(INITIAL_WORKER_FORM);

  useEffect(() => {
    const syncUser = () => setUser(parseStoredUser());
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const isLoggedIn = !!user?.id;

  const displayName = useMemo(() => {
    if (!user) return "Guest";
    return user.name || "User";
  }, [user]);

  const requireLogin = (callback) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    callback();
  };

  const loadAddresses = async () => {
    if (!user?.id) return;
    try {
      const { data } = await api.get(`/user-flow/addresses/${user.id}`);
      setAddresses(data || []);
    } catch {
      setAddresses([]);
    }
  };

  const handleToggleAddresses = () => {
    requireLogin(async () => {
      await loadAddresses();
      setShowAddressSection((prev) => !prev);
    });
  };

  const handleAddAddress = async () => {
    if (!addressForm.addressLine.trim()) return alert("Address is mandatory");
    if (!addressForm.city.trim()) return alert("City is mandatory");

    await api.post("/user-flow/addresses", {
      ...addressForm,
      userId: user.id,
    });

    setAddressForm(INITIAL_ADDRESS_FORM);
    loadAddresses();
  };

  const handleSubmitWorkerRequest = async () => {
    if (!workerForm.mobile.trim()) return alert("Mobile is mandatory");

    await api.post("/user-flow/worker-apply", {
      ...workerForm,
      userId: user.id,
      mobile: workerForm.mobile || user.mobile,
    });

    alert("Worker request submitted");
    setWorkerForm(INITIAL_WORKER_FORM);
    setShowWorkerForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowAddressSection(false);
    setShowWorkerForm(false);
    navigate("/");
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl p-5 shadow border border-indigo-100 mb-5">
        <p className="text-xs uppercase tracking-wider text-indigo-500">Account</p>
        <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
        <p className="text-gray-500 text-sm">{user?.mobile || "Please login to continue"}</p>
        <span className="inline-flex mt-2 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
          {user?.role || "GUEST"}
        </span>
      </div>

      <div className="space-y-3">
        <ProfileItem label="Orders" onClick={() => requireLogin(() => navigate("/profile/orders"))} />
        <ProfileItem label="Addresses" onClick={handleToggleAddresses} />
        <ProfileItem label="Coupons" onClick={() => requireLogin(() => navigate("/profile/coupons"))} />

        {user?.role === "WORKER" && <ProfileItem label="Worker Dashboard" onClick={() => navigate("/worker/dashboard")} />}
        {user?.role === "ADMIN" && <ProfileItem label="Admin Dashboard" onClick={() => navigate("/admin/dashboard")} />}
      </div>

      {user?.role === "USER" && (
        <button onClick={() => setShowWorkerForm((prev) => !prev)} className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition">
          Work with us
        </button>
      )}

      {showWorkerForm && (
        <div className="bg-white rounded-2xl p-4 mt-4 shadow border border-gray-100 space-y-2">
          <h3 className="font-semibold text-gray-800">Worker Application</h3>

          <select className="border p-2 w-full rounded" value={workerForm.workerType} onChange={(e) => setWorkerForm({ ...workerForm, workerType: e.target.value })}>
            {workerTypes.map((type) => <option key={type}>{type}</option>)}
          </select>

          <select className="border p-2 w-full rounded" value={workerForm.experienceLevel} onChange={(e) => setWorkerForm({ ...workerForm, experienceLevel: e.target.value })}>
            <option>BEGINNER</option>
            <option>INTERMEDIATE</option>
            <option>PROFESSIONAL</option>
          </select>

          <input className="border p-2 w-full rounded" placeholder="Charge per day" value={workerForm.chargePerDay} onChange={(e) => setWorkerForm({ ...workerForm, chargePerDay: e.target.value })} />
          <input className="border p-2 w-full rounded" placeholder="Mobile (mandatory)" value={workerForm.mobile} onChange={(e) => setWorkerForm({ ...workerForm, mobile: e.target.value })} />

          <button onClick={handleSubmitWorkerRequest} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
            Submit request
          </button>
        </div>
      )}

      {showAddressSection && (
        <div className="bg-white rounded-2xl p-4 mt-4 shadow border border-gray-100">
          <h3 className="font-semibold mb-2">Saved addresses</h3>

          {addresses.map((address) => (
            <div key={address.id} className="border rounded p-2 mb-2 text-sm">
              <div>{address.addressLine}, {address.city}</div>
              {address.primaryAddress && <span className="text-xs text-indigo-600">Primary</span>}
            </div>
          ))}

          <input className="border p-2 w-full mb-2 rounded" placeholder="Address (mandatory)" value={addressForm.addressLine} onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })} />
          <input className="border p-2 w-full mb-2 rounded" placeholder="City (mandatory)" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
          <input className="border p-2 w-full mb-2 rounded" placeholder="Landmark" value={addressForm.landmark} onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })} />

          <label className="text-sm block mb-2">
            <input type="checkbox" checked={addressForm.primaryAddress} onChange={(e) => setAddressForm({ ...addressForm, primaryAddress: e.target.checked })} /> Set primary
          </label>

          <button onClick={handleAddAddress} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
            Add new address
          </button>
        </div>
      )}

      {!isLoggedIn ? (
        <button onClick={() => navigate("/login")} className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition">
          Login / Signup
        </button>
      ) : (
        <button onClick={handleLogout} className="mt-6 w-full bg-rose-500 text-white py-3 rounded-xl hover:bg-rose-600 transition">
          Logout
        </button>
      <ProfileItem label="Addresses" onClick={() => requireLogin(() => { setShowAddress(!showAddress); loadAddresses(); })} />
      <ProfileItem label="Coupons" onClick={() => requireLogin(() => navigate('/profile/coupons'))} />
      <ProfileItem label="Orders" onClick={() => navigate("/profile/orders")} />
      <ProfileItem label="Addresses" onClick={() => { setShowAddress(!showAddress); loadAddresses(); }} />
      <ProfileItem label="Coupons" onClick={() => {}} />
      {user?.role === "USER" && <button onClick={() => setShowWorkerForm(!showWorkerForm)} className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl">Work with us</button>}
      {user?.role === "WORKER" && <ProfileItem label="Worker Dashboard" onClick={() => navigate("/worker/dashboard")} />}
      {user?.role === "ADMIN" && <ProfileItem label="Admin Dashboard" onClick={() => navigate("/admin/dashboard")} />}

      {showWorkerForm && (
        <div className="bg-white rounded-xl p-4 mt-4 space-y-2">
          <h3 className="font-semibold">Worker Application</h3>
          <select className="border p-2 w-full" value={workerForm.workerType} onChange={e => setWorkerForm({ ...workerForm, workerType: e.target.value })}>{workerTypes.map(t => <option key={t}>{t}</option>)}</select>
          <select className="border p-2 w-full" value={workerForm.experienceLevel} onChange={e => setWorkerForm({ ...workerForm, experienceLevel: e.target.value })}><option>BEGINNER</option><option>INTERMEDIATE</option><option>PROFESSIONAL</option></select>
          <input className="border p-2 w-full" placeholder="Charge per day" value={workerForm.chargePerDay} onChange={e => setWorkerForm({ ...workerForm, chargePerDay: e.target.value })} />
          <input className="border p-2 w-full" placeholder="Mobile (mandatory)" value={workerForm.mobile} onChange={e => setWorkerForm({ ...workerForm, mobile: e.target.value })} />
          <button onClick={submitWorkerRequest} className="bg-green-600 text-white px-4 py-2 rounded">Submit request</button>
        </div>
      )}

      {showAddress && (
        <div className="bg-white rounded-xl p-4 mt-4">
          <h3 className="font-semibold mb-2">Saved addresses</h3>
          {addresses.map(a => <div key={a.id} className="border rounded p-2 mb-2"><div>{a.addressLine}, {a.city}</div>{a.primaryAddress && <span className="text-xs text-indigo-600">Primary</span>}</div>)}
          <input className="border p-2 w-full mb-2" placeholder="Address (mandatory)" value={newAddress.addressLine} onChange={e => setNewAddress({ ...newAddress, addressLine: e.target.value })} />
          <input className="border p-2 w-full mb-2" placeholder="City (mandatory)" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
          <input className="border p-2 w-full mb-2" placeholder="Landmark" value={newAddress.landmark} onChange={e => setNewAddress({ ...newAddress, landmark: e.target.value })} />
          <label className="text-sm"><input type="checkbox" checked={newAddress.primaryAddress} onChange={e => setNewAddress({ ...newAddress, primaryAddress: e.target.checked })} /> Set primary</label>
          <button onClick={addAddress} className="block mt-2 bg-indigo-600 text-white px-4 py-2 rounded">Add new address</button>
        </div>
      )}

      {user ? (
        <button onClick={() => { localStorage.removeItem("user"); setUser(null); navigate("/"); }} className="mt-6 w-full bg-red-500 text-white py-3 rounded-xl">Logout</button>
      ) : (
        <button onClick={() => navigate('/login')} className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl">Login / Signup</button>
      )}
      <button onClick={() => { localStorage.removeItem("user"); setUser(null); navigate("/"); }} className="mt-6 w-full bg-red-500 text-white py-3 rounded-xl">Logout</button>
    </div>
  );
}

function ProfileItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex justify-between items-center p-4 bg-white rounded-xl shadow border border-gray-100 hover:bg-gray-50 transition"
    >
      <span className="text-gray-800">{label}</span>
      <span className="text-gray-400">›</span>
    </button>
  );
}
function ProfileItem({ label, onClick }) { return <div onClick={onClick} className="flex justify-between items-center p-4 bg-white rounded-lg shadow mb-3 cursor-pointer"><span>{label}</span><span className="text-gray-400">›</span></div>; }
