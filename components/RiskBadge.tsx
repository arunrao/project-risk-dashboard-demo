import { Badge } from "@tremor/react";

interface RiskBadgeProps {
  label: "Critical" | "High" | "Medium" | "Low";
  showDot?: boolean;
}

export function RiskBadge({ label, showDot = true }: RiskBadgeProps) {
  let colorClass = "bg-green-500/10 text-green-500 ring-green-500/20";
  let dotColor = "bg-green-500";

  switch (label) {
    case "Critical":
      colorClass = "bg-red-500/10 text-red-500 ring-red-500/20";
      dotColor = "bg-red-500";
      break;
    case "High":
      colorClass = "bg-orange-500/10 text-orange-500 ring-orange-500/20";
      dotColor = "bg-orange-500";
      break;
    case "Medium":
      colorClass = "bg-amber-500/10 text-amber-500 ring-amber-500/20";
      dotColor = "bg-amber-500";
      break;
    case "Low":
      // already green
      break;
  }

  return (
    <Badge
      size="sm"
      className={`${colorClass} ring-1 ring-inset px-2.5 py-0.5 rounded-full font-medium transition-transform hover:scale-105 inline-flex items-center gap-1.5`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {label}
    </Badge>
  );
}
