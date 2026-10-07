import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-pill px-6 font-display text-lg font-semibold outline-cel shadow-soft transition-transform duration-300 ease-spring hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.97] active:shadow-press disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "bg-surface text-text hover:bg-surface-sunken",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
