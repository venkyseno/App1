import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const navigate = useNavigate();
  const [authType, setAuthType] = useState("login");
  const [signupMethod, setSignupMethod] = useState("email");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("123456");

  const postAuthNavigate = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    if (user.role === "ADMIN") navigate("/admin/dashboard");
    else if (user.role === "WORKER") navigate("/worker/dashboard");
    else navigate("/profile");
  };

  const submit = async () => {
    if (authType === "login") {
      const { data } = await api.post("/users/login", { mobile, password });
      return postAuthNavigate(data);
    }

    if (signupMethod === "email") {
      const { data } = await api.post("/users/signup", { name, email, mobile, password, signupProvider: "EMAIL" });
      return postAuthNavigate(data);
    }
    if (signupMethod === "google") {
      const { data } = await api.post("/users/google-signup", { name, email, mobile });
      return postAuthNavigate(data);
    }
    const { data } = await api.post("/users/mobile-otp-signup", { name, mobile, otp });
    return postAuthNavigate(data);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="bg-white border rounded-2xl p-5 shadow">
        <h1 className="text-2xl font-bold mb-4">Welcome</h1>
        <div className="flex gap-2 mb-4">
          {[
            { key: "login", label: "Login" },
            { key: "signup", label: "Signup" },
          ].map((item) => (
            <button key={item.key} onClick={() => setAuthType(item.key)} className={`flex-1 py-2 rounded-lg ${authType === item.key ? "bg-indigo-600 text-white" : "bg-gray-100"}`}>
              {item.label}
            </button>
          ))}
        </div>

        {authType === "signup" && (
          <div className="flex gap-2 mb-4">
            {[
              { key: "email", label: "Email" },
              { key: "google", label: "Google" },
              { key: "mobile", label: "Mobile OTP" },
            ].map((item) => (
              <button key={item.key} onClick={() => setSignupMethod(item.key)} className={`px-3 py-1 rounded-full text-sm ${signupMethod === item.key ? "bg-indigo-100 text-indigo-700" : "bg-gray-100"}`}>
                {item.label}
              </button>
            ))}
          </div>
        )}

        {authType === "signup" && <input className="border p-2 mb-3 w-full rounded" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />}
        <input className="border p-2 mb-3 w-full rounded" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        {(authType === "login" || signupMethod === "email") && <input type="password" className="border p-2 mb-3 w-full rounded" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />}
        {(authType === "signup" && (signupMethod === "email" || signupMethod === "google")) && <input className="border p-2 mb-3 w-full rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />}
        {(authType === "signup" && signupMethod === "mobile") && <input className="border p-2 mb-3 w-full rounded" placeholder="OTP (123456)" value={otp} onChange={(e) => setOtp(e.target.value)} />}

        <button onClick={async () => {
          try { await submit(); }
          catch (err) { alert(err.response?.data?.message || err.response?.data || "Authentication failed"); }
        }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg w-full">
          Continue
        </button>
      </div>
    </div>
  );
}
