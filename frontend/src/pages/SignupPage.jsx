import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/trustlayer-logo.png";

export default

function SignupPage() {
  const navigate = useNavigate();
  const { signUp, submitting, error, setError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
 
  // Calculate password strength (0-4)
  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return s;
  }, [password]);
 
  const strengthLabel = ["", "Weak", "Fair", "Moderate", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-blue-600"][strength];
 
  const handleSignup = async () => {
    setError("");
    if (!name || !email || !password || !agreed) {
      setError("Please complete every field and accept the terms.");
      return;
    }

    try {
      await signUp({ username: name, email, password });
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || "Unable to create your account.");
    }
  };
 
  return (
    <div className="min-h-screen bg-[#eef0f6] flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2.5">
        <img src={Logo} alt="TrustLayer Logo" width={200} />
      </div>
 
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#022448] mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Start securing your platform with TrustLayer today</p>
 
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        <div className="space-y-4">
          <Input label="Business Name" placeholder="John Doe Ventures" value={name} onChange={setName} />
          <Input label="Work Email" placeholder="name@company.com" value={email} onChange={setEmail} type="email" />
 
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <span className="absolute right-3 top-2.5 text-gray-400 cursor-pointer">👁</span>
            </div>
            {/* Password strength bars */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : "bg-gray-200"}`} />
                  ))}
                </div>
                <p className={`text-xs font-medium ${strengthColor.replace("bg-", "text-")}`}>Strength: {strengthLabel}</p>
              </div>
            )}
          </div>
 
          <div className="flex items-start gap-2">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5" />
            <p className="text-sm text-gray-600">
              I agree to the <span className="text-blue-600 cursor-pointer">Terms of Service</span> and <span className="text-blue-600 cursor-pointer">Privacy Policy</span>
            </p>
          </div>
 
          <Button onClick={handleSignup} disabled={submitting || !agreed} className="w-full justify-center py-2.5">
            {submitting ? "Creating Account…" : "Create Account"}
          </Button>
 
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR SIGN UP WITH</span>
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
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} className="text-blue-600 font-medium hover:underline cursor-pointer">Log in</button>
      </p>
    </div>
  );
}
