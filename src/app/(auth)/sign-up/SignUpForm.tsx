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
import { RadioGroup, TextField } from "@/components/Field";
import { clerkErrorMessage } from "@/lib/clerk-errors";

const STAGES = [
  {
    value: "explore",
    label: "Just exploring, I want to understand how property investing works.",
  },
  { value: "saving", label: "Saving for my first investment property." },
  { value: "ready", label: "Ready to buy my first investment property." },
  { value: "owner", label: "I already own one or more investment properties." },
] as const;

const schema = z.object({
  firstName: z.string().trim().min(1, "Please tell us your first name."),
  email: z.email("Please add a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
  stage: z.enum(["explore", "saving", "ready", "owner"]),
});

type SignUpValues = z.infer<typeof schema>;

export function SignUpForm() {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: { stage: "explore" },
  });

  const onSubmit = async (data: SignUpValues) => {
    if (!isLoaded) return;
    setAuthError(null);
    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
        // First name + onboarding choice are non-sensitive preferences; stored as
        // unsafeMetadata for now (a backend-set field can replace this in FEAT-55).
        unsafeMetadata: { firstName: data.firstName, investingStage: data.stage },
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      router.push("/verify-email");
    } catch (err) {
      setAuthError(clerkErrorMessage(err));
    }
  };

  const signUpWithGoogle = async () => {
    if (!isLoaded) return;
    setAuthError(null);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      setAuthError(clerkErrorMessage(err));
    }
  };

  return (
    <>
      <form className="stack-md mt-10" noValidate onSubmit={handleSubmit(onSubmit)}>
        {authError && (
          <p className="field-error" role="alert">
            {authError}
          </p>
        )}
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
        <TextField
          id="password"
          label="Choose a password"
          type="password"
          autoComplete="new-password"
          required
          help="At least 8 characters. We’ll never email it to you."
          {...register("password")}
          error={errors.password?.message}
        />
        <RadioGroup
          legend="Where are you in your investing journey?"
          options={[...STAGES]}
          required
          registration={register("stage")}
          error={errors.stage?.message}
        />
        {/* Clerk bot-protection (Smart CAPTCHA) mounts here; without this element
            it falls back to a modal challenge. */}
        <div id="clerk-captcha" />
        <div className="mt-8">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isLoaded}>
            Create my account <Arrow />
          </button>
          <p className="terms-line">
            By creating an account, you agree to our <Link href="/terms">terms</Link> and{" "}
            <Link href="/privacy">privacy notice</Link>.
          </p>
        </div>
      </form>

      <div className="divider-or">
        <span>or</span>
      </div>

      <Button variant="secondary" type="button" onClick={signUpWithGoogle} disabled={!isLoaded}>
        Continue with Google
      </Button>
    </>
  );
}
