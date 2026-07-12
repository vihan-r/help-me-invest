"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { submitContactLead } from "@/app/actions/leads";
import { TOPICS, contactLeadSchema, type ContactLead } from "@/lib/leadSchemas";
import { Arrow } from "./Arrow";
import { RadioGroup, TextAreaField, TextField } from "./Field";
import { FormError } from "./FormError";

/**
 * Contact form. Validated client-side with react-hook-form + zod (schema shared
 * with the server action), then submitted to GoHighLevel via `submitContactLead`
 * (the message rides along as a note on the contact).
 */
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactLead>({
    resolver: zodResolver(contactLeadSchema),
    defaultValues: { topic: "new" },
  });

  const onSubmit = async (data: ContactLead) => {
    setServerError(null);
    const res = await submitContactLead(data);
    if (res.ok) setSubmitted(true);
    else setServerError(res.error);
  };

  if (submitted) {
    return (
      <div className="stack-md py-8" role="status" aria-live="polite">
        <h2 className="h3">
          Your message is <em>on its way.</em>
        </h2>
        <p className="body">
          One of us will read it and reply within a day. If you&rsquo;d like to add anything else,
          send a second message — we&rsquo;ll read both.
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
        id="email"
        label="What email should we use?"
        type="email"
        autoComplete="email"
        required
        {...register("email")}
        error={errors.email?.message}
      />
      <RadioGroup
        legend="What’s this about?"
        options={[...TOPICS]}
        required
        registration={register("topic")}
        error={errors.topic?.message}
      />
      <TextAreaField
        id="message"
        label="What’s on your mind?"
        rows={6}
        required
        {...register("message")}
        error={errors.message?.message}
      />
      {serverError ? <FormError message={serverError} /> : null}
      <div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          Send <Arrow />
        </button>
      </div>
    </form>
  );
}
