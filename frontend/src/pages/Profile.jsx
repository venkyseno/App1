import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { Avatar, Card, EmptyState, InputField, PageContainer, PrimaryButton, SecondaryButton, SelectField, TextAreaField } from "../components/ui";

const workerTypes = ["Plumber", "Electrician", "Carpenter", "Painter", "Other"];
const INITIAL_ADDRESS_FORM = { addressLine: "", city: "", landmark: "", primaryAddress: false };
const INITIAL_WORKER_FORM = { workerType: "Plumber", experienceLevel: "BEGINNER", chargePerDay: "", mobile: "" };

const parseStoredUser = () => {
  const raw = localStorage.getItem("user");
  if (!raw || raw === "undefined" || raw === "null") return null;
  try { return JSON.parse(raw); } catch { localStorage.removeItem("user"); return null; }
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
  const displayName = useMemo(() => (!user ? "Guest" : user.name || "User"), [user]);

  const requireLogin = (callback) => {
    if (!isLoggedIn) return navigate("/login");
    callback();
  };

  const loadAddresses = async () => {
    if (!user?.id) return;
    try { const { data } = await api.get(`/user-flow/addresses/${user.id}`); setAddresses(data || []); }
    catch { setAddresses([]); }
  };

  const handleToggleAddresses = () => {
    requireLogin(async () => { await loadAddresses(); setShowAddressSection((prev) => !prev); });
  };

  const handleAddAddress = async () => {
    if (!addressForm.addressLine.trim()) return alert("Address is mandatory");
    if (!addressForm.city.trim()) return alert("City is mandatory");
    await api.post("/user-flow/addresses", { ...addressForm, userId: user.id });
    setAddressForm(INITIAL_ADDRESS_FORM);
    loadAddresses();
  };

  const handleSubmitWorkerRequest = async () => {
    if (!workerForm.mobile.trim()) return alert("Mobile is mandatory");
    await api.post("/user-flow/worker-apply", { ...workerForm, userId: user.id, mobile: workerForm.mobile || user.mobile });
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
    <PageContainer title="Profile" subtitle="Manage your account, addresses, orders, coupons, and work preferences.">
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={displayName} />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
            <p className="text-sm text-gray-500">{user?.mobile || "Please login to continue"}</p>
            <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">{user?.role || "GUEST"}</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <ProfileItem label="Orders" onClick={() => requireLogin(() => navigate("/profile/orders"))} />
        <ProfileItem label="Addresses" onClick={handleToggleAddresses} />
        <ProfileItem label="Coupons" onClick={() => requireLogin(() => navigate("/profile/coupons"))} />
        {user?.role === "WORKER" && <ProfileItem label="Worker Dashboard" onClick={() => navigate("/worker/dashboard")} />}
        {user?.role === "ADMIN" && <ProfileItem label="Admin Dashboard" onClick={() => navigate("/admin/dashboard")} />}
      </div>

      {user?.role === "USER" && <PrimaryButton onClick={() => setShowWorkerForm((prev) => !prev)}>{showWorkerForm ? "Close Worker Form" : "Work with us"}</PrimaryButton>}

      {showWorkerForm && (
        <Card>
          <h3 className="text-lg font-medium">Worker Application</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <SelectField label="Worker Type" value={workerForm.workerType} onChange={(e) => setWorkerForm({ ...workerForm, workerType: e.target.value })}>{workerTypes.map((type) => <option key={type}>{type}</option>)}</SelectField>
            <SelectField label="Experience" value={workerForm.experienceLevel} onChange={(e) => setWorkerForm({ ...workerForm, experienceLevel: e.target.value })}>
              <option>BEGINNER</option><option>INTERMEDIATE</option><option>PROFESSIONAL</option>
            </SelectField>
            <InputField label="Charge per day" value={workerForm.chargePerDay} onChange={(e) => setWorkerForm({ ...workerForm, chargePerDay: e.target.value })} />
            <InputField label="Mobile" value={workerForm.mobile} onChange={(e) => setWorkerForm({ ...workerForm, mobile: e.target.value })} />
          </div>
          <PrimaryButton className="mt-3" onClick={handleSubmitWorkerRequest}>Submit request</PrimaryButton>
        </Card>
      )}

      {showAddressSection && (
        <Card>
          <h3 className="text-lg font-medium">Saved Addresses</h3>
          <div className="mt-3 space-y-2">
            {addresses.length === 0 ? <EmptyState title="No saved addresses" /> : addresses.map((address) => (
              <div key={address.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                <div>{address.addressLine}, {address.city}</div>
                {address.primaryAddress && <span className="text-xs text-indigo-600">Primary</span>}
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <InputField label="Address" value={addressForm.addressLine} onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })} />
            <InputField label="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
            <InputField label="Landmark" value={addressForm.landmark} onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })} />
            <label className="mt-7 inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={addressForm.primaryAddress} onChange={(e) => setAddressForm({ ...addressForm, primaryAddress: e.target.checked })} /> Set primary</label>
          </div>
          <PrimaryButton className="mt-3" onClick={handleAddAddress}>Add new address</PrimaryButton>
        </Card>
      )}

      {!isLoggedIn ? (
        <PrimaryButton onClick={() => navigate("/login")}>Login / Signup</PrimaryButton>
      ) : (
        <SecondaryButton className="text-red-600" onClick={handleLogout}>Logout</SecondaryButton>
      )}
    </PageContainer>
  );
}

function ProfileItem({ label, onClick }) {
  return <button onClick={onClick} className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:bg-gray-50"><span className="text-gray-800">{label}</span><span className="text-gray-400">›</span></button>;
}
