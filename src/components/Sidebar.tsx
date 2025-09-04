import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const linkBase = "block px-3 py-2 rounded-md text-sm";
const linkActive = "bg-black text-white";
const linkInactive = "text-gray-700 hover:bg-gray-100";

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
    fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r bg-white
    transition-transform md:translate-x-0
    ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `}
      >
        <div className="p-3">
          <nav className="space-y-1">
            <NavLink
              to="/"
              end
              onClick={onClose}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/status-order"
              onClick={onClose}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Status Order
            </NavLink>

            {isAuthed && user?.role === "BARISTA" && (
              <NavLink
                to="/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Dashboard
              </NavLink>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
