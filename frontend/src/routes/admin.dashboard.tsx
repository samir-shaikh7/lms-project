import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { getAdminStats, getAdminPayments } from "@/services/api";
import { useState, useEffect } from "react";
import { BookOpen, Users, IndianRupee, TrendingUp, Star, Layout, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_courses: 0,
    total_students: 0,
    total_revenue: 0,
    avg_rating: 4.5,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, p] = await Promise.all([getAdminStats(), getAdminPayments()]);
        setStats(s);
        setRecentPayments(p.slice(0, 5));
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const cards = [
    { label: "Total Courses", value: stats.total_courses, icon: BookOpen, color: "bg-blue-500" },
    { label: "Active Students", value: stats.total_students, icon: Users, color: "bg-purple-500" },
    { label: "Total Revenue", value: <><span className="font-sans text-xl mr-0.5 opacity-70">₹</span>{stats.total_revenue.toLocaleString()}</>, icon: IndianRupee, color: "bg-green-500" },
    { label: "Avg Rating", value: Number(stats.avg_rating).toFixed(1), icon: Star, color: "bg-amber-500" },
  ];

  if (loading) {
    return (
       <AdminLayout>
          <div className="flex py-20 justify-center">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
          </div>
       </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <header className="mb-10">
          <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Real-time performance and insights from your academy.</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.color} text-white`}>
                   <card.icon className="h-6 w-6" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
           <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-lg">Recent Transactions</h3>
                 <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <div className="space-y-6">
                 {recentPayments.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-10">No transactions recorded yet.</p>
                 ) : (
                    recentPayments.map((p) => (
                       <div key={p.id} className="flex items-start gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                          <div className="h-10 w-10 rounded-full bg-accent/5 flex items-center justify-center font-bold text-accent text-xs">
                             {p.user.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-sm font-semibold truncate">{p.user}</p>
                             <p className="text-[10px] text-gray-400 mt-0.5 truncate">{p.course} • {p.date}</p>
                          </div>
                           <span className="text-xs font-bold text-green-600">
                             <span className="font-sans mr-0.5">₹</span>{p.amount}
                           </span>
                       </div>
                    ))
                 )}
              </div>
           </div>
           
           <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                 <Layout className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Advanced Analytics</h3>
              <p className="text-gray-400 text-sm max-w-xs">
                 Revenue growth charts, student retention rates, and course popularity insights are being processed.
              </p>
              <div className="mt-8 h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-2/3 animate-pulse"></div>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}
