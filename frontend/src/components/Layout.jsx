import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar with hamburger button */}
        <div className="md:hidden flex items-center gap-3 bg-white border-b p-3">
          <button onClick={() => setMenuOpen(true)} className="text-2xl">☰</button>
          <span className="font-bold text-susu-green">SUSU</span>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}