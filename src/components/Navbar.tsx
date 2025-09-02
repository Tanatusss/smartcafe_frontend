import { NavLink } from "react-router-dom";

type Props = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

const linkBase = "px-3 py-1.5 rounded-md text-sm";
const linkActive = "bg-black text-white";
const linkInactive = "text-gray-700 hover:bg-gray-100";

export default function Navbar({ sidebarOpen, onToggleSidebar }: Props) {
  return (
    <header className="h-14 bg-white/80 backdrop-blur border-b sticky top-0 z-50">
      <nav className="mx-auto max-w-6xl h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            aria-pressed={sidebarOpen}
            aria-controls="app-sidebar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border md:hidden"
          >
            
            <span className="i-[--] block h-0.5 w-5 bg-black"></span>
            <span className="sr-only">Toggle sidebar</span>
          </button>

          <NavLink to="/" className="text-lg font-bold">
            Smart Cafe
          </NavLink>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Register
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Login
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
