"use client";

import { useState } from "react";
import { Arrow } from "./Arrow";
import { Button } from "./Button";
import { Placeholder } from "./Placeholder";

type View = "intro" | "step" | "done";

const PHASES = ["About you", "Where this leads", "Your plan"];

export function SelfAssessmentShell() {
  const [view, setView] = useState<View>("intro");
  const [step, setStep] = useState(0);

  const start = () => {
    setStep(0);
    setView("step");
  };
  const back = () => (step > 0 ? setStep(step - 1) : setView("intro"));
  const next = () => (step < 2 ? setStep(step + 1) : setView("done"));

  return (
    <main>
      <div className="shell" style={{ paddingTop: 64, paddingBottom: 120 }}>
        <div className="sa-shell">
          {view === "intro" && (
            <>
              <p className="eyebrow">Self-assessment</p>
              <h1 className="h1" style={{ marginTop: 14 }}>
                See where you <em>really stand.</em>
              </h1>
              <p className="body-large" style={{ marginTop: 24 }}>
                A short, no-pressure check-in. Answer a few honest questions and get a clear picture
                of where you are today, where you want to be, and the gap between the two.
              </p>

              <div style={{ marginTop: 40 }}>
                <Placeholder ratio="16x9" label="[ Report screenshot ]" />
              </div>

              <div
                className="bg-lighter-mint"
                style={{ borderRadius: 20, padding: "28px 30px", marginTop: 24 }}
              >
                <p
                  className="d1"
                  style={{ fontSize: 48, lineHeight: 1, color: "var(--color-emerald)" }}
                >
                  ~5 min
                </p>
                <p className="eyebrow" style={{ marginTop: 8 }}>
                  to complete
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    margin: "24px 0 0",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {[
                    "A clear, personalised picture of where you stand today.",
                    "A customised report at the end that’s yours to keep, free.",
                  ].map((t) => (
                    <li
                      key={t}
                      className="body"
                      style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          background: "var(--color-emerald)",
                          marginTop: 9,
                        }}
                      />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 40 }}>
                <Button variant="primary" onClick={start}>
                  Start the self-assessment <Arrow />
                </Button>
              </div>
            </>
          )}

          {view === "step" && (
            <>
              {/* Progress rail */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                {PHASES.map((p, i) => (
                  <span
                    key={p}
                    className="eyebrow"
                    style={{ color: i === step ? "var(--color-emerald)" : undefined }}
                  >
                    {p}
                  </span>
                ))}
              </div>
              <div className="sa-progress-track" aria-hidden="true">
                <div className="sa-progress-fill" style={{ width: `${((step + 1) / 3) * 100}%` }} />
              </div>

              <div style={{ marginTop: 40 }}>
                <p className="eyebrow">
                  {PHASES[step]} · {step + 1} of 3
                </p>
                <h2 className="h2" style={{ marginTop: 12 }}>
                  {STEPS[step].title}
                </h2>
                <p className="body-large" style={{ marginTop: 16 }}>
                  {STEPS[step].lede}
                </p>

                <div className="stack-md" style={{ marginTop: 36 }}>
                  {STEPS[step].fields}
                </div>
              </div>

              <div className="sa-nav">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button variant="primary" onClick={next}>
                  {step < 2 ? "Continue" : "See where I stand"} <Arrow />
                </Button>
              </div>
            </>
          )}

          {view === "done" && (
            <div style={{ textAlign: "center", paddingTop: 24 }}>
              <p className="eyebrow">That’s everything</p>
              <h2 className="h2" style={{ marginTop: 12 }}>
                Your report would appear here.
              </h2>
              <p className="body-large" style={{ marginTop: 16 }}>
                This is the survey UI shell — the predictive model and the personalised PDF report
                are wired up in a later phase.
              </p>
              <div style={{ marginTop: 36 }}>
                <Button variant="secondary" onClick={() => setView("intro")}>
                  Start over
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const STEPS: { title: string; lede: string; fields: React.ReactNode }[] = [
  {
    title: "Let’s start with timing.",
    lede: "Two quick questions. Nothing here is saved or sent.",
    fields: (
      <>
        <div className="field">
          <label htmlFor="sa-age">How old are you?</label>
          <input id="sa-age" type="number" inputMode="numeric" placeholder="e.g. 34" />
        </div>
        <div className="field">
          <label htmlFor="sa-retire">When would you like work to be optional?</label>
          <input id="sa-retire" type="number" inputMode="numeric" placeholder="e.g. 60" />
          <p className="field-help">The age you’re aiming at.</p>
        </div>
      </>
    ),
  },
  {
    title: "Your income today.",
    lede: "A rough figure is fine — you can refine it later.",
    fields: (
      <>
        <div className="field">
          <label htmlFor="sa-income">Gross annual income</label>
          <input id="sa-income" type="number" inputMode="numeric" placeholder="$" />
        </div>
        <div className="field">
          <label>How is your income earned?</label>
          <div className="field-radio-group">
            <label className="field-radio">
              <input type="radio" name="sa-income-type" defaultChecked />
              <span>Salary (PAYG).</span>
            </label>
            <label className="field-radio">
              <input type="radio" name="sa-income-type" />
              <span>Self-employed or business income.</span>
            </label>
            <label className="field-radio">
              <input type="radio" name="sa-income-type" />
              <span>A mix of both.</span>
            </label>
          </div>
        </div>
      </>
    ),
  },
  {
    title: "Where you’d like to land.",
    lede: "What “work is optional” looks like for you.",
    fields: (
      <>
        <div className="field">
          <label htmlFor="sa-target">Annual income you’d want in retirement</label>
          <input id="sa-target" type="number" inputMode="numeric" placeholder="$" />
        </div>
        <div className="field">
          <label>Have you invested in property before?</label>
          <div className="field-radio-group">
            <label className="field-radio">
              <input type="radio" name="sa-experience" defaultChecked />
              <span>Not yet — this would be my first.</span>
            </label>
            <label className="field-radio">
              <input type="radio" name="sa-experience" />
              <span>I own one investment property.</span>
            </label>
            <label className="field-radio">
              <input type="radio" name="sa-experience" />
              <span>I own more than one.</span>
            </label>
          </div>
        </div>
      </>
    ),
  },
];
