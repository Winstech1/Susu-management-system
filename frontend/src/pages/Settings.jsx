import { useState } from "react";
import Layout from "../components/Layout";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleChangePassword(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      setMessage("✅ Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to change password");
    }
  }

  async function handleBackup() {
    const res = await api.get("/settings/backup");
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `susu-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleRestore(e) {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      if (!confirm("This will replace ALL current data with the backup file. Continue?")) return;
      await api.post("/settings/restore", json);
      setMessage("✅ Data restored successfully. Please refresh the app.");
    } catch (err) {
      setMessage("Failed to restore: invalid backup file");
    }
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">Settings</h1>
      {message && <p className="text-sm bg-gray-50 border p-2 rounded mb-4 max-w-md">{message}</p>}

      <div className="grid gap-6 max-w-md">
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-2">👤 Profile</h2>
          <p className="text-sm text-gray-600">Name: {user?.fullName}</p>
          <p className="text-sm text-gray-600">Username: {user?.username}</p>
          <p className="text-sm text-gray-600">Email: {user?.email || "-"}</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-3">🔒 Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              className="w-full border rounded px-3 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full border rounded px-3 py-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button className="bg-susu-green text-white px-4 py-2 rounded text-sm">Update Password</button>
          </form>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-3">💾 Backup / Restore</h2>
          <div className="flex gap-3">
            <button onClick={handleBackup} className="border px-4 py-2 rounded text-sm">
              Download Backup
            </button>
            <label className="border px-4 py-2 rounded text-sm cursor-pointer">
              Restore from File
              <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
            </label>
          </div>
        </div>
      </div>
    </Layout>
  );
}
