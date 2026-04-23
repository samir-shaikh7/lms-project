import { Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
        <div className="flex flex-col justify-center">
          <span className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
            Lumière Academy
          </span>
          <h1 className="mt-5 font-display text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            Become a Professional<br />
            <span className="italic text-accent">Makeup Artist</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-muted-foreground sm:text-lg">
            Learn from world-class artists. From bridal mastery to everyday glow — start your beauty journey today.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background shadow-[var(--shadow-soft)] transition-all hover:opacity-90"
            >
              Explore Courses
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-foreground px-7 py-3 text-sm font-medium text-foreground transition-all hover:bg-foreground hover:text-background"
            >
              Start Free
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-8 text-sm">
            <div>
              <p className="font-display text-2xl">15k+</p>
              <p className="text-muted-foreground">Students</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="font-display text-2xl">50+</p>
              <p className="text-muted-foreground">Master Classes</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="font-display text-2xl">4.9★</p>
              <p className="text-muted-foreground">Rated</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-[var(--gradient-gold)] opacity-20 blur-2xl" />
          <img
            src={hero}
            alt="Luxury makeup products on pink silk"
            width={1536}
            height={1024}
            className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-[var(--shadow-soft)]"
          />
        </div>
      </div>
    </section>
  );
}
