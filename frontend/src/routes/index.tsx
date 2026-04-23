import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/HeroSection";
import { CourseCard } from "@/components/CourseCard";
import { getCourses } from "@/services/api";
import { useState, useEffect } from "react";
import bridal from "@/assets/bridal.jpg";
import party from "@/assets/party.jpg";
import self from "@/assets/self.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IBT Beauty Academy — Become a Professional Makeup Artist" },
      {
        name: "description",
        content:
          "Premium online makeup courses — bridal, party, and everyday self makeup. Learn from world-class beauty artists at IBT Beauty Academy.",
      },
    ],
  }),
  component: HomePage,
});

const categories = [
  { name: "Bridal", image: bridal, blurb: "Timeless bridal artistry" },
  { name: "Party", image: party, blurb: "Bold, camera-ready glam" },
  { name: "Self Makeup", image: self, blurb: "Effortless everyday looks" },
] as const;

const testimonials = [
  {
    name: "Olivia R.",
    text: "IBT transformed my career. The bridal mastery course paid for itself within a month.",
    role: "Freelance MUA",
  },
  {
    name: "Priya S.",
    text: "Beautifully produced lessons. I finally feel confident doing my own makeup every morning.",
    role: "Student",
  },
  {
    name: "Camille D.",
    text: "The instructors are world-class. I've taken courses elsewhere — nothing compares.",
    role: "Bridal Artist",
  },
];

function HomePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getCourses();
        setCourses(data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <Layout>
      <HeroSection />

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
            Categories
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">Find your craft</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.name}
              to="/courses"
              search={{ category: c.name }}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-display text-2xl">{c.name}</h3>
                <p className="mt-1 text-sm text-white/80">{c.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
                Featured
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">Most loved courses</h2>
            </div>
            <Link to="/courses" className="text-sm font-medium underline-offset-4 hover:underline">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-gray-200" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground font-medium">No courses available at the moment.</p>
              <Link to="/courses" className="mt-4 inline-block text-accent font-bold">Browse Catalog</Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
            Testimonials
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">Loved by artists worldwide</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-soft)]"
            >
              <div className="text-accent">★★★★★</div>
              <blockquote className="mt-4 text-base leading-relaxed text-foreground">
                "{t.text}"
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <p className="font-semibold">{t.name}</p>
                <p className="text-muted-foreground">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-foreground px-8 py-16 text-center text-background sm:px-16">
          <h2 className="font-display text-3xl sm:text-5xl">
            Begin your <span className="italic text-accent">beauty journey</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-background/70">
            Join thousands of students learning from the best in the industry. Start today, glow tomorrow.
          </p>
          <Link
            to="/courses"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold text-foreground transition-all hover:opacity-90"
          >
            Browse All Courses
          </Link>
        </div>
      </section>
    </Layout>
  );
}
