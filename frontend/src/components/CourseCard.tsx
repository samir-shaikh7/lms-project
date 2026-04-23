import { Link, useNavigate } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { Course } from "@/data/courses";
import { useAuth } from "./AuthProvider";
import { createOrder, verifyPayment, buyCourse } from "@/services/api";
import { useState } from "react";
import { toast } from "sonner";

export function CourseCard({ course }: { course: any }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Convert ID to string to ensure TanStack Router matches the param correctly
  const courseId = String(course.id);

  async function handleBuy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation(); // Prevent card click
    
    if (!isAuthenticated) {
      toast.error("Please login to purchase");
      navigate({ to: "/login" });
      return;
    }

    setLoading(true);
    try {
      const res = await buyCourse(course.id);
      if (res.test_mode) {
        toast.success("Enrolled successfully (Test Mode)!");
        navigate({ to: "/dashboard" });
        return;
      }

      const orderData = await createOrder(course.id);
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Lumière Academy",
        description: `Purchase: ${course.title}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              course_id: course.id
            });
            toast.success("Payment successful!");
            navigate({ to: "/dashboard" });
          } catch (err: any) {
            toast.error(err.message || "Verification failed");
          }
        },
        theme: { color: "#000000" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Link
      to="/courses/$courseId"
      params={{ courseId }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-[var(--shadow-soft)]"
    >
      <div className="block aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={course.image}
          alt={course.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-accent uppercase">
            {course.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {course.rating}
          </span>
        </div>
        <h3 className="font-display text-xl leading-tight">{course.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex flex-col">
            <span className="font-display text-2xl">
              <span className="font-sans text-xl mr-0.5">₹</span>{course.price}
            </span>
            {course.is_enrolled && (
              <span className="text-[10px] font-medium text-green-600">✓ Purchased</span>
            )}
          </div>
          <div className="flex gap-2">
            <div className="rounded-full border border-foreground px-4 py-2 text-xs font-medium transition-all group-hover:bg-foreground group-hover:text-background">
              Details
            </div>
            {!course.is_enrolled && (
              <button
                onClick={handleBuy}
                disabled={loading}
                className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "..." : "Buy Now"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
