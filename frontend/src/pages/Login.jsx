import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { Card, InputField, PageContainer, PrimaryButton, SecondaryButton } from "../components/ui";

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
    <PageContainer className="max-w-xl" title="Welcome Back" subtitle="Login or create your account to continue.">
      <Card>
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
          {[{ key: "login", label: "Login" }, { key: "signup", label: "Signup" }].map((item) => (
            <button key={item.key} onClick={() => setAuthType(item.key)} className={`rounded-lg py-2 text-sm font-medium ${authType === item.key ? "bg-white text-indigo-700 shadow" : "text-gray-600"}`}>
              {item.label}
            </button>
          ))}
        </div>

        {authType === "signup" && (
          <div className="mb-4 flex flex-wrap gap-2">
            {[{ key: "email", label: "Email" }, { key: "google", label: "Google" }, { key: "mobile", label: "Mobile OTP" }].map((item) => (
              <button key={item.key} onClick={() => setSignupMethod(item.key)} className={`rounded-full px-3 py-1 text-xs font-medium ${signupMethod === item.key ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {authType === "signup" && <InputField label="Full Name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />}
          <InputField label="Mobile" placeholder="Enter mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          {(authType === "login" || signupMethod === "email") && <InputField type="password" label="Password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />}
          {(authType === "signup" && (signupMethod === "email" || signupMethod === "google")) && <InputField label="Email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />}
          {(authType === "signup" && signupMethod === "mobile") && <InputField label="OTP" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />}
        </div>

        <PrimaryButton
          className="mt-5 w-full"
          onClick={async () => {
            try { await submit(); }
            catch (err) { alert(err.response?.data?.message || err.response?.data || "Authentication failed"); }
          }}
        >
          Continue
        </PrimaryButton>

        <SecondaryButton className="mt-3 w-full" onClick={() => navigate("/")}>Back to Home</SecondaryButton>
      </Card>
    </PageContainer>
  );
}
