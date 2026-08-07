import { getGenreColor } from "@/lib/utils";

interface GenreBadgeProps {
  name: string;
  onClick?: () => void;
  active?: boolean;
  size?: "sm" | "md";
}

export default function GenreBadge({ name, onClick, active = false, size = "sm" }: GenreBadgeProps) {
  const colorClasses = getGenreColor(name);
  const isClickable = !!onClick;

  const sizeClasses = size === "sm"
    ? "px-2.5 py-1 text-xs"
    : "px-3.5 py-1.5 text-sm";

  return (
    <span
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`
        inline-flex items-center rounded-full border font-medium
        bg-gradient-to-r transition-all duration-200
        ${sizeClasses}
        ${colorClasses}
        ${isClickable ? "cursor-pointer hover:scale-105 hover:shadow-lg" : ""}
        ${active ? "ring-2 ring-violet-500/50 shadow-md shadow-violet-500/20" : ""}
      `}
    >
      {name}
    </span>
  );
}
