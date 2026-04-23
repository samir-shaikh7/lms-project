import { createFileRoute, useNavigate, Link, useParams } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { getCourse, updateCourse } from "@/services/api";
import { useState, useEffect } from "react";
import { ChevronLeft, Save, Image as ImageIcon, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/courses/edit/$courseId")({
  component: EditCoursePage,
});

function EditCoursePage() {
  const { courseId } = useParams({ from: "/admin/courses/edit/$courseId" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
    category: "Makeup",
    rating: 4.5
  });

  useEffect(() => {
    getCourse(courseId).then(data => {
      if (data) {
        setFormData({
          title: data.title,
          description: data.description,
          price: String(data.price),
          image: data.image || "",
          category: data.category || "Makeup",
          rating: data.rating || 4.5
        });
      }
      setFetching(false);
    });
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCourse(courseId, formData);
      toast.success("Course updated successfully!");
      navigate({ to: "/admin/courses" });
    } catch (err: any) {
      toast.error(err.message || "Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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
      <div className="max-w-4xl">
        <header className="mb-10">
          <Link to="/admin/courses" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Courses
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-500 mt-1">Refine your course content and details.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border-gray-200 py-3 px-4 focus:ring-accent focus:border-accent text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border-gray-200 py-3 px-4 focus:ring-accent focus:border-accent"
                />
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                   <input
                     required
                     type="number"
                     value={formData.price}
                     onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                     className="w-full rounded-xl border-gray-200 py-3 px-4 focus:ring-accent focus:border-accent"
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                   <select
                     value={formData.category}
                     onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                     className="w-full rounded-xl border-gray-200 py-3 px-4 focus:ring-accent focus:border-accent"
                   >
                      <option>Makeup</option>
                      <option>Bridal</option>
                      <option>Party</option>
                      <option>Self Makeup</option>
                   </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Featured Image URL</label>
                <div className="relative">
                   <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                   <input
                     required
                     type="url"
                     value={formData.image}
                     onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                     className="w-full rounded-xl border-gray-200 py-3 pl-10 pr-4 focus:ring-accent focus:border-accent text-sm"
                   />
                </div>
              </div>

              <div className="aspect-video rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                {formData.image ? (
                   <img src={formData.image} className="h-full w-full object-cover" alt="Preview" />
                ) : (
                   <div className="text-center p-4">
                      <Sparkles className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Image preview will appear here</p>
                   </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-sm font-bold text-white shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Updating..." : "Update Course"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
