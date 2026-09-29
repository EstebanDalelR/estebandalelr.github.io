import Link from "next/link";
import Avatar from "@batteries/components/narrator/Avatar";
import { COURSES } from "@batteries/lib/courses";

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
    </main>
  );
}
