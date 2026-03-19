import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary text-secondary-foreground",
        teal: "border-accent/30 bg-accent/15 text-accent",
        amber: "border-[hsl(var(--amber))]/30 bg-[hsl(var(--amber))]/15 text-[hsl(var(--amber))]",
        purple:
          "border-[hsl(var(--purple))]/30 bg-[hsl(var(--purple))]/15 text-[hsl(var(--purple))]",
        green:
          "border-[hsl(var(--green))]/30 bg-[hsl(var(--green))]/15 text-[hsl(var(--green))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}
