"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Arrow } from "@/components/Arrow";
import { TextField } from "@/components/Field";

const schema = z.object({
  email: z.email("Please add a valid email."),
  password: z.string().min(1, "Please enter your password."),
});

type SignInValues = z.infer<typeof schema>;

export function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: SignInValues) => {
    // No backend yet — Phase 2 calls Clerk sign-in with `data`.
    void data;
  };

  return (
    <form className="stack-md mt-10" noValidate onSubmit={handleSubmit(onSubmit)}>
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
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          Sign in <Arrow />
        </button>
      </div>
    </form>
  );
}
