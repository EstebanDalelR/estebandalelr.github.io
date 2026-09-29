'use client';

import { useMemo, useState } from 'react';

/* ───────────────────────── Types ───────────────────────── */

type Track = 'materials' | 'systems';
type Audience = 'all' | Track;
type View = 'both' | Track;
type ReqKind = 'passed' | 'participated';
type Progress = 'none' | 'participated' | 'passed';
type SlotId = 'S1P1' | 'S1P2' | 'S2P3' | 'S2P4' | 'S3P1' | 'S3P2' | 'S4';
type Status = 'passed' | 'participated' | 'ready' | 'blocked';

interface Req {
  code: string;
  kind: ReqKind;
}

interface Course {
  code: string;
  name: string;
  hp: number;
  slots: SlotId[];
  audience: Audience;
  fields: string[];
  reqs?: Req[];
  note?: string;
  asterisk?: boolean;
}

/* ───────────────────────── Data ───────────────────────── */
/* Source: TBT2M programme slides (Sep 2026). Verify against official syllabi. */

const SEMESTERS: { n: number; slots: { id: SlotId; label: string; when: string }[] }[] = [
  { n: 1, slots: [{ id: 'S1P1', label: 'Period 1', when: 'Sep–Oct' }, { id: 'S1P2', label: 'Period 2', when: 'Nov–Jan' }] },
  { n: 2, slots: [{ id: 'S2P3', label: 'Period 3', when: 'Jan–Mar' }, { id: 'S2P4', label: 'Period 4', when: 'Mar–Jun' }] },
  { n: 3, slots: [{ id: 'S3P1', label: 'Period 1', when: 'Sep–Oct' }, { id: 'S3P2', label: 'Period 2', when: 'Nov–Jan' }] },
  { n: 4, slots: [{ id: 'S4', label: 'Periods 3–4', when: 'Jan–Jun' }] },
];

const BT = 'Battery Technology A1F';
const P = (code: string): Req => ({ code, kind: 'passed' });
const T = (code: string): Req => ({ code, kind: 'participated' });
const THESIS = 'THESIS';

