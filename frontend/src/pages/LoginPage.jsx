import { useState } from "react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useNavigate } from "react-router-dom";import React from "react";
export default

function LoginPage({ onLogin, onGoSignup }) {
  // useState = React's way to remember a value between renders.
  // [value, setValue] = useState(initialValue)
  const [email, setEmail] = useState("admin@fmarket.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  // Simulate a login check (in production this would be an API call)
  const handleLogin = () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    // setTimeout = fake API delay (500ms)
    setTimeout(() => { setLoading(false); onLogin(); }, 600);
  };
 
  return (
    <div className="min-h-screen bg-[#eef0f6] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="text-[#0f172a] font-bold text-xl">TrustLayer</span>
        </div>
 
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Enter your credentials to access your merchant dashboard</p>
 
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
 
          <div className="space-y-4">
            <Input label="Email Address" placeholder="admin@fmarket.com" value={email} onChange={setEmail} type="email" />
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <button className="text-xs text-blue-600 hover:underline cursor-pointer">Forgot password?</button>
              </div>
              <Input placeholder="••••••••" value={password} onChange={setPassword} type="password" />
            </div>
 
            <Button onClick={handleLogin} disabled={loading} className="w-full justify-center py-2.5">
              {loading ? "Signing in…" : "Sign In →"}
            </Button>
 
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
 
            <div className="grid grid-cols-2 gap-3">
              {["Google", "GitHub"].map(p => (
                <button key={p} className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  {p === "Google" ? "G" : "⬡"} {p}
                </button>
              ))}
            </div>
          </div>
        </div>
 
        <p className="mt-6 text-sm text-gray-500">
          Don't have an account?{" "}
          <button onClick={onGoSignup} className="text-blue-600 font-medium hover:underline cursor-pointer">Sign up</button>
        </p>
      </div>
      <footer className="py-4 px-8 flex justify-between items-center text-xs text-gray-400">
        <span>© 2026 TrustLayer Inc. Secure Fintech Operations.</span>
        <div className="flex gap-4">
          {["Privacy Policy", "Terms of Service", "Security Architecture"].map(l => (
            <a key={l} href="#" className="hover:text-gray-600">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}