import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { getMyCourses, downloadCertificate } from "@/services/api";
import { useState, useEffect } from "react";
import { BookOpen, Award, Clock, ArrowRight, PlayCircle, CheckCircle, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchMyCourses() {
      try {
        const data = await getMyCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch dashboard courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyCourses();
  }, []);

  async function handleDownload(e: React.MouseEvent, courseId: number) {
     e.preventDefault();
     e.stopPropagation();
     setDownloadingId(courseId);
     try {
        await downloadCertificate(courseId);
        toast.success("Certificate downloaded!");
     } catch (err: any) {
        toast.error(err.message || "Download failed");
     } finally {
        setDownloadingId(null);
     }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
           <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold tracking-widest text-accent uppercase">Welcome Back</span>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl">Student Dashboard</h1>
          </div>
          <div className="flex gap-4">
             <div className="rounded-2xl bg-card border border-border p-4 text-center min-w-[120px]">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Enrolled</p>
                <p className="text-2xl font-display mt-1">{courses.length}</p>
             </div>
             <div className="rounded-2xl bg-card border border-border p-4 text-center min-w-[120px]">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Completed</p>
                <p className="text-2xl font-display mt-1 text-green-500">{courses.filter(c => c.is_completed).length}</p>
             </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold">My Learning</h2>
          
          {courses.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-border py-20 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
              <p className="mt-4 text-lg text-muted-foreground">You haven't enrolled in any courses yet.</p>
              <Link 
                to="/courses" 
                className="mt-6 inline-block rounded-full bg-foreground px-8 py-3 text-sm font-bold text-background"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to="/learn/$courseId"
                  params={{ courseId: String(course.id) }}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:shadow-xl hover:border-accent/30"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded">
                          {course.category}
                       </span>
                       {course.is_completed && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase">
                             <CheckCircle className="h-3 w-3" /> Mastered
                          </span>
                       )}
                    </div>
                    
                    <h3 className="font-display text-xl leading-tight group-hover:text-accent transition-colors">
                      {course.title}
                    </h3>
                    
                    <div className="mt-6">
                      <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{course.progress_percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div 
                          className={`h-full transition-all duration-1000 ${course.is_completed ? 'bg-green-500' : 'bg-accent'}`}
                          style={{ width: `${course.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                       {course.is_completed ? (
                          <button 
                            onClick={(e) => handleDownload(e, course.id)}
                            className="flex items-center gap-2 text-xs font-bold text-foreground hover:text-accent transition-colors"
                          >
                             <Award className={`h-4 w-4 ${downloadingId === course.id ? 'animate-bounce' : ''}`} /> 
                             {downloadingId === course.id ? "Generating..." : "Download Certificate"}
                          </button>
                       ) : (
                          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                            <span className="flex items-center gap-1">
                               <PlayCircle className="h-3.5 w-3.5" /> {course.completed_count}/{course.total_lessons}
                            </span>
                          </div>
                       )}
                       
                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-accent group-hover:text-white">
                          <ArrowRight className="h-4 w-4" />
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
