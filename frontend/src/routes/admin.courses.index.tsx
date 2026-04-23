import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { getCourses, deleteCourse } from "@/services/api";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ExternalLink, Search, ListVideo } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/courses/")({
  component: AdminCoursesPage,
});

function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourse(id);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Manage Courses</h1>
            <p className="text-gray-500 mt-1">Total {courses.length} courses available in the catalog.</p>
          </div>
          <button
            onClick={() => navigate({ to: "/admin/courses/new" })}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add New Course
          </button>
        </header>

        {/* Search & Filter */}
        <div className="mb-8 flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search courses..." 
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
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                               <img src={course.image} className="h-10 w-10 rounded-lg object-cover bg-gray-100" alt="" />
                               <div>
                                  <p className="text-sm font-bold text-gray-900">{course.title}</p>
                                  <p className="text-xs text-gray-400">{course.lessons?.length || 0} Lessons</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-sm text-gray-600">{course.category}</td>
                         <td className="px-6 py-4 text-sm font-bold">
                             <span className="font-sans font-medium mr-0.5 text-gray-400">₹</span>{course.price}
                          </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                               <Link 
                                 to="/admin/lessons"
                                 search={{ courseId: String(course.id) }}
                                 className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-accent bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors"
                               >
                                  <ListVideo className="h-3.5 w-3.5" /> Lessons
                               </Link>
                               <button
                                 onClick={() => navigate({ to: "/admin/courses/edit/$courseId", params: { courseId: String(course.id) } })}
                                 className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                               >
                                  <Edit2 className="h-4 w-4" />
                               </button>
                               <button 
                                 onClick={() => handleDelete(course.id)}
                                 className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                               >
                                  <Trash2 className="h-4 w-4" />
                               </button>
                               <Link 
                                 to="/courses/$courseId" 
                                 params={{ courseId: String(course.id) }}
                                 className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                               >
                                  <ExternalLink className="h-4 w-4" />
                               </Link>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
             
             {courses.length === 0 && (
                <div className="py-20 text-center text-gray-400">
                   No courses found.
                </div>
             )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
