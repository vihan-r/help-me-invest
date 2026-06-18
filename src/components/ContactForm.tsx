"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Arrow } from "./Arrow";
import { RadioGroup, TextAreaField, TextField } from "./Field";

/**
 * Contact form. Client-side validated with react-hook-form + zod; the schema is
 * the single source of truth and is reusable by the Phase-2 backend. `onSubmit`
 * is a no-op stub today — wiring the backend is a change to that one function,
 * not a rewrite.
 */

const TOPICS = [
  { value: "new", label: "I’m new — where do I start?" },
  { value: "property", label: "A question about a specific property or decision." },
  { value: "partner", label: "Partner enquiry." },
  { value: "press", label: "Press / other." },
] as const;

const schema = z.object({
  firstName: z.string().trim().min(1, "Please tell us your first name."),
  email: z.email("Please add a valid email."),
  topic: z.enum(["new", "property", "partner", "press"]),
  message: z.string().trim().min(1, "Add a short message so we can help."),
});

type ContactValues = z.infer<typeof schema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactValues>({
    resolver: zodResolver(schema),
    defaultValues: { topic: "new" },
  });

  const onSubmit = async (data: ContactValues) => {
    // No backend yet — Phase 2 replaces this body with the API / CRM call using `data`.
    void data;
  };

  if (isSubmitSuccessful) {
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
      <div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          Send <Arrow />
        </button>
      </div>
    </form>
  );
}
