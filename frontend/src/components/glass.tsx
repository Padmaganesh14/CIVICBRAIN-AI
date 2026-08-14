import { cva, type VariantProps } from "class-variance-authority";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  sheen = true,
  ...props
}: ComponentProps<"div"> & { sheen?: boolean }) {
  return (
    <div
      className={cn(
        "glass-surface rounded-3xl",
        sheen && "glass-sheen",
        "transition-shadow duration-500",
        className,
      )}
      {...props}
    />
  );
}

const glassButtonVariants = cva(
  "relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-tight transition-all duration-300 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_16px_40px_-16px_var(--color-primary)] hover:brightness-110 hover:shadow-[0_22px_50px_-18px_var(--color-primary)]",
        accent:
          "bg-accent text-accent-foreground shadow-[0_16px_40px_-16px_var(--color-accent)] hover:brightness-110",
        glass:
          "glass-surface-strong text-foreground hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-primary)_35%,transparent),0_18px_40px_-18px_color-mix(in_oklab,var(--color-primary)_60%,transparent)]",
        outline: "border border-border bg-transparent text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
      },
      size: {
        default: "h-11",
        sm: "h-10 px-4 text-[13px]",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11 min-w-11 px-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export function GlassButton({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof glassButtonVariants>) {
  return (
    <button
      className={cn(glassButtonVariants({ variant, size }), "hover:-translate-y-0.5", className)}
      {...props}
    />
  );
}

export const glassButtonClass = (
  opts?: VariantProps<typeof glassButtonVariants>,
  className?: string,
) => cn(glassButtonVariants(opts), "hover:-translate-y-0.5", className);

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <span className="glass-surface inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-5 text-3xl font-bold text-balance sm:text-4xl md:text-5xl">{title}</h2>
      {subtitle ? (
        <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function AnimatedCounter({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 1800,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export function PriorityBadge({
  level,
  label,
}: {
  level: "critical" | "high" | "medium" | "low";
  label: string;
}) {
  const styles: Record<typeof level, string> = {
    critical: "bg-destructive/12 text-destructive ring-destructive/30",
    high: "bg-warning/18 text-warning-foreground ring-warning/40",
    medium: "bg-primary/10 text-primary ring-primary/25",
    low: "bg-secondary/14 text-secondary-foreground ring-secondary/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        styles[level],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}
