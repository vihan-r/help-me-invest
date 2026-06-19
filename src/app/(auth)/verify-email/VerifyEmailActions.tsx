"use client";

import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Arrow } from "@/components/Arrow";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Field";
import { FormError } from "@/components/FormError";
import { clerkErrorMessage } from "@/lib/clerk-errors";

const schema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

type VerifyValues = z.infer<typeof schema>;

export function VerifyEmailActions({ redirectUrl = "/" }: { redirectUrl?: string }) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyValues>({ resolver: zodResolver(schema) });

  // If there's no sign-up in progress (e.g. the user opened this page directly or
  // reloaded and lost the in-memory attempt), guide them back rather than failing.
  const noSignUpInProgress = isLoaded && !signUp?.status;

  const onSubmit = async (data: VerifyValues) => {
    if (!isLoaded) return;
    setAuthError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: data.code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push(redirectUrl);
      } else {
        setAuthError("That code didn’t verify. Please check it and try again.");
      }
    } catch (err) {
      setAuthError(clerkErrorMessage(err));
    }
  };

  const resend = async () => {
    if (!isLoaded) return;
    setAuthError(null);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResent(true);
    } catch (err) {
      setAuthError(clerkErrorMessage(err));
    }
  };

  if (noSignUpInProgress) {
    return (
      <div className="mt-8">
        <p className="body">
          We couldn’t find a sign-up in progress.{" "}
          <Link className="inline-link" href="/sign-up">
            Create your account
          </Link>{" "}
          to get a verification code.
        </p>
      </div>
    );
  }

  return (
    <>
      <form className="stack-md mt-8" noValidate onSubmit={handleSubmit(onSubmit)}>
        <TextField
          id="code"
          label="Enter your 6-digit verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          required
          {...register("code")}
          error={errors.code?.message}
        />
        {authError && <FormError message={authError} />}
        <div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isLoaded}>
            Verify and continue <Arrow />
          </button>
        </div>
      </form>

      <div className="mt-6">
        <Button variant="secondary" type="button" onClick={resend} disabled={!isLoaded}>
          Resend verification code
        </Button>
        <p className="field-help mt-3.5" role="status" aria-live="polite">
          {resent ? "Sent — a fresh code is on its way." : ""}
        </p>
      </div>
    </>
  );
}
