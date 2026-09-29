import Link from "next/link";
import Avatar from "@batteries/components/narrator/Avatar";
import { COURSES } from "@batteries/lib/courses";

const TOOLS = [
  {
    href: "/batteries/phase-diagrams",
    course: "Materials Chemistry",
    name: "Phase Diagram Explorer",
    blurb: "Drag across Cu–Ni, Pb–Sn and Fe–Fe₃C; tie lines and the lever rule update as you go.",
  },
  {
    href: "/batteries/interstitial-sites",
    course: "Materials Chemistry",
    name: "Interstitial Sites",
    blurb: "Octahedral and tetrahedral holes in FCC, BCC and HCP lattices, in 3D.",
  },
  {
    href: "/batteries/energy-storage-types",
    course: "Introduction to Energy Storage",
    name: "Energy Storage Types",
    blurb: "Compare storage technologies by energy density, power density, efficiency and duration.",
  },
  {
    href: "/batteries/kirchhoff",
    course: "Electric Circuits & the Grid",
    name: "Kirchhoff Lab",
    blurb: "Solve circuits by hand, then watch the current prove you right.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-16 sm:px-8">
      <div className="flex items-center gap-5">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-panel sm:h-24 sm:w-24">
          <Avatar mouth={0} speaking={false} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-accent">Battery Masters · exam explainers</p>
          <h1 className="mt-1 text-3xl font-bold text-ink sm:text-4xl">Batteries &amp; energy storage</h1>
        </div>
      </div>
      <p className="mt-6 max-w-2xl text-ink/70">
        Narrated, scroll-driven walkthroughs of the course material, mapped question by question to past exams.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {COURSES.map((c) => {
          const steps = c.narration.chapters.reduce((n, ch) => n + ch.steps.length, 0);
          return (
            <li key={c.id}>
              <Link
                href={c.route}
                className="block h-full rounded-2xl border border-white/10 bg-panel p-5 transition hover:border-accent/60 hover:bg-panel/70"
              >
                <p className="text-xs uppercase tracking-widest text-accent">{c.narration.course.split(",")[0]}</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">{c.label}</h2>
                <p className="mt-2 text-sm text-ink/70">{c.blurb}</p>
                <p className="mt-4 text-xs text-ink/50">
                  {c.narration.chapters.length} chapters · {steps} steps
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-14 text-sm uppercase tracking-widest text-accent">Interactive tools</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="block h-full rounded-2xl border border-white/10 bg-panel p-5 transition hover:border-accent/60 hover:bg-panel/70"
            >
              <p className="text-xs uppercase tracking-widest text-accent">{t.course}</p>
              <h3 className="mt-2 text-xl font-semibold text-ink">{t.name}</h3>
              <p className="mt-2 text-sm text-ink/70">{t.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
