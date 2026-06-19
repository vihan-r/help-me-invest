"use client";

import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Arrow } from "@/components/Arrow";
import { TextField } from "@/components/Field";
import { clerkErrorMessage } from "@/lib/clerk-errors";

const requestSchema = z.object({
  email: z.email("Please add a valid email."),
});
const resetSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
  password: z.string().min(8, "Use at least 8 characters."),
});

type RequestValues = z.infer<typeof requestSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [authError, setAuthError] = useState<string | null>(null);

  const requestForm = useForm<RequestValues>({ resolver: zodResolver(requestSchema) });
  const resetForm = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  const onRequest = async (data: RequestValues) => {
    if (!isLoaded) return;
    setAuthError(null);
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: data.email });
      setStep("reset");
    } catch (err) {
      setAuthError(clerkErrorMessage(err));
    }
  };

  const onReset = async (data: ResetValues) => {
    if (!isLoaded) return;
    setAuthError(null);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: data.code,
        password: data.password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setAuthError("Couldn’t reset the password. Please check the code and try again.");
      }
    } catch (err) {
      setAuthError(clerkErrorMessage(err));
    }
  };

  if (step === "reset") {
    return (
      <form className="stack-md mt-10" noValidate onSubmit={resetForm.handleSubmit(onReset)}>
        <p className="body-small" role="status" aria-live="polite">
          We’ve emailed you a 6-digit code. Enter it below with your new password.
        </p>
        {authError && (
          <p className="field-error" role="alert">
            {authError}
          </p>
        )}
        <TextField
          id="reset-code"
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          required
          {...resetForm.register("code")}
          error={resetForm.formState.errors.code?.message}
        />
        <TextField
          id="new-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          help="At least 8 characters."
          {...resetForm.register("password")}
          error={resetForm.formState.errors.password?.message}
        />
        <div className="mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={resetForm.formState.isSubmitting || !isLoaded}
          >
            Set new password <Arrow />
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="stack-md mt-10" noValidate onSubmit={requestForm.handleSubmit(onRequest)}>
      {authError && (
        <p className="field-error" role="alert">
          {authError}
        </p>
      )}
      <TextField
        id="email"
        label="Your email"
        type="email"
        autoComplete="email"
        required
        {...requestForm.register("email")}
        error={requestForm.formState.errors.email?.message}
      />
      <div className="mt-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={requestForm.formState.isSubmitting || !isLoaded}
        >
          Send reset code <Arrow />
        </button>
      </div>
    </form>
  );
}