const COURSES: Course[] = [
  // Semester 1 — all students
  { code: '1KB744', name: 'Introduction to Energy Storage', hp: 5, slots: ['S1P1'], audience: 'all', fields: [] },
  { code: '1KB719', name: 'Electrochemistry for Batteries I', hp: 5, slots: ['S1P1'], audience: 'all', fields: [] },
  { code: '1KB230', name: 'Materials Chemistry', hp: 5, slots: ['S1P1'], audience: 'all', fields: [] },
  { code: '1KB732', name: 'Materials Analysis for Batteries', hp: 10, slots: ['S1P2', 'S2P3'], audience: 'all', fields: ['Chemistry A1N'], note: 'Runs over two periods, 5 hp each.' },
  { code: '1KB236', name: 'Polymer Technology', hp: 5, slots: ['S1P2'], audience: 'all', fields: [] },
  { code: '1EL003', name: 'Introduction to Electromobility', hp: 5, slots: ['S1P2'], audience: 'all', fields: [] },

  // Semester 2 — all students
  { code: '1KB728', name: 'Electrochemistry for Batteries II', hp: 5, slots: ['S2P3'], audience: 'all', fields: [BT, 'Chemistry A1F'], reqs: [T('1KB744'), T('1KB719'), T('1KB230')] },
  { code: '1KB738', name: 'Rechargeable Batteries', hp: 10, slots: ['S2P4'], audience: 'all', fields: [BT, 'Chemistry A1F', 'Materials Science A1F', 'Technology A1F'], reqs: [T('1KB728')] },

  // Semester 2 — battery materials
  { code: '1KB729', name: 'Synthesis of Battery Materials', hp: 5, slots: ['S2P3'], audience: 'materials', fields: [BT, 'Chemistry A1F'] },
  { code: '1KB566', name: 'Electronic and Atomistic Simulation Methods for Materials', hp: 5, slots: ['S2P4'], audience: 'materials', fields: ['Chemistry A1N', 'Materials Science A1N', 'Physics A1N', 'Technology A1N'] },

  // Semester 2 — cells & systems
  { code: '1DT115', name: 'Information Technology and Energy Storage', hp: 5, slots: ['S2P3'], audience: 'systems', fields: ['Computer Science A1N', 'Embedded Systems A1N', 'Technology A1N'] },
  { code: '1KB720', name: 'Cell and Systems Modelling', hp: 5, slots: ['S2P4'], audience: 'systems', fields: [BT, 'Chemistry A1F', 'Technology A1F'], reqs: [T('1KB728')] },

  // Semester 3 — all students
  { code: '1TS327', name: 'Industrial Project Management I', hp: 5, slots: ['S3P1'], audience: 'all', fields: ['Industrial Engineering and Management A1N', 'Technology A1N'] },
  { code: '1KB285', name: 'Sustainability, Chemistry and Materials Science', hp: 5, slots: ['S3P2'], audience: 'all', fields: ['Chemistry A1N', 'Materials Science A1N'] },

  // Semester 3 — battery materials
  { code: '1KB741', name: 'Future Perspective in Cell Chemistries', hp: 5, slots: ['S3P1'], audience: 'materials', fields: [BT, 'Chemistry A1F', 'Technology A1F'], reqs: [T('1KB738')] },
  { code: '1KB570', name: 'Design of Experiments, Data Handling and Statistical Analysis for Material Scientists', hp: 5, slots: ['S3P1'], audience: 'materials', fields: ['Chemistry A1N', 'Technology A1N'], reqs: [P('1KB744')] },
  { code: '1KB265', name: 'Advanced Materials Synthesis', hp: 5, slots: ['S3P2'], audience: 'materials', fields: ['Chemistry A1F', 'Materials Science A1F', 'Technology A1F'], reqs: [P('1KB230'), P('1KB732'), P('1KB729')] },
  { code: '1KB288', name: 'Materials Analysis at Large-Scale Research Infrastructures', hp: 5, slots: ['S3P2'], audience: 'materials', fields: ['Chemistry A1F', 'Materials Engineering A1F', 'Technology A1F'], reqs: [P('1KB230'), T('1KB732')] },

  // Semester 3 — cells & systems
  { code: '1KB714', name: 'Battery Control and Safety', hp: 5, slots: ['S3P1'], audience: 'systems', fields: [BT], reqs: [T('1KB738')] },
  { code: '1EL033', name: 'Electric Vehicles', hp: 5, slots: ['S3P1'], audience: 'systems', fields: ['Electrical Engineering A1F'], reqs: [T('1EL003')], asterisk: true, note: 'Only given if there are enough resources.' },
  { code: '1EL017', name: 'Battery Systems Engineering', hp: 5, slots: ['S3P2'], audience: 'systems', fields: [BT, 'Electrical Engineering A1F', 'Renewable Electricity Production A1F', 'Technology A1F'] },
  { code: '1EL206', name: 'Infrastructure for Electric Propulsion', hp: 5, slots: ['S3P2'], audience: 'systems', fields: ['Electrical Engineering A1F'], reqs: [P('1EL003')] },

  // Semester 4
  {
    code: THESIS,
    name: 'Master Degree Project',
    hp: 30,
    slots: ['S4'],
    audience: 'all',
    fields: [],
    reqs: [P('1KB744'), P('1KB738')],
    note: "Also requires: a Bachelor's degree, English 6, and 30 hp of Battery Technology at advanced level (A1F) participated, of which 20 hp passed.",
  },
];

const BY_CODE: Record<string, Course> = Object.fromEntries(COURSES.map((c) => [c.code, c]));
const TOTAL_HP = 120;
const TRACK_LABEL: Record<Track, string> = { materials: 'Battery materials', systems: 'Cells & systems' };
const NEXT: Record<Progress, Progress> = { none: 'participated', participated: 'passed', passed: 'none' };
const PROGRESS_LABEL: Record<Progress, string> = { none: 'Mark', participated: '◐ Taking', passed: '✓ Passed' };

/* ───────────────────────── Component ───────────────────────── */

