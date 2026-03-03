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
      <h1 className="text-2xl font-bold mb-4">Login or Signup</h1>
      <div className="flex gap-2 mb-4">
        {['login','email','google','mobile'].map(m => <button key={m} onClick={() => setMode(m)} className={`px-3 py-1 rounded ${mode===m?'bg-indigo-600 text-white':'bg-gray-200'}`}>{m}</button>)}
      </div>

      {mode !== "login" && <input className="border p-2 mb-3 w-full" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />}
      <input className="border p-2 mb-3 w-full" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
      {(mode === "email" || mode === "google") && <input className="border p-2 mb-3 w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />}
      {(mode === "login" || mode === "email") && <input type="password" className="border p-2 mb-3 w-full" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />}
      {mode === "mobile" && <input className="border p-2 mb-3 w-full" placeholder="OTP (use 123456)" value={otp} onChange={(e) => setOtp(e.target.value)} />}

      <button
        onClick={async () => {
          try {
            if (mode === "login") await handleLogin();
            else if (mode === "email") await handleEmailSignup();
            else if (mode === "google") await handleGoogleSignup();
            else await handleOtpSignup();
          } catch (err) { alert(err.response?.data?.message || err.response?.data || "Auth failed"); }
        }}
        className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
      >Continue</button>
    </div>
  );
}
