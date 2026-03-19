import { cn } from "~/lib/utils";

export function ChipmapLogo({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("h-14 w-14", className)}
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="14"
        y="14"
        width="92"
        height="92"
        rx="10"
        stroke="hsl(var(--accent))"
        strokeWidth="6"
      />
      <path
        d="M28 34h8M84 34h8M28 86h8M84 86h8M18 46h10M18 58h10M18 70h10M92 46h10M92 58h10M92 70h10"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="4"
        strokeLinecap="square"
      />
      <path
        d="M28 68h10V48h10v24h10V40h10v16h10V34h14"
        stroke="hsl(var(--accent))"
        strokeWidth="8"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
