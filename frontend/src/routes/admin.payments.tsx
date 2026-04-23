import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { getAdminPayments } from "@/services/api";
import { useState, useEffect } from "react";
import { CreditCard, User, BookOpen, Calendar, CheckCircle, Search, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminPayments().then(data => {
      setPayments(data);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500 mt-1">Transaction history and revenue tracking.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-sm font-bold text-green-600">
             <IndianRupee className="h-4 w-4" />
             <span><span className="font-sans mr-0.5">₹</span>{payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()} Total Revenue</span>
          </div>
        </header>

        {/* Search */}
        <div className="mb-8 flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="w-full pl-10 pr-4 py-2 text-sm border-0 focus:ring-0"
              />
           </div>
        </div>

        {loading ? (
          <div className="flex py-20 justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                               <User className="h-3.5 w-3.5 text-gray-400" />
                               {p.user}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                               <BookOpen className="h-3.5 w-3.5 text-accent/60" />
                               {p.course}
                            </div>
                         </td>
                         <td className="px-6 py-4 text-sm font-bold text-gray-900">
                            <span className="font-sans mr-0.5 text-gray-400">₹</span>{p.amount.toLocaleString()}
                         </td>
                         <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-600 uppercase">
                               <CheckCircle className="h-3 w-3" /> {p.status}
                            </span>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                               <Calendar className="h-3.5 w-3.5" />
                               {p.date}
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
             
             {payments.length === 0 && (
                <div className="py-20 text-center text-gray-400">
                   No transactions found.
                </div>
             )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
