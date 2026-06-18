"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Arrow } from "./Arrow";
import { RadioGroup, TextField } from "./Field";

/**
 * Talk-to-an-expert intake. Calm, customer-led (no urgency/scarcity). Validated
 * with react-hook-form + zod; `onSubmit` is a no-op stub until the Phase-2 backend.
 */

const INTENTS = [
  { value: "first", label: "I’m buying my first investment property." },
  { value: "next", label: "I’m buying my next investment property." },
  { value: "refinance", label: "I’m refinancing an existing loan." },
  { value: "review", label: "I’m reviewing my current portfolio." },
  { value: "other", label: "Something else — I’ll explain below." },
] as const;

const TIMINGS = [
  { value: "whenever", label: "Whenever suits — I’m just exploring." },
  { value: "months", label: "Sometime in the next few months." },
  { value: "now", label: "I’m working through a decision now." },
] as const;

const schema = z.object({
  firstName: z.string().trim().min(1, "Please tell us your first name."),
  phone: z.string().trim().min(1, "Add a number we can reach you on."),
  email: z.email("Please add a valid email."),
  intent: z.enum(["first", "next", "refinance", "review", "other"]),
  timing: z.enum(["whenever", "months", "now"]),
});

type ExpertValues = z.infer<typeof schema>;

export function ExpertForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ExpertValues>({
    resolver: zodResolver(schema),
    defaultValues: { intent: "first", timing: "whenever" },
  });

  const onSubmit = async (data: ExpertValues) => {
    // No backend yet — Phase 2 replaces this body with the API / CRM call using `data`.
    void data;
  };

  if (isSubmitSuccessful) {
    return (
      <div className="stack-md py-8" role="status" aria-live="polite">
        <h2 className="h3">
          Thanks. We&rsquo;ll be in touch <em>within a day.</em>
        </h2>
        <p className="body">
          One of our team will read what you&rsquo;ve written and call you back within 24 hours. If
          something changes before then, send a second message — we&rsquo;ll read both.
        </p>
      </div>
    );
  }

  return (
    <form className="stack-lg" noValidate onSubmit={handleSubmit(onSubmit)}>
      <TextField
        id="first-name"
        label="What’s your first name?"
        autoComplete="given-name"
        required
        {...register("firstName")}
        error={errors.firstName?.message}
      />
      <TextField
        id="phone"
        label="What’s the best number to reach you on?"
        type="tel"
        autoComplete="tel"
        required
        {...register("phone")}
        error={errors.phone?.message}
      />
      <TextField
        id="email"
        label="And an email, in case we can’t reach you by phone."
        type="email"
        autoComplete="email"
        required
        {...register("email")}
        error={errors.email?.message}
      />
      <RadioGroup
        legend="What are you trying to do?"
        options={[...INTENTS]}
        required
        registration={register("intent")}
        error={errors.intent?.message}
      />
      <RadioGroup
        legend="When would you like to hear from us?"
        options={[...TIMINGS]}
        required
        registration={register("timing")}
        error={errors.timing?.message}
      />
      <div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          Send my details <Arrow />
        </button>
        <p className="body-small mt-3.5">
          We&rsquo;ll call you back within a day. If you&rsquo;d rather email,{" "}
          <a className="inline-link" href="mailto:hello@helpmeinvest.com.au">
            hello@helpmeinvest.com.au
          </a>{" "}
          reaches the same person.
        </p>
      </div>
    </form>
  );
}
