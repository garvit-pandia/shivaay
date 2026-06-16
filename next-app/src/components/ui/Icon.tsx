import { type LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
}

export function Icon({ icon: LucideIconComponent, size, className, ...props }: IconProps) {
  return (
    <LucideIconComponent
      size={size}
      className={className}
      suppressHydrationWarning
      {...props}
    />
  );
}
