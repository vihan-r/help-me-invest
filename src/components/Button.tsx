import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "md" | "sm";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, extra?: string) {
  return ["btn", VARIANT_CLASS[variant], size === "sm" ? "btn-sm" : "", extra]
    .filter(Boolean)
    .join(" ");
}

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = ButtonOwnProps &
  Omit<ComponentProps<"button">, keyof ButtonOwnProps> & { href?: undefined };

type ButtonAsLink = ButtonOwnProps &
  Omit<ComponentProps<typeof Link>, keyof ButtonOwnProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Three-tier CTA system. Primary (Emerald) is reserved for the single most
 * important action on a surface; Secondary (Lighter Mint) is the everyday
 * default. Renders a Next.js link when `href` is set, otherwise a <button>.
 */
export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant = "secondary", size = "md", className, children, ...rest } = props;
    return (
      <Link className={buttonClasses(variant, size, className)} {...rest}>
        {children}
      </Link>
    );
  }
  const { variant = "secondary", size = "md", className, children, ...rest } = props;
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export type TertiaryLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  children: ReactNode;
  className?: string;
};

/** Tertiary text-link CTA: Warm Charcoal, 1px underline, shifts to Emerald on hover. */
export function TertiaryLink({ children, className, ...rest }: TertiaryLinkProps) {
  return (
    <Link className={["tertiary-link", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </Link>
  );
}
