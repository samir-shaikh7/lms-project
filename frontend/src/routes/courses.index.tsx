import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { CourseCard } from "@/components/CourseCard";
import { getCourses } from "@/services/api";

const filters = ["All", "Bridal", "Party", "Self Makeup"] as const;
type Filter = (typeof filters)[number];

export const Route = createFileRoute("/courses/")({
  component: CoursesPage,
});

function CoursesPage() {
  const [active, setActive] = useState<Filter>("All");
  const [courses, setCourses] = useState<any[]>([]); // 👈 IMPORTANT

  // 🔥 API call
  useEffect(() => {
    getCourses().then((data) => {
      setCourses(data);
    });
  }, []);

  const visible =
    active === "All"
      ? courses
      : courses.filter((c) => c.category === active);

  return (
    <Layout>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
            Courses
          </span>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">
            Master the art of makeup
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Curated lessons from world-class artists. Learn at your own pace,
            from any device.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`rounded-full border px-5 py-2 text-sm font-medium ${active === f
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </Layout>
  );
}