"use client";

import { useState, useEffect } from "react";
import { Store, Lock, Bell, Save, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";

const inputClass =
  "w-full bg-transparent border border-[#2A2A2A] text-ivory text-sm font-sans font-light px-4 py-3 placeholder:text-ash focus:outline-none focus:border-gold-antique transition-colors";
const labelClass =
  "text-ash text-xs tracking-[0.14em] uppercase font-sans block mb-2";
const cardClass =
  "bg-[#111111] border border-[#1E1E1E] p-8";

function ToggleSwitch({
  enabled,
  onToggle,
  label,
  description,
  isLoading,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  description: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-[#1E1E1E] last:border-b-0">
      <div className="flex-1 pr-8">
        <p className="text-ivory text-sm font-sans font-light">{label}</p>
        <p className="text-ash text-xs font-sans mt-1">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={isLoading}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
          enabled ? "bg-gold-warm" : "bg-[#2A2A2A]"
        } ${isLoading ? "opacity-50" : ""}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = api.settings.get.useQuery();
  const utils = api.useUtils();

  const updateSettings = api.settings.update.useMutation({
    onSuccess: () => {
      setStoreSaved(true);
      toast.success("Settings saved successfully");
      utils.settings.get.invalidate();
      setTimeout(() => setStoreSaved(false), 2500);
    },
    onError: (e) => {
      toast.error(e.message || "Failed to save settings");
    }
  });

  const updatePassword = api.settings.updatePassword.useMutation({
    onSuccess: () => {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (e) => {
      setPasswordError(e.message || "Failed to update password");
    }
  });

  // Store Info
  const [storeName, setStoreName] = useState("Fraviont");
  const [storeEmail, setStoreEmail] = useState("hello@fraviont.com");
  const [currency, setCurrency] = useState("ZAR");
  const [storeTagline, setStoreTagline] = useState("The Art of Presence");

  // Notification preferences
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [customerSignups, setCustomerSignups] = useState(false);
  const [returnRequests, setReturnRequests] = useState(true);

  // Initialize state from DB
  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName);
      setStoreEmail(settings.contactEmail);
      setCurrency(settings.currency);
      setStoreTagline(settings.storeTagline);
      setOrderAlerts(settings.orderAlerts);
      setLowStockAlerts(settings.lowStockAlerts);
      setWeeklyDigest(settings.weeklyDigest);
      setCustomerSignups(settings.customerSignups);
      setReturnRequests(settings.returnRequests);
    }
  }, [settings]);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Save states
  const [storeSaved, setStoreSaved] = useState(false);

  function handleStoreSave(e: React.FormEvent) {
    e.preventDefault();
    updateSettings.mutate({
      storeName,
      storeTagline,
      contactEmail: storeEmail,
      currency,
      orderAlerts,
      lowStockAlerts,
      returnRequests,
      customerSignups,
      weeklyDigest,
    });
  }

  function handleToggleNotification(key: string, newValue: boolean) {
    // Optimistic update of local state
    if (key === 'orderAlerts') setOrderAlerts(newValue);
    if (key === 'lowStockAlerts') setLowStockAlerts(newValue);
    if (key === 'weeklyDigest') setWeeklyDigest(newValue);
    if (key === 'customerSignups') setCustomerSignups(newValue);
    if (key === 'returnRequests') setReturnRequests(newValue);

    // Save all to backend immediately
    updateSettings.mutate({
      storeName,
      storeTagline,
      contactEmail: storeEmail,
      currency,
      orderAlerts: key === 'orderAlerts' ? newValue : orderAlerts,
      lowStockAlerts: key === 'lowStockAlerts' ? newValue : lowStockAlerts,
      returnRequests: key === 'returnRequests' ? newValue : returnRequests,
      customerSignups: key === 'customerSignups' ? newValue : customerSignups,
      weeklyDigest: key === 'weeklyDigest' ? newValue : weeklyDigest,
    });
  }

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    updatePassword.mutate({ currentPassword, newPassword });
  }

  return (
    <div>
      <h2 className="font-display text-ivory font-light text-3xl mb-2">
        Settings
      </h2>
      <p className="text-ash text-sm font-sans font-light mb-10">
        Manage your store configuration, account security, and notification
        preferences.
      </p>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-gold-warm" />
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ─── Store Information ────────────────────────────────────────── */}
        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gold-warm/10 flex items-center justify-center">
              <Store size={18} className="text-gold-warm" />
            </div>
            <div>
              <h3 className="text-ivory text-base font-sans font-medium">
                Store Information
              </h3>
              <p className="text-ash text-xs font-sans">
                General store configuration
              </p>
            </div>
          </div>
          <form onSubmit={handleStoreSave} className="space-y-5">
            <div>
              <label className={labelClass}>Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tagline</label>
              <input
                type="text"
                value={storeTagline}
                onChange={(e) => setStoreTagline(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Contact Email</label>
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={inputClass}
              >
                <option className="bg-black" value="ZAR">ZAR — South African Rand</option>
                <option className="bg-black" value="USD">USD — US Dollar</option>
                <option className="bg-black" value="EUR">EUR — Euro</option>
                <option className="bg-black" value="GBP">GBP — British Pound</option>
                <option className="bg-black" value="PKR">PKR — Pakistani Rupee</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={updateSettings.isPending}
              className="flex items-center gap-2 bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-6 py-3 hover:bg-gold-bright transition-colors duration-300 disabled:opacity-50"
            >
              {updateSettings.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : storeSaved ? (
                <Check size={14} />
              ) : (
                <Save size={14} />
              )}
              {storeSaved ? "Saved" : "Save Changes"}
            </button>
          </form>
        </div>

        {/* ─── Admin Account / Password ────────────────────────────────── */}
        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gold-warm/10 flex items-center justify-center">
              <Lock size={18} className="text-gold-warm" />
            </div>
            <div>
              <h3 className="text-ivory text-base font-sans font-medium">
                Account Security
              </h3>
              <p className="text-ash text-xs font-sans">
                Change your admin password
              </p>
            </div>
          </div>

          {passwordError && (
            <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 mb-6">
              <p className="text-red-400 text-xs font-sans">{passwordError}</p>
            </div>
          )}
          {passwordSuccess && (
            <div className="border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 mb-6">
              <p className="text-emerald-400 text-xs font-sans">
                Password updated successfully.
              </p>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className={labelClass}>Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Minimum 8 characters"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter new password"
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-6">
              <button
                type="submit"
                disabled={updatePassword.isPending}
                className="flex items-center gap-2 bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-6 py-3 hover:bg-gold-bright transition-colors duration-300 disabled:opacity-50"
              >
                {updatePassword.isPending ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-ash hover:text-ivory transition-colors text-xs font-sans flex items-center gap-1.5"
              >
                {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPasswords ? "Hide" : "Show"}
              </button>
            </div>
          </form>
        </div>

        {/* ─── Notification Preferences ────────────────────────────────── */}
        <div className={`${cardClass} lg:col-span-2`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gold-warm/10 flex items-center justify-center">
              <Bell size={18} className="text-gold-warm" />
            </div>
            <div>
              <h3 className="text-ivory text-base font-sans font-medium">
                Notification Preferences
              </h3>
              <p className="text-ash text-xs font-sans">
                Choose which alerts you receive
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
            <div>
              <ToggleSwitch
                enabled={orderAlerts}
                onToggle={() => handleToggleNotification('orderAlerts', !orderAlerts)}
                label="New Order Alerts"
                description="Email notification when a new order is placed."
                isLoading={updateSettings.isPending}
              />
              <ToggleSwitch
                enabled={lowStockAlerts}
                onToggle={() => handleToggleNotification('lowStockAlerts', !lowStockAlerts)}
                label="Low Stock Alerts"
                description="Get notified when a variant drops below its threshold."
                isLoading={updateSettings.isPending}
              />
              <ToggleSwitch
                enabled={returnRequests}
                onToggle={() => handleToggleNotification('returnRequests', !returnRequests)}
                label="Return Requests"
                description="Receive alerts for new return or exchange requests."
                isLoading={updateSettings.isPending}
              />
            </div>
            <div>
              <ToggleSwitch
                enabled={customerSignups}
                onToggle={() => handleToggleNotification('customerSignups', !customerSignups)}
                label="Customer Sign-ups"
                description="Get notified when a new customer creates an account."
                isLoading={updateSettings.isPending}
              />
              <ToggleSwitch
                enabled={weeklyDigest}
                onToggle={() => handleToggleNotification('weeklyDigest', !weeklyDigest)}
                label="Weekly Digest"
                description="Receive a weekly summary of sales, trends, and AI insights."
                isLoading={updateSettings.isPending}
              />
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

