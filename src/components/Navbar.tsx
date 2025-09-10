import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";

type Props = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

const linkBase = "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200";
const linkActive = "bg-sky-100 text-sky-800 shadow-sm";
const linkInactive = "text-slate-600 hover:bg-sky-50 hover:text-sky-700";

export default function Navbar({ sidebarOpen, onToggleSidebar }: Props) {

  // ดึง token, user, logout จาก store
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const isAuthed = Boolean(token);
  const displayName = user?.name || user?.email || "Account";
  const initial = displayName.charAt(0).toUpperCase();// เอาตัวอักษรแรกมาแสดงใน avatar

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null); // ref ของ desktop dropdown
  const mobileMenuRef = useRef<HTMLDivElement | null>(null); // ref ของ mobile dropdown

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
    <header className="h-16 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 backdrop-blur-md border-b border-sky-100/50 sticky top-0 z-50 shadow-sm">
      <nav className="w-full h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            aria-pressed={sidebarOpen}
            aria-controls="app-sidebar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200/50 bg-white/70 hover:bg-sky-50 transition-colors md:hidden shadow-sm"
          >
            <div className="flex flex-col gap-1">
              <span className="block h-0.5 w-5 bg-sky-700 rounded-full"></span>
              <span className="block h-0.5 w-5 bg-sky-700 rounded-full"></span>
              <span className="block h-0.5 w-5 bg-sky-700 rounded-full"></span>
            </div>
            <span className="sr-only">Toggle sidebar</span>
          </button>

          <NavLink to="/" className="flex items-center gap-2 group">
            {/* Coffee Icon */}
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                {/* path ทำเป็นรูปเครื่องกาแฟ */}
                <path d="M4 3a1 1 0 000 2h1v2a4 4 0 008 0V5h1a1 1 0 100-2H4zM6 7V5h8v2a2 2 0 11-4 0V5H8v2a2 2 0 01-2 0z"/>
                <path d="M4 11a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM5 14a1 1 0 100 2h6a1 1 0 100-2H5z"/>
              </svg>
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">
              Smart Cafe
            </span>
          </NavLink>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          {!isAuthed ? (
            <>
              <NavLink
                to="/register"
                end
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                สมัครสมาชิก
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                เข้าสู่ระบบ
              </NavLink>
            </>
          ) : (
            // ถ้า login แล้ว → แสดง avatar + dropdown
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm hover:bg-white/50 transition-all duration-200 border border-sky-200/50 bg-white/30 shadow-sm"
                title={displayName}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white text-sm font-medium shadow-sm">
                  {initial || "U"}
                </span>
                <span className="max-w-[8rem] lg:max-w-[10rem] truncate text-slate-700 font-medium">
                  {displayName}
                </span>
                <svg
                  className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-sky-200/50 bg-white/95 backdrop-blur-md shadow-lg py-2 overflow-hidden"
                >
                  <div className="px-4 py-3 text-xs text-slate-500 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100/50">
                    เข้าสู่ระบบแล้ว
                    <div className="text-slate-700 text-sm font-medium truncate mt-1">
                      {displayName}
                    </div>
                  </div>

                  <button
                    className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-600 font-medium transition-colors duration-200 flex items-center gap-2"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    ออกจากระบบ
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
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/50 transition-colors"
              title={displayName}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white text-sm font-medium shadow-sm">
                {initial || "U"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl hover:bg-white/50 transition-colors border border-sky-200/50 bg-white/30"
            >
              <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="absolute right-4 mt-2 w-56 rounded-2xl border border-sky-200/50 bg-white/95 backdrop-blur-md shadow-lg py-2 overflow-hidden">
              {!isAuthed ? (
                <>
                  <NavLink
                    to="/register"
                    className="block px-4 py-3 text-sm hover:bg-sky-50 font-medium text-slate-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    สมัครสมาชิก
                  </NavLink>
                  <NavLink
                    to="/login"
                    className="block px-4 py-3 text-sm hover:bg-sky-50 font-medium text-slate-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    เข้าสู่ระบบ
                  </NavLink>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 text-xs text-slate-500 border-b border-sky-100/50 bg-gradient-to-r from-sky-50 to-blue-50">
                    เข้าสู่ระบบแล้ว
                    <div className="text-slate-700 text-sm font-medium truncate mt-1">
                      {displayName}
                    </div>
                  </div>
                  <button
                    className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-600 font-medium transition-colors flex items-center gap-2"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    ออกจากระบบ
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