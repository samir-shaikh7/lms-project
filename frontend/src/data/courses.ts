import bridal from "@/assets/bridal.jpg";
import party from "@/assets/party.jpg";
import self from "@/assets/self.jpg";

export type Lesson = { id: string; title: string; duration: string };
export type Course = {
  id: string;
  title: string;
  category: "Bridal" | "Party" | "Self Makeup";
  description: string;
  longDescription: string;
  price: number;
  image: string;
  instructor: string;
  rating: number;
  students: number;
  lessons: Lesson[];
  videoId: string; // YouTube video id placeholder
};

const lessons = (titles: string[]): Lesson[] =>
  titles.map((t, i) => ({ id: String(i + 1), title: t, duration: `${8 + i * 2} min` }));

export const courses: Course[] = [
  {
    id: "bridal-mastery",
    title: "Bridal Makeup Mastery",
    category: "Bridal",
    description: "Master timeless bridal looks from prep to finishing touches.",
    longDescription:
      "A comprehensive course covering skin prep, long-wear foundation, soft glam eyes, and the romantic finishing details every bride dreams of. Learn industry-tested techniques used on top wedding shoots.",
    price: 149,
    image: bridal,
    instructor: "Sofia Laurent",
    rating: 4.9,
    students: 2840,
    videoId: "dQw4w9WgXcQ",
    lessons: lessons([
      "Welcome & Kit Essentials",
      "Skin Prep for Long-Wear",
      "Flawless Base & Contour",
      "Romantic Eye Look",
      "Lashes & Liner Precision",
      "The Perfect Bridal Lip",
      "Setting & Touch-ups",
    ]),
  },
  {
    id: "party-glam",
    title: "Party Glam & Smokey Eyes",
    category: "Party",
    description: "Bold, camera-ready evening looks with shimmer and dimension.",
    longDescription:
      "From cut-creases to sultry smokey eyes, learn how to build dramatic, party-ready looks that photograph beautifully under any light.",
    price: 99,
    image: party,
    instructor: "Aria Khan",
    rating: 4.8,
    students: 1920,
    videoId: "dQw4w9WgXcQ",
    lessons: lessons([
      "Glam Foundations",
      "Eye Shape Mapping",
      "Classic Smokey Eye",
      "Glitter Application",
      "Glow Highlight & Blush",
      "Bold Lip Pairings",
    ]),
  },
  {
    id: "self-makeup",
    title: "Everyday Self Makeup",
    category: "Self Makeup",
    description: "Effortless 10-minute looks for the modern woman.",
    longDescription:
      "Build confidence applying your own makeup with quick, flattering routines for work, brunch, and date night — using minimal product.",
    price: 59,
    image: self,
    instructor: "Mia Chen",
    rating: 4.9,
    students: 5210,
    videoId: "dQw4w9WgXcQ",
    lessons: lessons([
      "Know Your Face",
      "Quick Skin Prep",
      "5-Minute Base",
      "Brows in 60 Seconds",
      "Soft Daytime Eye",
      "Lip & Cheek Combos",
    ]),
  },
  {
    id: "advanced-bridal",
    title: "Advanced Bridal Editorial",
    category: "Bridal",
    description: "Editorial bridal looks for high-fashion shoots.",
    longDescription:
      "Take your bridal artistry to editorial standards with sculpted contour, statement eyes, and luxe finishing techniques.",
    price: 179,
    image: bridal,
    instructor: "Sofia Laurent",
    rating: 4.7,
    students: 980,
    videoId: "dQw4w9WgXcQ",
    lessons: lessons([
      "Editorial Vision",
      "Sculpted Contour",
      "Statement Eyes",
      "Luxe Finishing",
    ]),
  },
  {
    id: "festival-glam",
    title: "Festival & Party Glow",
    category: "Party",
    description: "Glitter, gloss and unforgettable looks for any night out.",
    longDescription:
      "Build playful, glowing party looks using glitters, glosses, and dimensional highlight for nights you'll remember.",
    price: 79,
    image: party,
    instructor: "Aria Khan",
    rating: 4.8,
    students: 1430,
    videoId: "dQw4w9WgXcQ",
    lessons: lessons(["Color Theory", "Glitter Layering", "Glow Mapping", "Sealing the Look"]),
  },
  {
    id: "minimal-everyday",
    title: "Minimal Everyday Beauty",
    category: "Self Makeup",
    description: "Your no-makeup makeup capsule routine.",
    longDescription:
      "Master a refined, minimal routine with skincare-first products that let your natural features shine.",
    price: 49,
    image: self,
    instructor: "Mia Chen",
    rating: 4.9,
    students: 3150,
    videoId: "dQw4w9WgXcQ",
    lessons: lessons(["Skin First", "Tinted Base", "Cream Blush", "Glossy Lips"]),
  },
];
