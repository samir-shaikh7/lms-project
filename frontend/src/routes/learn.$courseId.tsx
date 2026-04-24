import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { getCourse, completeLesson, downloadCertificate } from "@/services/api";
import { PlayCircle, Lock, ChevronLeft, ChevronRight, Menu, CheckCircle, Award, Download } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

// Helper to convert YouTube URL to Embed URL
function getEmbedUrl(url: string) {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  const watchMatch = url.match(/v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1`;
  const shortMatch = url.match(/youtu.be\/([^?]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1`;
  return url;
}

export const Route = createFileRoute("/learn/$courseId")({
  loader: async ({ params }) => {
    const course = await getCourse(params.courseId);
    if (!course) throw notFound();
    return course;
  },
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground font-medium">Loading classroom...</p>
      </div>
    </div>
  ),
  component: LearningPage,
});

function LearningPage() {
  const initialCourse: any = Route.useLoaderData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(initialCourse);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [completing, setCompleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Handle window resize to close/open sidebar automatically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if course is locked
  const isLocked = course.locked !== false;

  // Initialize lesson (Resume logic: find first incomplete lesson)
  useEffect(() => {
    if (course.lessons && course.lessons.length > 0 && !activeLesson) {
      const firstIncomplete = course.lessons.find((l: any) => !l.completed);
      setActiveLesson(firstIncomplete || course.lessons[0]);
    }
  }, [course]);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  async function handleComplete() {
    if (!activeLesson || isLocked || completing) return;
    
    setCompleting(true);
    try {
      await completeLesson(activeLesson.id);
      toast.success("Lesson completed!");
      
      const updatedCourse = await getCourse(String(course.id));
      if (updatedCourse) {
        setCourse(updatedCourse);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to mark as complete");
    } finally {
      setCompleting(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadCertificate(course.id);
      toast.success("Certificate downloaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to download certificate");
    } finally {
      setDownloading(false);
    }
  }

  if (!isAuthenticated) return null;

  // Calculate overall progress
  const completedCount = course.lessons.filter((l: any) => l.completed).length;
  const totalLessons = course.lessons.length;
  const isAllCompleted = completedCount === totalLessons && totalLessons > 0;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* HEADER */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <Link 
            to="/dashboard"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <h1 className="truncate font-display text-sm font-bold md:text-xl">
            {course.title}
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
           {isAllCompleted ? (
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-1 md:gap-2 rounded-full bg-accent px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold text-white shadow-lg"
              >
                <Award className="h-3 md:h-3.5 w-3 md:w-3.5" /> 
                <span>{downloading ? "..." : "CERTIFICATE"}</span>
              </button>
           ) : (
              <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-black text-accent tracking-tighter">
                {progressPercent}% COMPLETE
              </span>
           )}
           <button 
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="rounded-lg p-2 hover:bg-muted md:hidden"
           >
             <Menu className="h-5 w-5" />
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* BACKDROP FOR MOBILE */}
        {sidebarOpen && (
           <div 
             className="fixed inset-0 z-10 bg-black/50 md:hidden" 
             onClick={() => setSidebarOpen(false)}
           />
        )}

        {/* SIDEBAR */}
        <aside 
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } absolute inset-y-0 left-0 z-20 w-72 border-r border-border bg-card transition-transform duration-300 md:relative md:translate-x-0`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Course Content</span>
                <span>{completedCount}/{totalLessons}</span>
              </div>
              <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {course.lessons.map((lesson: any, index: number) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`flex w-full items-center gap-3 rounded-xl p-4 text-left transition-all ${
                    activeLesson?.id === lesson.id
                      ? "bg-foreground text-background shadow-lg scale-[1.02]"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {lesson.completed ? (
                      <CheckCircle className={`h-5 w-5 ${activeLesson?.id === lesson.id ? 'text-accent' : 'text-green-500'}`} />
                    ) : (
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                        activeLesson?.id === lesson.id ? "border-background/30" : "border-border text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{lesson.title}</p>
                    <p className={`text-[10px] font-medium uppercase tracking-tight ${activeLesson?.id === lesson.id ? 'text-background/70' : 'text-muted-foreground'}`}>
                       {lesson.duration || "12:00"}
                    </p>
                  </div>
                  {isLocked && <Lock className="h-3.5 w-3.5 opacity-50" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN PLAYER AREA */}
        <main className="flex-1 overflow-y-auto bg-black/5 p-4 md:p-8">
          <div className="mx-auto max-w-5xl">
            {isAllCompleted && (
               <div className="mb-8 rounded-3xl bg-accent/10 border border-accent/20 p-6 text-center">
                  <Award className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-display font-bold">Congratulations! You've mastered this course.</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your official certificate is now available for download.</p>
                  <button 
                    onClick={handleDownload}
                    disabled={downloading}
                    className="mt-6 flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-sm font-bold text-white mx-auto hover:scale-105 transition-all shadow-lg shadow-accent/20"
                  >
                    <Download className="h-4 w-4" /> {downloading ? "Downloading..." : "Download Your Certificate"}
                  </button>
               </div>
            )}

            <div className="relative aspect-video overflow-hidden rounded-3xl bg-black shadow-2xl">
              {isLocked ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-black/95 text-white text-center px-6">
                  <Lock className="h-12 w-12 text-accent mb-4" />
                  <h3 className="text-2xl font-display font-bold">Course Locked</h3>
                  <p className="mt-2 text-gray-400">Please enroll to watch this lesson.</p>
                  <Link to="/courses/$courseId" params={{ courseId: String(course.id) }} className="mt-6 rounded-full bg-accent px-8 py-3 text-sm font-bold">Unlock Now</Link>
                </div>
              ) : activeLesson ? (
                <iframe
                  title={activeLesson.title}
                  src={getEmbedUrl(activeLesson.video_url)}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : null}
            </div>

            {activeLesson && (
              <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div>
                    <h2 className="font-display text-3xl font-bold">{activeLesson.title}</h2>
                    <p className="mt-2 text-muted-foreground font-medium">Lesson {course.lessons.indexOf(activeLesson) + 1} of {course.lessons.length}</p>
                  </div>
                  {!isLocked && (
                    <button 
                      onClick={handleComplete}
                      disabled={completing || activeLesson.completed}
                      className={`flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold transition-all active:scale-95 ${
                        activeLesson.completed 
                        ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' 
                        : 'bg-accent text-white shadow-[0_0_20px_rgba(255,107,0,0.2)] hover:opacity-90'
                      }`}
                    >
                      {activeLesson.completed ? (
                        <>
                          <CheckCircle className="h-4 w-4" /> Completed
                        </>
                      ) : (
                        completing ? "Saving..." : "Mark as Complete"
                      )}
                    </button>
                  )}
                </div>
                <div className="mt-10 h-px bg-border" />
                <p className="mt-8 leading-relaxed text-muted-foreground text-lg italic">
                  {activeLesson.description || "Master the art and science behind this lesson. Follow along closely to perfect your skills."}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
