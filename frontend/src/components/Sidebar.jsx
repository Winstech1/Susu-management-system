import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/members", label: "Members", icon: "👥" },
  { to: "/savings", label: "Savings", icon: "💰" },
  { to: "/withdrawals", label: "Withdrawals", icon: "📤" },
  { to: "/groups", label: "Groups", icon: "🧑‍🤝‍🧑" },
  { to: "/reports", label: "Reports", icon: "📊", adminOnly: true },
  { to: "/users", label: "Manage Users", icon: "🔐", adminOnly: true },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const visibleLinks = links.filter((l) => !l.adminOnly || user?.role === "admin");

  return (
    <>
      {/* Dark overlay behind the menu on mobile, tap to close */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 h-full w-56 bg-white border-r flex flex-col z-40
        transform transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg text-susu-green">SUSU</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
          <button onClick={onClose} className="md:hidden text-xl">✕</button>
        </div>

               <nav className="flex-1 py-2 overflow-y-auto">
          {visibleLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm ${
                  isActive
                    ? "bg-green-50 text-susu-green font-semibold border-r-4 border-susu-green"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="m-4 px-3 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
        >
          Logout
        </button>
      </aside>
    </>
  );
}