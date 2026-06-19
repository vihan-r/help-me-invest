"use client";

import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Arrow } from "@/components/Arrow";
import { Button } from "@/components/Button";
import { TextField } from "@/components/Field";
import { clerkErrorMessage } from "@/lib/clerk-errors";

const schema = z.object({
  email: z.email("Please add a valid email."),
  password: z.string().min(1, "Please enter your password."),
});

type SignInValues = z.infer<typeof schema>;

export function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: SignInValues) => {
    if (!isLoaded) return;
    setAuthError(null);
    try {
      const result = await signIn.create({ identifier: data.email, password: data.password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        // Password sign-in normally completes in one step; anything else needs
        // a flow we don't surface yet (e.g. 2FA).
        setAuthError("This account needs an extra verification step we don’t support yet.");
      }
    } catch (err) {
      setAuthError(clerkErrorMessage(err));
    }
  };

  const signInWithGoogle = async () => {
    if (!isLoaded) return;
    setAuthError(null);
    try {
      await signIn.authenticateWithRedirect({
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
          id="email"
          label="What email do you use?"
          type="email"
          autoComplete="email"
          required
          {...register("email")}
          error={errors.email?.message}
        />
        <TextField
          id="password"
          label="Your password"
          type="password"
          autoComplete="current-password"
          required
          {...register("password")}
          error={errors.password?.message}
        />
        <p className="field-help">
          <Link className="inline-link" href="/reset-password">
            Forgot your password?
          </Link>
        </p>
        <div className="mt-4">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isLoaded}>
            Sign in <Arrow />
          </button>
        </div>
      </form>

      <div className="divider-or">
        <span>or</span>
      </div>

      <Button variant="secondary" type="button" onClick={signInWithGoogle} disabled={!isLoaded}>
        Continue with Google
      </Button>
    </>
  );
}
