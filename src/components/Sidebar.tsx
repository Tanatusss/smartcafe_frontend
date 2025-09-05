import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const linkBase = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200";
const linkActive = "bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800 shadow-sm border border-sky-200/50";
const linkInactive = "text-slate-600 hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 hover:text-sky-700 border border-transparent";

export default function Sidebar({ open, onClose }: SidebarProps) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthed = Boolean(token);

  return (
    <>
      {/* overlay เฉพาะจอเล็ก */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 md:hidden transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* ตัว sidebar */}
      <aside
        id="app-sidebar"
        className={`
          fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 shrink-0 
          bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50 
          backdrop-blur-md border-r border-sky-200/50 shadow-lg
          transition-transform md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-4">
          {/* Header */}
          <div className="mb-6 pb-4 border-b border-sky-200/50">
            <div className="flex items-center gap-3">
              
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <NavLink
              to="/"
              end
              onClick={onClose}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </NavLink>

            <NavLink
              to="/status-order"
              onClick={onClose}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Tracking Order
            </NavLink>

            {isAuthed && user?.role === "BARISTA" && (
              <NavLink
                to="/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </NavLink>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}