"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Arrow } from "@/components/Arrow";
import { TextField } from "@/components/Field";

const schema = z.object({
  email: z.email("Please add a valid email."),
});

type ResetValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ResetValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: ResetValues) => {
    // No backend yet — Phase 2 triggers the Clerk reset email with `data`.
    void data;
  };

  if (isSubmitSuccessful) {
    return (
      <div
        className="bg-lighter-mint"
        style={{ borderRadius: 14, padding: "20px 22px", marginTop: 32 }}
        role="status"
        aria-live="polite"
      >
        <p className="body-small">
          If that email has an account, a reset link is on its way. The link expires in an hour —
          check your spam folder if you don&rsquo;t see it.
        </p>
      </div>
    );
  }

  return (
    <form className="stack-md" style={{ marginTop: 40 }} noValidate onSubmit={handleSubmit(onSubmit)}>
      <TextField
        id="email"
        label="Your email"
        type="email"
        autoComplete="email"
        required
        {...register("email")}
        error={errors.email?.message}
      />
      <div style={{ marginTop: 16 }}>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          Send reset link <Arrow />
        </button>
      </div>
    </form>
  );
}
