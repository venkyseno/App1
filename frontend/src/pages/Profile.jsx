import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";

const workerTypes = ["Plumber", "Electrician", "Carpenter", "Painter", "Other"];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    addressLine: "",
    city: "",
    landmark: "",
    primaryAddress: false,
  });
  const [workerForm, setWorkerForm] = useState({
    workerType: "Plumber",
    experienceLevel: "BEGINNER",
    chargePerDay: "",
    mobile: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") {
      setUser(null);
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const requireLogin = (cb) => {
    if (!user) {
      navigate("/login");
      return;
    }
    cb();
  };

  const [newAddress, setNewAddress] = useState({ addressLine: "", city: "", landmark: "", primaryAddress: false });
  const [workerForm, setWorkerForm] = useState({ workerType: "Plumber", experienceLevel: "BEGINNER", chargePerDay: "", mobile: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") setUser(JSON.parse(storedUser));
    else setUser(null);
  }, []);

  const requireLogin = (cb) => {
    if (!user) return navigate("/login");
    cb();
  };

  }, []);

  const loadAddresses = async () => {
    if (!user) return;
    const { data } = await api.get(`/user-flow/addresses/${user.id}`);
    setAddresses(data || []);
  };

  const submitWorkerRequest = async () => {
    if (!workerForm.mobile) {
      alert("Mobile is mandatory");
      return;
    }

    await api.post("/user-flow/worker-apply", {
      ...workerForm,
      userId: user.id,
      mobile: workerForm.mobile || user.mobile,
    });

    if (!workerForm.mobile) return alert("Mobile is mandatory");
    await api.post("/user-flow/worker-apply", { ...workerForm, userId: user.id, mobile: workerForm.mobile || user.mobile });
    alert("Worker request submitted");
    setShowWorkerForm(false);
  };

  const addAddress = async () => {
    await api.post("/user-flow/addresses", {
      ...newAddress,
      userId: user.id,
    });

    setNewAddress({
      addressLine: "",
      city: "",
      landmark: "",
      primaryAddress: false,
    });
    await api.post("/user-flow/addresses", { ...newAddress, userId: user.id });
    setNewAddress({ addressLine: "", city: "", landmark: "", primaryAddress: false });
    loadAddresses();
  };

  return (
    <div className="p-6">
      {user && (
        <div className="mb-4 p-4 bg-white rounded-xl">
          <p className="font-semibold">{user.name}</p>
          <p>{user.mobile}</p>
          <span className="text-xs bg-blue-100 px-2 rounded">{user.role}</span>
        </div>
      )}

      {user && <div className="mb-4 p-4 bg-white rounded-xl"><p className="font-semibold">{user.name}</p><p>{user.mobile}</p><span className="text-xs bg-blue-100 px-2 rounded">{user.role}</span></div>}
      <h1 className="text-xl font-bold mb-3">My Account</h1>
      <ProfileItem label="Orders" onClick={() => requireLogin(() => navigate("/profile/orders"))} />
      <ProfileItem
        label="Addresses"
        onClick={() => requireLogin(() => {
          setShowAddress(!showAddress);
          loadAddresses();
        })}
      />
      <ProfileItem label="Coupons" onClick={() => requireLogin(() => navigate("/profile/coupons"))} />

      {user?.role === "USER" && (
        <button
          onClick={() => setShowWorkerForm(!showWorkerForm)}
          className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl"
        >
          Work with us
        </button>
      )}

      {user?.role === "WORKER" && (
        <ProfileItem label="Worker Dashboard" onClick={() => navigate("/worker/dashboard")} />
      )}
      {user?.role === "ADMIN" && (
        <ProfileItem label="Admin Dashboard" onClick={() => navigate("/admin/dashboard")} />
      )}

      {showWorkerForm && (
        <div className="bg-white rounded-xl p-4 mt-4 space-y-2">
          <h3 className="font-semibold">Worker Application</h3>
          <select
            className="border p-2 w-full"
            value={workerForm.workerType}
            onChange={(e) => setWorkerForm({ ...workerForm, workerType: e.target.value })}
          >
            {workerTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select
            className="border p-2 w-full"
            value={workerForm.experienceLevel}
            onChange={(e) => setWorkerForm({ ...workerForm, experienceLevel: e.target.value })}
          >
            <option>BEGINNER</option>
            <option>INTERMEDIATE</option>
            <option>PROFESSIONAL</option>
          </select>

          <input
            className="border p-2 w-full"
            placeholder="Charge per day"
            value={workerForm.chargePerDay}
            onChange={(e) => setWorkerForm({ ...workerForm, chargePerDay: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="Mobile (mandatory)"
            value={workerForm.mobile}
            onChange={(e) => setWorkerForm({ ...workerForm, mobile: e.target.value })}
          />

          <button onClick={submitWorkerRequest} className="bg-green-600 text-white px-4 py-2 rounded">
            Submit request
          </button>
        </div>
      )}

      {showAddress && (
        <div className="bg-white rounded-xl p-4 mt-4">
          <h3 className="font-semibold mb-2">Saved addresses</h3>

          {addresses.map((address) => (
            <div key={address.id} className="border rounded p-2 mb-2">
              <div>
                {address.addressLine}, {address.city}
              </div>
              {address.primaryAddress && <span className="text-xs text-indigo-600">Primary</span>}
            </div>
          ))}

          <input
            className="border p-2 w-full mb-2"
            placeholder="Address (mandatory)"
            value={newAddress.addressLine}
            onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
          />
          <input
            className="border p-2 w-full mb-2"
            placeholder="City (mandatory)"
            value={newAddress.city}
            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
          />
          <input
            className="border p-2 w-full mb-2"
            placeholder="Landmark"
            value={newAddress.landmark}
            onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
          />

          <label className="text-sm">
            <input
              type="checkbox"
              checked={newAddress.primaryAddress}
              onChange={(e) => setNewAddress({ ...newAddress, primaryAddress: e.target.checked })}
            />{" "}
            Set primary
          </label>

          <button onClick={addAddress} className="block mt-2 bg-indigo-600 text-white px-4 py-2 rounded">
            Add new address
          </button>
        </div>
      )}

      {user ? (
        <button
          onClick={() => {
            localStorage.removeItem("user");
            setUser(null);
            navigate("/");
          }}
          className="mt-6 w-full bg-red-500 text-white py-3 rounded-xl"
        >
          Logout
        </button>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl"
        >
          Login / Signup
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
    <div
      onClick={onClick}
      className="flex justify-between items-center p-4 bg-white rounded-lg shadow mb-3 cursor-pointer"
    >
      <span>{label}</span>
      <span className="text-gray-400">›</span>
    </div>
  );
}
function ProfileItem({ label, onClick }) { return <div onClick={onClick} className="flex justify-between items-center p-4 bg-white rounded-lg shadow mb-3 cursor-pointer"><span>{label}</span><span className="text-gray-400">›</span></div>; }
