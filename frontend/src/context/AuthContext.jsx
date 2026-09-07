import { createContext, useContext, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("susu_user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(username, password) {
    const res = await api.post("/auth/login", { username, password });
    localStorage.setItem("susu_token", res.data.token);
    localStorage.setItem("susu_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem("susu_token");
    localStorage.removeItem("susu_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