export default function ProgrammeMap() {
  const [view, setView] = useState<View>('both');
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [selected, setSelected] = useState<string | null>(null);

  const prog = (code: string): Progress => progress[code] ?? 'none';

  const plan = useMemo(
    () => (view === 'both' ? [] : COURSES.filter((c) => c.audience === 'all' || c.audience === view)),
    [view],
  );

  const bt = useMemo(() => {
    const pool = view === 'both' ? COURSES : plan;
    const btCourses = pool.filter((c) => c.fields.includes(BT));
    return {
      inPlan: btCourses.reduce((s, c) => s + c.hp, 0),
      participated: btCourses.filter((c) => prog(c.code) !== 'none').reduce((s, c) => s + c.hp, 0),
      passed: btCourses.filter((c) => prog(c.code) === 'passed').reduce((s, c) => s + c.hp, 0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, progress, view]);

  const thesisCreditsOk = bt.participated >= 30 && bt.passed >= 20;

  const unmet = (c: Course): Req[] =>
    (c.reqs ?? []).filter((r) => (r.kind === 'passed' ? prog(r.code) !== 'passed' : prog(r.code) === 'none'));

  const status = (c: Course): Status => {
    const p = prog(c.code);
    if (p === 'passed') return 'passed';
    if (p === 'participated') return 'participated';
    if (unmet(c).length > 0) return 'blocked';
    if (c.code === THESIS && !thesisCreditsOk) return 'blocked';
    return 'ready';
  };

  const visible = (c: Course) => c.audience === 'all' || view === 'both' || c.audience === view;

  const sel = selected ? BY_CODE[selected] : null;
  const prereqCodes = new Set(sel?.reqs?.map((r) => r.code) ?? []);
  const dependents = sel ? COURSES.filter((c) => c.reqs?.some((r) => r.code === sel.code)) : [];
  const depCodes = new Set(dependents.map((c) => c.code));

  const hpPassed = plan.filter((c) => prog(c.code) === 'passed').reduce((s, c) => s + c.hp, 0);
  const graduated = plan.length > 0 && plan.every((c) => prog(c.code) === 'passed');

  const cycle = (code: string) => setProgress((p) => ({ ...p, [code]: NEXT[p[code] ?? 'none'] }));

  const renderCard = (c: Course, slot: SlotId) => {
    const s = status(c);
    const part = c.slots.length > 1 ? ` · part ${c.slots.indexOf(slot) + 1} of ${c.slots.length}` : '';
    const hl = c.code === selected ? 'is-selected' : prereqCodes.has(c.code) ? 'is-prereq' : depCodes.has(c.code) ? 'is-dependent' : '';
    return (
      <article key={`${c.code}-${slot}`} className={`card st-${s} ${hl}`}>
        <button className="card-main" onClick={() => setSelected(c.code === selected ? null : c.code)}>
          <span className="card-top">
            <span className="code">{c.code === THESIS ? 'Thesis' : c.code}</span>
            <span className="hp">
              {c.slots.length > 1 ? c.hp / c.slots.length : c.hp} hp{part}
            </span>
          </span>
          <span className="name">
            {c.name}
            {c.asterisk && <sup className="ast">*</sup>}
          </span>
          {c.reqs && c.reqs.length > 0 && (
            <span className="reqs">
              {c.reqs.map((r) => (
                <span key={r.code} className={`req req-${r.kind} ${prog(r.code) !== 'none' ? 'req-met-' + prog(r.code) : ''}`}>
                  {r.code}
                </span>
              ))}
            </span>
          )}
        </button>
        <button className={`mark mark-${prog(c.code)}`} onClick={() => cycle(c.code)} aria-label={`Progress for ${c.name}`}>
          {PROGRESS_LABEL[prog(c.code)]}
        </button>
      </article>
    );
  };

  const renderGroup = (slot: SlotId, audience: Audience) => {
    const items = COURSES.filter((c) => c.slots.includes(slot) && c.audience === audience && visible(c));
    if (items.length === 0) return null;
    return (
      <div key={audience} className={`group grp-${audience}`}>
        <div className="group-label">{audience === 'all' ? 'All students' : TRACK_LABEL[audience]}</div>
        {items.map((c) => renderCard(c, slot))}
      </div>
    );
  };

  return (
    <div className="tbt">
      {/* Raw HTML so the server doesn't escape the quotes and break hydration. */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="hero">
        <p className="eyebrow">Uppsala · TBT2M</p>
        <h1>Battery Technology &amp; Energy Storage</h1>
        <p className="sub">Pick a track, tap a course to see what it needs and what it unlocks, and mark your progress.</p>

        <div className="switch" role="tablist" aria-label="Track">
          {(['both', 'systems', 'materials'] as View[]).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} className={`sw sw-${v} ${view === v ? 'on' : ''}`} onClick={() => setView(v)}>
              {v === 'both' ? 'Compare both' : TRACK_LABEL[v]}
            </button>
          ))}
        </div>

        <div className="stats">
          {view !== 'both' && (
            <div className="stat">
              <span className="stat-n">
                {hpPassed}/{TOTAL_HP}
              </span>
              <span className="stat-l">hp passed</span>
            </div>
          )}
          <div className="stat">
            <span className="stat-n">
              {bt.participated}/{bt.passed}
            </span>
            <span className="stat-l">Battery Tech A1F taking/passed (thesis: 30/20)</span>
          </div>
          {view !== 'both' && (
            <div className={`stat ${bt.inPlan < 30 ? 'warn' : ''}`}>
              <span className="stat-n">{bt.inPlan}</span>
              <span className="stat-l">
                Battery Tech A1F hp in this track{bt.inPlan < 30 ? ' — check whether S1 courses count' : ''}
              </span>
            </div>
          )}
        </div>

        <ul className="legend">
          <li><span className="req req-passed">code</span> must be passed</li>
          <li><span className="req req-participated">code</span> must be participated in</li>
          <li><span className="dot dot-systems" /> Cells &amp; systems</li>
          <li><span className="dot dot-materials" /> Battery materials</li>
          <li><sup className="ast">*</sup> Only given if there are enough resources</li>
        </ul>
      </header>

      <main>
        {SEMESTERS.map((sem) => (
          <section key={sem.n} className="semester">
            <h2>Semester {sem.n}</h2>
            <div className={`periods n-${sem.slots.length}`}>
              {sem.slots.map((slot) => (
                <div key={slot.id} className="period">
                  <h3>
                    {slot.label} <span className="when">{slot.when}</span>
                  </h3>
                  {(['all', 'systems', 'materials'] as Audience[]).map((a) => renderGroup(slot.id, a))}
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className={`grad ${graduated ? 'done' : ''}`}>
          <div className="cap" aria-hidden>🎓</div>
          <h2>{graduated ? '¡Toga y birrete!' : 'Graduation'}</h2>
          <p>
            {view === 'both'
              ? 'Pick a track to see your path to 120 hp.'
              : graduated
                ? `120 hp, ${TRACK_LABEL[view]}. Master of Science in Battery Technology and Energy Storage.`
                : `${TOTAL_HP - hpPassed} hp to go on the ${TRACK_LABEL[view]} track.`}
          </p>
        </section>

        <p className="foot">
          Built from the programme slides (Sep 2026). Requirements can change, so always confirm in the official syllabus and with the study advisor.
        </p>
      </main>

      {sel && (
        <aside className="sheet" role="dialog" aria-label={sel.name}>
          <button className="close" onClick={() => setSelected(null)} aria-label="Close">×</button>
          <p className="eyebrow">
            {sel.code === THESIS ? 'Semester 4' : sel.code} · {sel.hp} hp ·{' '}
            {sel.audience === 'all' ? 'All students' : TRACK_LABEL[sel.audience]}
          </p>
          <h3>
            {sel.name}
            {sel.asterisk && <sup className="ast">*</sup>}
          </h3>
          <p className={`badge st-${status(sel)}`}>
            {{ passed: 'Passed', participated: 'Taking', ready: 'Eligible', blocked: 'Requirements missing' }[status(sel)]}
          </p>
          {sel.note && <p className="note">{sel.note}</p>}
          {sel.fields.length > 0 ? (
            <p className="fields">{sel.fields.join(' · ')}</p>
          ) : (
            sel.code !== THESIS && <p className="fields muted">Main field not listed on the slides.</p>
          )}

          <div className="cols">
            <div>
              <h4>Needs</h4>
              {sel.reqs?.length ? (
                <ul>
                  {sel.reqs.map((r) => {
                    const met = r.kind === 'passed' ? prog(r.code) === 'passed' : prog(r.code) !== 'none';
                    return (
                      <li key={r.code} className={met ? 'met' : ''}>
                        <button className="link" onClick={() => setSelected(r.code)}>{BY_CODE[r.code]?.name ?? r.code}</button>
                        <span className={`req req-${r.kind}`}>{r.kind}</span>
                      </li>
                    );
                  })}
                  {sel.code === THESIS && (
                    <li className={thesisCreditsOk ? 'met' : ''}>
                      Battery Tech A1F: {bt.participated}/30 taking, {bt.passed}/20 passed
                    </li>
                  )}
                </ul>
              ) : (
                <p className="muted">Nothing within the programme.</p>
              )}
            </div>
            <div>
              <h4>Unlocks</h4>
              {dependents.length ? (
                <ul>
                  {dependents.map((d) => (
                    <li key={d.code}>
                      <button className="link" onClick={() => setSelected(d.code)}>{d.name}</button>
                      {d.audience !== 'all' && <span className={`dot dot-${d.audience}`} />}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">{sel.code === THESIS ? 'Your degree 🎓' : 'No courses depend on this one.'}</p>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

/* ───────────────────────── Styles ───────────────────────── */

const CSS = `
.tbt {
  --bg: #f6f5f1; --surface: #ffffff; --ink: #1c1d1f; --muted: #6b6d70; --line: #e3e1da;
  --systems: #c8432f; --systems-soft: #fbece8; --materials: #2f8a4e; --materials-soft: #e8f4ec;
  --passed: #3b5bdb; --part: #d98a1c; --ok: #2f8a4e; --shadow: 0 1px 2px rgb(0 0 0 / .06);
  background: var(--bg); color: var(--ink); min-height: 100vh; padding: 32px 16px 160px;
  font: 15px/1.45 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}
@media (prefers-color-scheme: dark) {
  .tbt { --bg: #141517; --surface: #1d1f22; --ink: #ececec; --muted: #9a9ca0; --line: #2d3034;
    --systems-soft: #2f1c18; --materials-soft: #17281d; --passed: #7c93f5; --shadow: none; }
}
.tbt * { box-sizing: border-box; }
.tbt button { font: inherit; color: inherit; cursor: pointer; background: none; border: 0; padding: 0; }
.tbt main, .tbt .hero { max-width: 1100px; margin: 0 auto; }
.tbt .eyebrow { text-transform: uppercase; letter-spacing: .08em; font-size: 12px; color: var(--muted); margin: 0 0 4px; }
.tbt h1 { font-size: clamp(26px, 4vw, 38px); line-height: 1.1; margin: 0 0 8px; letter-spacing: -.02em; }
.tbt .sub { color: var(--muted); margin: 0 0 20px; max-width: 60ch; }

.tbt .switch { display: inline-flex; flex-wrap: wrap; gap: 4px; background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 4px; }
.tbt .sw { padding: 8px 16px; border-radius: 999px; font-weight: 600; font-size: 14px; color: var(--muted); }
.tbt .sw.on { color: #fff; background: var(--ink); }
.tbt .sw-systems.on { background: var(--systems); }
.tbt .sw-materials.on { background: var(--materials); }

.tbt .stats { display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0 16px; }
.tbt .stat { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 10px 14px; display: flex; flex-direction: column; min-width: 140px; box-shadow: var(--shadow); }
.tbt .stat.warn { border-color: var(--part); }
.tbt .stat-n { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
.tbt .stat-l { font-size: 12px; color: var(--muted); max-width: 26ch; }

.tbt .legend { list-style: none; padding: 0; margin: 0 0 12px; display: flex; flex-wrap: wrap; gap: 8px 18px; font-size: 13px; color: var(--muted); }
.tbt .legend li { display: flex; align-items: center; gap: 6px; }
.tbt .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.tbt .dot-systems { background: var(--systems); }
.tbt .dot-materials { background: var(--materials); }
.tbt .ast { color: var(--systems); font-weight: 700; margin-left: 2px; }

.tbt .semester { margin-top: 36px; }
.tbt .semester h2 { font-size: 20px; margin: 0 0 12px; border-bottom: 1px solid var(--line); padding-bottom: 8px; }
.tbt .periods { display: grid; gap: 20px; grid-template-columns: 1fr; }
@media (min-width: 760px) { .tbt .periods.n-2 { grid-template-columns: 1fr 1fr; } }
.tbt .period h3 { font-size: 14px; margin: 0 0 10px; }
.tbt .when { color: var(--muted); font-weight: 400; margin-left: 6px; }

.tbt .group { border-radius: 14px; padding: 10px; margin-bottom: 12px; display: grid; gap: 8px; }
.tbt .grp-systems { background: var(--systems-soft); border: 1.5px solid var(--systems); }
.tbt .grp-materials { background: var(--materials-soft); border: 1.5px solid var(--materials); }
.tbt .group-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); padding: 0 4px; }
.tbt .grp-systems .group-label { color: var(--systems); }
.tbt .grp-materials .group-label { color: var(--materials); }

.tbt .card { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; display: flex; align-items: stretch; box-shadow: var(--shadow); transition: transform .12s, box-shadow .12s, opacity .12s; }
.tbt .card-main { flex: 1; text-align: left; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.tbt .card-top { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; color: var(--muted); }
.tbt .code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 600; }
.tbt .name { font-weight: 600; }
.tbt .reqs { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
.tbt .mark { border-left: 1px solid var(--line); padding: 0 12px; font-size: 12px; font-weight: 600; color: var(--muted); white-space: nowrap; min-width: 84px; }
.tbt .mark-participated { color: var(--part); }
.tbt .mark-passed { color: var(--passed); }

.tbt .st-passed { border-color: var(--passed); }
.tbt .st-blocked .name { color: var(--muted); }
.tbt .is-selected { outline: 2px solid var(--ink); outline-offset: 1px; transform: translateY(-1px); }
.tbt .is-prereq { outline: 2px dashed var(--part); outline-offset: 1px; }
.tbt .is-dependent { outline: 2px dashed var(--passed); outline-offset: 1px; }

.tbt .req { font: 600 11px ui-monospace, SFMono-Regular, Menlo, monospace; padding: 1px 6px; border-radius: 4px; border: 1px solid; }
.tbt .req-passed { color: var(--passed); border-color: var(--passed); }
.tbt .req-participated { color: var(--part); border-color: var(--part); border-style: dashed; }
.tbt .req-met-passed, .tbt .req-participated.req-met-participated { background: currentColor; }
.tbt .req-met-passed, .tbt .req-participated.req-met-participated { color: #fff; }
.tbt .req-passed.req-met-passed { background: var(--passed); border-color: var(--passed); }
.tbt .req-participated.req-met-passed, .tbt .req-participated.req-met-participated { background: var(--part); border-color: var(--part); }

.tbt .grad { margin-top: 48px; text-align: center; background: var(--surface); border: 1px solid var(--line); border-radius: 20px; padding: 36px 16px; box-shadow: var(--shadow); }
.tbt .grad h2 { margin: 8px 0 6px; font-size: 26px; }
.tbt .grad p { color: var(--muted); margin: 0; }
.tbt .cap { font-size: 64px; line-height: 1; display: inline-block; filter: grayscale(.6); transition: filter .3s; }
.tbt .grad.done { border-color: var(--passed); }
.tbt .grad.done .cap { filter: none; animation: toss 1.4s ease-in-out infinite; }
@keyframes toss { 0%,100% { transform: translateY(0) rotate(0) } 40% { transform: translateY(-28px) rotate(-12deg) } 60% { transform: translateY(-28px) rotate(10deg) } }
@media (prefers-reduced-motion: reduce) { .tbt .grad.done .cap { animation: none; } }
.tbt .foot { color: var(--muted); font-size: 12px; text-align: center; margin-top: 24px; }

.tbt .sheet { position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); width: min(720px, calc(100% - 32px)); max-height: 55vh; overflow: auto;
  background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 18px 20px; box-shadow: 0 12px 40px rgb(0 0 0 / .25); z-index: 50; }
.tbt .sheet h3 { margin: 0 32px 8px 0; font-size: 19px; }
.tbt .close { position: absolute; top: 10px; right: 14px; font-size: 24px; color: var(--muted); }
.tbt .badge { display: inline-block; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 999px; margin: 0 0 8px; border: 1px solid var(--line); }
.tbt .badge.st-ready { color: var(--ok); border-color: var(--ok); }
.tbt .badge.st-blocked { color: var(--systems); border-color: var(--systems); }
.tbt .badge.st-passed { color: var(--passed); border-color: var(--passed); }
.tbt .badge.st-participated { color: var(--part); border-color: var(--part); }
.tbt .note { margin: 0 0 8px; }
.tbt .fields { font-size: 13px; color: var(--muted); margin: 0 0 12px; }
.tbt .muted { color: var(--muted); }
.tbt .cols { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 560px) { .tbt .cols { grid-template-columns: 1fr 1fr; } }
.tbt h4 { margin: 0 0 6px; font-size: 13px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
.tbt .sheet ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
.tbt .sheet li { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tbt .sheet li.met::before { content: '✓'; color: var(--ok); font-weight: 700; }
.tbt .link { text-decoration: underline; text-underline-offset: 2px; text-align: left; }
`;
