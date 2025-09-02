import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useState } from "react";


export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex gap-6">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
          <main className="flex-1 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
