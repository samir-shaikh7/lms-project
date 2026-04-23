import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { getAdminLessons, createLesson, updateLesson, deleteLesson, getCourse } from "@/services/api";
import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Edit2, Trash2, Video, Clock, Save, X, Play } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/lessons")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      courseId: (search.courseId as string) || "",
    };
  },
  component: AdminLessonsPage,
});

function AdminLessonsPage() {
  const { courseId } = useSearch({ from: "/admin/lessons" });
  const [lessons, setLessons] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    video_url: "",
    duration: "10:00",
    order: 0,
  });

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const [l, c] = await Promise.all([
        getAdminLessons(courseId),
        getCourse(courseId)
      ]);
      setLessons(l);
      setCourse(c);
      // Auto-set next order
      setFormData(prev => ({ ...prev, order: l.length + 1 }));
    } catch (err) {
      toast.error("Failed to fetch lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchLessons();
  }, [courseId]);

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      video_url: lesson.video_url,
      duration: lesson.duration,
      order: lesson.order,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this lesson?")) return;
    try {
      await deleteLesson(id);
      toast.success("Lesson deleted");
      fetchLessons();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await updateLesson(editingLesson.id, formData);
        toast.success("Lesson updated");
      } else {
        await createLesson({ ...formData, course_id: courseId });
        toast.success("Lesson added");
      }
      setShowForm(false);
      setEditingLesson(null);
      fetchLessons();
    } catch (err: any) {
      toast.error("Operation failed");
    }
  };

  if (loading && !course) {
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
      <div className="max-w-5xl">
        <header className="mb-10">
          <Link to="/admin/courses" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Courses
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900">Manage Curriculum</h1>
              <p className="text-gray-500 mt-1">{course?.title}</p>
            </div>
            <button
              onClick={() => {
                setEditingLesson(null);
                setFormData({ title: "", video_url: "", duration: "10:00", order: lessons.length + 1 });
                setShowForm(!showForm);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Cancel" : "Add Lesson"}
            </button>
          </div>
        </header>

        {showForm && (
          <div className="mb-12 bg-white p-8 rounded-3xl border border-accent/20 shadow-xl shadow-accent/5 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Video className="h-5 w-5 text-accent" />
              {editingLesson ? "Edit Lesson" : "New Lesson"}
            </h3>
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Lesson Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border-gray-200 py-3 px-4 focus:ring-accent focus:border-accent"
                  placeholder="Introduction to Bridal Basics"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Video URL (YouTube/Embed)</label>
                <input
                  required
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full rounded-xl border-gray-200 py-3 px-4 focus:ring-accent focus:border-accent"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                    <input
                      required
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full rounded-xl border-gray-200 py-3 px-4 focus:ring-accent focus:border-accent"
                      placeholder="12:45"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Order</label>
                    <input
                      required
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full rounded-xl border-gray-200 py-3 px-4 focus:ring-accent focus:border-accent"
                    />
                 </div>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-foreground px-8 py-3 text-sm font-bold text-background transition-all hover:opacity-90 active:scale-95"
                >
                  <Save className="h-4 w-4" /> {editingLesson ? "Update Lesson" : "Create Lesson"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {lessons.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
               <Video className="h-12 w-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-400">No lessons added to this course yet.</p>
            </div>
          ) : (
            lessons.map((lesson) => (
              <div key={lesson.id} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6 transition-all hover:shadow-md hover:border-accent/10">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 font-display font-bold text-lg group-hover:bg-accent/5 group-hover:text-accent transition-colors">
                   {lesson.order}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate">{lesson.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Play className="h-3 w-3" /> {lesson.video_url.substring(0, 30)}...</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => handleEdit(lesson)}
                     className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                   >
                     <Edit2 className="h-4 w-4" />
                   </button>
                   <button 
                     onClick={() => handleDelete(lesson.id)}
                     className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
