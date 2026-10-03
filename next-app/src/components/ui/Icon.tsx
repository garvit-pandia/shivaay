import { Box, type LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon | null | undefined;
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
}

/**
 * Thin wrapper around lucide-react icons. Falls back to a neutral Box
 * glyph when a caller passes an unresolved name → icon lookup (undefined
 * at runtime) — a missing icon degrades visibly instead of crashing the
 * page or rendering nothing.
 */
export function Icon({ icon, size, className, ...props }: IconProps) {
  const LucideIconComponent = icon ?? Box;
  return (
    <LucideIconComponent
      size={size}
      className={className}
      suppressHydrationWarning
      {...props}
    />
  );
}
