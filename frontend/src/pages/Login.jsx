import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 w-80 border"
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👤</div>
          <h1 className="font-bold text-lg">SUSU MANAGEMENT SYSTEM</h1>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">{error}</p>
        )}

        <label className="text-sm text-gray-600">Username</label>
        <input
          className="w-full border rounded px-3 py-2 mb-3 mt-1"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="text-sm text-gray-600">Password</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2 mb-3 mt-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <input type="checkbox" id="remember" />
          <label htmlFor="remember">Remember me</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-susu-green text-white rounded py-2 font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>
      </form>
    </div>
  );
}
