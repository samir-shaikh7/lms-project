import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ShieldCheck, Phone, Mail, Award } from "lucide-react";
import { useAuth } from "./AuthProvider";

const links = [
  { to: "/" as const, label: "Home" },
  { to: "/courses" as const, label: "Courses" },
  { to: "/dashboard" as const, label: "Dashboard" },
  { to: "/profile" as const, label: "Profile" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const isAdmin = typeof window !== "undefined" && localStorage.getItem("is_admin") === "true";

  const filteredLinks = links.filter((l) => {
    if (l.to === "/dashboard" || l.to === "/profile") {
      return isAuthenticated;
    }
    return true;
  });

  return (
    <header className="w-full relative">
      {/* TOP BAR (White) */}
      <div className="hidden bg-white border-b border-gray-100 py-2 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center" replace={true}>
             <img 
               src="/logo.webp" 
               alt="IBT Beauty Academy" 
               className="h-20 w-auto object-contain transition-transform hover:scale-105 duration-300" 
             />
          </Link>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 border-r border-gray-200 pr-8 last:border-0">
               <div className="rounded-full bg-accent/10 p-2">
                  <Phone className="h-4 w-4 text-accent" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Call Us</p>
                  <p className="text-sm font-bold text-gray-700">(+91) 7770010108</p>
               </div>
            </div>

            <div className="flex items-center gap-3 border-r border-gray-200 pr-8 last:border-0">
               <div className="rounded-full bg-accent/10 p-2">
                  <Mail className="h-4 w-4 text-accent" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Us</p>
                  <p className="text-sm font-bold text-gray-700">ibtbeautyacademy@gmail.com</p>
               </div>
            </div>

            <div className="flex items-center gap-3 last:border-0">
               <div className="rounded-full bg-accent/10 p-2">
                  <Award className="h-4 w-4 text-accent" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ISO Certificate</p>
                  <p className="text-sm font-bold text-gray-700">ISO 9001:2015</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN NAV (Black) */}
      <div className="bg-[#1a1a1a] py-2">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo for Mobile */}
          <Link to="/" className="md:hidden flex items-center" replace={true}>
            <img 
               src="/logo.webp" 
               alt="Logo" 
               className="h-10 w-auto object-contain" 
            />
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {filteredLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                replace={l.to === "/"}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-accent border-b-2 border-accent pb-1" }}
                inactiveProps={{ className: "text-gray-300 hover:text-white" }}
                className="text-[13px] font-bold uppercase tracking-widest transition-all"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="hidden md:flex items-center gap-1.5 rounded bg-accent px-4 py-1.5 text-[10px] font-black text-white transition-all hover:bg-accent/90 tracking-tighter"
              >
                <ShieldCheck className="h-3 w-3" /> ADMIN DASHBOARD
              </Link>
            )}

            {isAuthenticated ? (
              <button
                onClick={logout}
                className="rounded border border-white/20 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-white hover:text-black"
              >
                LOGOUT
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded border border-white/20 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-white hover:text-black"
              >
                LOGIN
              </Link>
            )}

            <button
              aria-label="Toggle menu"
              className="text-white md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="bg-[#1a1a1a] border-t border-white/10 md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-6">
            {filteredLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                replace={l.to === "/"}
                onClick={() => setOpen(false)}
                className="rounded px-3 py-3 text-sm font-bold text-gray-300 hover:bg-white/5 hover:text-white uppercase tracking-widest"
              >
                {l.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setOpen(false)}
                className="rounded px-3 py-3 text-sm font-bold text-accent bg-accent/5 flex items-center gap-2 uppercase tracking-widest"
              >
                <ShieldCheck className="h-4 w-4" /> Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
