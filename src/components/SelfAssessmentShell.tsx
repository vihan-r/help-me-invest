"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Arrow } from "./Arrow";
import { Button } from "./Button";
import { RadioGroup, TextField } from "./Field";
import { Placeholder } from "./Placeholder";

type View = "intro" | "step" | "done";

const PHASES = ["About you", "Where this leads", "Your plan"];

// Shell-level validation: enough to stop a step advancing with empty answers.
// The predictive model + real ranges are Phase 2.
const schema = z.object({
  age: z.string().trim().min(1, "Enter your age."),
  retire: z.string().trim().min(1, "Enter the age you’re aiming at."),
  income: z.string().trim().min(1, "Enter your gross annual income."),
  incomeType: z.enum(["salary", "self", "mix"]),
  target: z.string().trim().min(1, "Enter the income you’d want."),
  experience: z.enum(["none", "one", "multiple"]),
});

type SAValues = z.infer<typeof schema>;

const STEP_META = [
  {
    title: "Let’s start with timing.",
    lede: "Two quick questions. Nothing here is saved or sent.",
  },
  { title: "Your income today.", lede: "A rough figure is fine — you can refine it later." },
  { title: "Where you’d like to land.", lede: "What “work is optional” looks like for you." },
];

const STEP_FIELDS: (keyof SAValues)[][] = [
  ["age", "retire"],
  ["income", "incomeType"],
  ["target", "experience"],
];

export function SelfAssessmentShell() {
  const [view, setView] = useState<View>("intro");
  const [step, setStep] = useState(0);

  // One form across all steps — react-hook-form keeps values mounted across
  // Back/Next (shouldUnregister defaults to false), so nothing is lost when a
  // step's inputs unmount. Fixes the uncontrolled-multi-step state bug.
  const {
    register,
    trigger,
    formState: { errors },
  } = useForm<SAValues>({
    resolver: zodResolver(schema),
    defaultValues: { incomeType: "salary", experience: "none" },
  });

  const start = () => {
    setStep(0);
    setView("step");
  };
  const back = () => (step > 0 ? setStep(step - 1) : setView("intro"));
  const next = async () => {
    const ok = await trigger(STEP_FIELDS[step]);
    if (!ok) return;
    if (step < 2) setStep(step + 1);
    else setView("done");
  };

  return (
    <>
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
                  {STEP_META[step].title}
                </h2>
                <p className="body-large" style={{ marginTop: 16 }}>
                  {STEP_META[step].lede}
                </p>

                <div className="stack-md" style={{ marginTop: 36 }}>
                  {step === 0 && (
                    <>
                      <TextField
                        id="sa-age"
                        label="How old are you?"
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g. 34"
                        required
                        {...register("age")}
                        error={errors.age?.message}
                      />
                      <TextField
                        id="sa-retire"
                        label="When would you like work to be optional?"
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g. 60"
                        help="The age you’re aiming at."
                        required
                        {...register("retire")}
                        error={errors.retire?.message}
                      />
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <TextField
                        id="sa-income"
                        label="Gross annual income"
                        type="number"
                        inputMode="numeric"
                        placeholder="$"
                        required
                        {...register("income")}
                        error={errors.income?.message}
                      />
                      <RadioGroup
                        legend="How is your income earned?"
                        options={[
                          { value: "salary", label: "Salary (PAYG)." },
                          { value: "self", label: "Self-employed or business income." },
                          { value: "mix", label: "A mix of both." },
                        ]}
                        required
                        registration={register("incomeType")}
                        error={errors.incomeType?.message}
                      />
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <TextField
                        id="sa-target"
                        label="Annual income you’d want in retirement"
                        type="number"
                        inputMode="numeric"
                        placeholder="$"
                        required
                        {...register("target")}
                        error={errors.target?.message}
                      />
                      <RadioGroup
                        legend="Have you invested in property before?"
                        options={[
                          { value: "none", label: "Not yet — this would be my first." },
                          { value: "one", label: "I own one investment property." },
                          { value: "multiple", label: "I own more than one." },
                        ]}
                        required
                        registration={register("experience")}
                        error={errors.experience?.message}
                      />
                    </>
                  )}
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
            <div style={{ textAlign: "center", paddingTop: 24 }} role="status" aria-live="polite">
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
    </>
  );
}
