import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { getAdminStudents } from "@/services/api";
import { useState, useEffect } from "react";
import { Users, Mail, Calendar, BookOpen, Search } from "lucide-react";

export const Route = createFileRoute("/admin/students")({
  component: AdminStudentsPage,
});

function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStudents().then(data => {
      setStudents(data);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-500 mt-1">Manage and view all registered students.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-sm font-medium">
             <Users className="h-4 w-4 text-accent" />
             <span>{students.length} Total</span>
          </div>
        </header>

        {/* Search */}
        <div className="mb-8 flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search students by name or email..." 
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
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Enrolled</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
                                  {student.fullName.substring(0, 2)}
                               </div>
                               <span className="text-sm font-bold text-gray-900">{student.fullName}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                               <Mail className="h-3.5 w-3.5" />
                               {student.email}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                               <BookOpen className="h-3.5 w-3.5 text-accent" />
                               {student.enrolled_count} Courses
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                               <Calendar className="h-3.5 w-3.5" />
                               {student.date_joined}
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
             
             {students.length === 0 && (
                <div className="py-20 text-center text-gray-400">
                   No students found.
                </div>
             )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
