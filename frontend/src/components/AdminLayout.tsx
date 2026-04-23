import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, Users, CreditCard, LogOut, Settings, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Basic Auth Protection
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const isAdmin = localStorage.getItem("is_admin") === "true";
    if (!token || !isAdmin) {
      navigate({ to: "/login", replace: true });
    }
  }, [navigate]);

  if (typeof window !== "undefined" && (!localStorage.getItem("auth_token") || localStorage.getItem("is_admin") !== "true")) {
     return null;
  }

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
    { label: "Courses", icon: BookOpen, to: "/admin/courses" },
    { label: "Students", icon: Users, to: "/admin/students" },
    { label: "Payments", icon: CreditCard, to: "/admin/payments" },
    { label: "Settings", icon: Settings, to: "/admin/dashboard" }, // Placeholder
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } sticky top-0 h-screen border-r border-gray-200 bg-white transition-all duration-300 hidden md:flex flex-col`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
          <span className={`font-display font-bold text-xl ${!isSidebarOpen && "hidden"}`}>Admin Panel</span>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-100 rounded">
            <Menu className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.to as any}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-accent"
              activeProps={{ className: "bg-accent/10 text-accent" }}
            >
              <item.icon className="h-5 w-5" />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => { logout(); navigate({ to: "/login", replace: true }); }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8">
           <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest md:hidden">Lumière Admin</h2>
           <div className="flex items-center gap-4 ml-auto">
              <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs">
                 AD
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Administrator</span>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
