"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Arrow } from "@/components/Arrow";
import { RadioGroup, TextField } from "@/components/Field";

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: { stage: "explore" },
  });

  const onSubmit = async (data: SignUpValues) => {
    // No backend yet — Phase 2 creates the account via Clerk with `data`.
    void data;
  };

  return (
    <form className="stack-md mt-10" noValidate onSubmit={handleSubmit(onSubmit)}>
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
      <div className="mt-8">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          Create my account <Arrow />
        </button>
        <p className="terms-line">
          By creating an account, you agree to our <Link href="/terms">terms</Link> and{" "}
          <Link href="/privacy">privacy notice</Link>.
        </p>
      </div>
    </form>
  );
}
