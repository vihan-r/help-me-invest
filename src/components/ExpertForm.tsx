"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { submitExpertLead } from "@/app/actions/leads";
import { capture } from "@/lib/analytics";
import { INTENTS, TIMINGS, expertLeadSchema, type ExpertLead } from "@/lib/leadSchemas";
import { Arrow } from "./Arrow";
import { RadioGroup, TextField } from "./Field";
import { FormError } from "./FormError";

/**
 * Talk-to-an-expert intake. Calm, customer-led (no urgency/scarcity). Validated
 * client-side with react-hook-form + zod (schema shared with the server action),
 * then submitted to GoHighLevel via `submitExpertLead`.
 */
export function ExpertForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpertLead>({
    resolver: zodResolver(expertLeadSchema),
    defaultValues: { intent: "first", timing: "exploring" },
  });

  const onSubmit = async (data: ExpertLead, event?: BaseSyntheticEvent) => {
    const company =
      (
        (event?.currentTarget as HTMLFormElement | undefined)?.elements.namedItem(
          "company",
        ) as HTMLInputElement | null
      )?.value ?? "";
    setServerError(null);
    const res = await submitExpertLead({ ...data, company });
    if (res.ok) {
      capture("expert_form_submitted", { intent: data.intent, timing: data.timing });
      setSubmitted(true);
    } else setServerError(res.error);
  };

  if (submitted) {
    return (
      <div className="stack-md py-8" role="status" aria-live="polite">
        <h2 className="h3">
          Thanks. We&rsquo;ll be in touch <em>within 24 hours.</em>
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
        legend="How soon do you need help?"
        options={[...TIMINGS]}
        required
        registration={register("timing")}
        error={errors.timing?.message}
      />
      {serverError ? <FormError message={serverError} /> : null}
      <div>
        {/* Honeypot: hidden off-screen; bots that fill it are silently dropped. */}
        <input
          className="hp-field"
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          Send my details <Arrow />
        </button>
        <p className="body-small mt-3.5">
          We&rsquo;ll call you back within 24 hours. If you&rsquo;d rather email,{" "}
          <a className="inline-link" href="mailto:hello@helpmeinvest.com.au">
            hello@helpmeinvest.com.au
          </a>{" "}
          reaches the same person.
        </p>
      </div>
    </form>
  );
}
