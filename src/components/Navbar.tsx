import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";

type Props = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

const linkBase = "px-3 py-1.5 rounded-md text-sm";
const linkActive = "bg-black text-white";
const linkInactive = "text-gray-700 hover:bg-gray-100";

export default function Navbar({ sidebarOpen, onToggleSidebar }: Props) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const isAuthed = Boolean(token);
  const displayName = user?.name || user?.email || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  // ปิดเมนูเมื่อคลิกข้างนอก
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (menuOpen || mobileMenuOpen) {
      document.addEventListener("mousedown", onDocClick);
    }
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen, mobileMenuOpen]);

  return (
    <header className="h-14 bg-white/80 backdrop-blur border-b sticky top-0 z-50">
      <nav className="w-full h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            aria-pressed={sidebarOpen}
            aria-controls="app-sidebar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border md:hidden"
          >
            <div className="flex flex-col gap-1">
              <span className="block h-0.5 w-5 bg-black"></span>
              <span className="block h-0.5 w-5 bg-black"></span>
              <span className="block h-0.5 w-5 bg-black"></span>
            </div>
            <span className="sr-only">Toggle sidebar</span>
          </button>

          <NavLink to="/" className="text-lg sm:text-xl font-bold truncate">
            Smart Cafe
          </NavLink>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1">
          {!isAuthed ? (
            <>
              <NavLink
                to="/register"
                end
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Register
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Login
              </NavLink>
            </>
          ) : (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm hover:bg-gray-100"
                title={displayName}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-white text-xs">
                  {initial || "U"}
                </span>
                <span className="max-w-[8rem] lg:max-w-[10rem] truncate text-gray-800">
                  {displayName}
                </span>
                <svg
                  className={`h-4 w-4 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg py-1"
                >
                  <div className="px-4 py-2 text-xs text-gray-500">
                    Signed in as
                    <div className="text-gray-900 text-sm font-medium truncate">
                      {displayName}
                    </div>
                  </div>

                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden" ref={mobileMenuRef}>
          {isAuthed ? (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 p-1"
              title={displayName}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm">
                {initial || "U"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="absolute right-4 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg py-1">
              {!isAuthed ? (
                <>
                  <NavLink
                    to="/register"
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </NavLink>
                  <NavLink
                    to="/login"
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </NavLink>
                </>
              ) : (
                <>
                  <div className="px-4 py-2 text-xs text-gray-500 border-b">
                    Signed in as
                    <div className="text-gray-900 text-sm font-medium truncate">
                      {displayName}
                    </div>
                  </div>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}