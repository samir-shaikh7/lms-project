import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { getCourse, createOrder, verifyPayment, buyCourse } from "@/services/api";
import { Star, Clock, PlayCircle, Lock, ChevronRight, CheckCircle, Users, Award, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Route = createFileRoute("/courses/$courseId")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = useParams({ from: "/courses/$courseId" });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      try {
        const data = await getCourse(courseId);
        setCourse(data);
      } catch (error) {
        console.error("Failed to fetch course:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground font-medium">Loading premium content...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-display text-4xl">Course not found</h1>
          <Link to="/courses" className="mt-6 inline-block rounded-full border border-foreground px-6 py-2 text-sm">
            Back to Catalog
          </Link>
        </div>
      </Layout>
    );
  }

  const isEnrolled = course.is_enrolled || course.locked === false;

  async function handleBuy() {
    if (!isAuthenticated) {
      toast.error("Please login to purchase");
      navigate({ to: "/login" });
      return;
    }

    setPurchaseLoading(true);
    try {
      const res = await buyCourse(course.id);
      if (res.test_mode) {
        toast.success("Access Granted! (Test Mode)");
        window.location.reload();
        return;
      }

      const orderData = await createOrder(course.id);
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Lumière Academy",
        description: `Unlock: ${course.title}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              course_id: course.id
            });
            toast.success("Welcome aboard! Course unlocked.");
            window.location.reload();
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed");
          }
        },
        theme: { color: "#000000" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate purchase");
    } finally {
      setPurchaseLoading(false);
    }
  }

  return (
    <Layout>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-black py-20 text-white lg:py-32">
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
             src={course.image} 
             alt="" 
             className="h-full w-full object-cover blur-sm scale-105"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                 <span className="inline-block rounded-full bg-accent/20 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-accent uppercase backdrop-blur-md border border-accent/30">
                    {course.category}
                 </span>
                 <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-6xl">
                    {course.title}
                 </h1>
                 <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
                    {course.description}
                 </p>
                 <div className="mt-8 flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                       <Star className="h-5 w-5 fill-accent text-accent" />
                       <span className="font-semibold">{course.rating} Rating</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                       <Users className="h-5 w-5" />
                       <span>{course.students || 1200}+ Students</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                       <Clock className="h-5 w-5" />
                       <span>Self-paced</span>
                    </div>
                 </div>
                 
                 <div className="mt-10 flex flex-wrap gap-4">
                    {isEnrolled ? (
                       <Link 
                         to="/learn/$courseId"
                         params={{ courseId: String(course.id) }}
                         className="flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,107,0,0.3)]"
                       >
                          Go to Classroom <ChevronRight className="h-4 w-4" />
                       </Link>
                    ) : (
                       <button 
                         onClick={handleBuy}
                         disabled={purchaseLoading}
                         className="rounded-full bg-accent px-10 py-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,107,0,0.3)] disabled:opacity-50"
                       >
                          {purchaseLoading ? "Processing..." : (
                            <span className="flex items-center gap-1">
                              Enroll Now for <span className="font-sans">₹</span>{course.price}
                            </span>
                          )}
                       </button>
                    )}
                    <button className="rounded-full border border-white/30 bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20">
                       Watch Trailer
                    </button>
                 </div>
              </div>

              <div className="hidden lg:block">
                 <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/20 bg-gray-900 shadow-2xl">
                    <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                       <div className="rounded-full bg-white/20 p-4 backdrop-blur-md border border-white/30">
                          <PlayCircle className="h-12 w-12 text-white" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
         <div className="grid gap-16 lg:grid-cols-3">
            <div className="lg:col-span-2">
               <div className="space-y-12">
                  <section>
                     <h2 className="font-display text-3xl font-bold">What you'll learn</h2>
                     <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                        {course.longDescription || course.description}
                     </p>
                     <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        {['Professional Techniques', 'Skin Preparation', 'Product Knowledge', 'Color Theory'].map(item => (
                           <div key={item} className="flex items-center gap-3 rounded-xl border border-border p-4 bg-card">
                              <CheckCircle className="h-5 w-5 text-accent" />
                              <span className="font-medium text-sm">{item}</span>
                           </div>
                        ))}
                     </div>
                  </section>

                  <section>
                     <div className="flex items-end justify-between border-b border-border pb-4">
                        <h2 className="font-display text-3xl font-bold">Curriculum</h2>
                        <span className="text-sm font-medium text-muted-foreground">{course.lessons?.length || 0} Lessons</span>
                     </div>
                     <div className="mt-6 space-y-3">
                        {course.lessons?.map((lesson: any, i: number) => (
                           <div key={lesson.id} className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-accent/50">
                              <div className="flex items-center gap-4">
                                 <span className="font-mono text-xs font-bold text-muted-foreground">{String(i+1).padStart(2, '0')}</span>
                                 <div className="flex items-center gap-3">
                                    {!isEnrolled ? <Lock className="h-4 w-4 text-muted-foreground" /> : <PlayCircle className="h-4 w-4 text-accent" />}
                                    <span className={`font-semibold ${!isEnrolled ? 'text-muted-foreground' : ''}`}>{lesson.title}</span>
                                 </div>
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">{lesson.duration || "12:40"}</span>
                           </div>
                        ))}
                     </div>
                  </section>
               </div>
            </div>

            <aside className="lg:col-span-1">
               <div className="sticky top-24 space-y-6">
                  <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
                     <h3 className="font-display text-xl font-bold">Course Includes</h3>
                     <ul className="mt-6 space-y-4">
                        <li className="flex items-center gap-3 text-sm text-muted-foreground">
                           <PlayCircle className="h-5 w-5 text-accent" />
                           <span>{course.lessons?.length || 0} on-demand video lessons</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-muted-foreground">
                           <Award className="h-5 w-5 text-accent" />
                           <span>Certificate of completion</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-muted-foreground">
                           <ShieldCheck className="h-5 w-5 text-accent" />
                           <span>Full lifetime access</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-muted-foreground">
                           <Users className="h-5 w-5 text-accent" />
                           <span>Community support access</span>
                        </li>
                     </ul>
                     
                     <div className="mt-8 pt-8 border-t border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center">Trusted by 10,000+ artists</p>
                     </div>
                  </div>
               </div>
            </aside>
         </div>
      </section>
    </Layout>
  );
}
