import { useEffect, useState } from "react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import {
  changePasswordRequest,
  getApiKeyRequest,
  getCurrentProfile,
  regenerateApiKeyRequest,
  updateProfileRequest,
  updateSquadSecretRequest,
} from "../api";
import { useAuth } from "../context/AuthContext";

export default

function ProfilePage() {
  const { refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [squadSecretKey, setSquadSecretKey] = useState("");
  const [savingSecret, setSavingSecret] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setLoading(true);
      setNotice(null);
      try {
        const [profileResponse, apiKeyResponse] = await Promise.all([
          getCurrentProfile(),
          getApiKeyRequest().catch(() => null),
        ]);

        if (!isMounted) {
          return;
        }

        setBusinessName(profileResponse?.name || "");
        setEmail(profileResponse?.email || "");
        setPhoneNumber(profileResponse?.phone_number || "");
        setApiKey(apiKeyResponse?.api_key || "");
      } catch (requestError) {
        if (isMounted) {
          setNotice({
            type: "error",
            message: requestError?.response?.data?.detail || "Unable to load profile details.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const maskedKey = apiKey ? `${apiKey.slice(0, 5)}.....` : "—";

  const handleCopy = async () => {
    if (!apiKey) {
      setNotice({ type: "error", message: "No API key available to copy." });
      return;
    }
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice({ type: "error", message: "Unable to copy API key." });
    }
  };

  const handleProfileUpdate = async () => {
    if (!businessName.trim()) {
      setNotice({ type: "error", message: "Business name is required." });
      return;
    }

    setSavingProfile(true);
    setNotice(null);
    try {
      const response = await updateProfileRequest({
        username: businessName.trim(),
        phone_number: phoneNumber.trim() || null,
      });
      const profile = response?.profile;
      setBusinessName(profile?.name || businessName);
      setPhoneNumber(profile?.phone_number || "");
      setNotice({ type: "success", message: "Profile updated successfully." });
      await refreshSession();
    } catch (requestError) {
      setNotice({
        type: "error",
        message: requestError?.response?.data?.detail || "Unable to update profile details.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setNotice({ type: "error", message: "Please fill out all password fields." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice({ type: "error", message: "New password and confirmation do not match." });
      return;
    }

    setSavingPassword(true);
    setNotice(null);
    try {
      await changePasswordRequest({
        old_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice({ type: "success", message: "Password updated successfully." });
    } catch (requestError) {
      setNotice({
        type: "error",
        message: requestError?.response?.data?.detail || "Unable to change password.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRegenerateKey = async () => {
    setRegenerating(true);
    setNotice(null);
    try {
      const response = await regenerateApiKeyRequest();
      setApiKey(response?.api_key || "");
      setNotice({ type: "success", message: "API key regenerated successfully." });
      await refreshSession();
    } catch (requestError) {
      setNotice({
        type: "error",
        message: requestError?.response?.data?.detail || "Unable to regenerate API key.",
      });
    } finally {
      setRegenerating(false);
      setShowRegenerateModal(false);
    }
  };

  const handleUpdateSquadSecret = async () => {
    if (!squadSecretKey.trim()) {
      setNotice({ type: "error", message: "Please enter a Squad secret key." });
      return;
    }
    setSavingSecret(true);
    setNotice(null);
    try {
      await updateSquadSecretRequest({ squad_secret_key: squadSecretKey.trim() });
      setSquadSecretKey("");
      setNotice({ type: "success", message: "Squad secret key updated successfully." });
    } catch (requestError) {
      setNotice({
        type: "error",
        message: requestError?.response?.data?.detail || "Unable to update Squad secret key.",
      });
    } finally {
      setSavingSecret(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#022448]">Profile & Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your business profile and API credentials</p>
      </div>

      <div className="flex border-b border-gray-200 mb-8">
        {[
          { id: "profile", label: "Profile" },
          { id: "credentials", label: "Credentials" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {notice && (
        <div
          className={`rounded-xl px-5 py-4 mb-8 text-sm font-medium ${
            notice.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {notice.message}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading profile details...</div>
      ) : (
        <>
          {activeTab === "profile" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-semibold text-[#022448] mb-4">Business Profile</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Input label="Business Name" value={businessName} onChange={setBusinessName} placeholder="Your business name" />
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
                    <input
                      value={email}
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500"
                    />
                  </div>
                  <Input label="Phone Number" value={phoneNumber} onChange={setPhoneNumber} placeholder="e.g. +234 801 234 5678" />
                </div>
                <Button onClick={handleProfileUpdate} disabled={savingProfile}>
                  {savingProfile ? "Updating..." : "Update Profile"}
                </Button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-semibold text-[#022448] mb-4">Change Password</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Input label="Current Password" type="password" value={currentPassword} onChange={setCurrentPassword} />
                  <Input label="New Password" type="password" value={newPassword} onChange={setNewPassword} />
                  <Input label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} />
                </div>
                <Button onClick={handlePasswordChange} disabled={savingPassword}>
                  {savingPassword ? "Updating..." : "Change Password"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "credentials" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-semibold text-[#022448] mb-2">API Key</h2>
                <p className="text-sm text-gray-500 mb-4">Use this key to authenticate API requests.</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 text-gray-700">
                    {maskedKey}
                  </div>
                  <Button variant="secondary" onClick={handleCopy}>
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <Button variant="danger" onClick={() => setShowRegenerateModal(true)} disabled={regenerating}>
                  Regenerate API Key
                </Button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-semibold text-[#022448] mb-2">Squad Secret Key</h2>
                <p className="text-sm text-gray-500 mb-4">Add your Squad secret key to enable payment status checks.</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      label="Squad Secret Key"
                      type="password"
                      value={squadSecretKey}
                      onChange={setSquadSecretKey}
                      placeholder="Enter your Squad secret key"
                    />
                  </div>
                  <Button onClick={handleUpdateSquadSecret} disabled={savingSecret}>
                    {savingSecret ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showRegenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRegenerateModal(false)} />
          <div className="relative bg-white rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#022448] mb-2">Regenerate API Key?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Your existing API key will stop working immediately. Make sure to update your integrations.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowRegenerateModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleRegenerateKey} disabled={regenerating}>
                {regenerating ? "Regenerating..." : "Regenerate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
