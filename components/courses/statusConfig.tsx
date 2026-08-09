import { CheckCircle2, PlayCircle, BookOpen } from "lucide-react";
import { LessonStatus } from "./data";

export const statusConfig: Record<
  LessonStatus,
  {
    label: string;
    icon: React.ComponentType<{
      className?: string;
      style?: React.CSSProperties;
    }>;
    color: string;
    badgeVariant: "default" | "secondary" | "outline";
  }
> = {
  completed: {
    label: "Завершено",
    icon: CheckCircle2,
    color: "#10B981",
    badgeVariant: "secondary",
  },
  "in-progress": {
    label: "В процессе",
    icon: PlayCircle,
    color: "#3B82F6",
    badgeVariant: "default",
  },
  "not-started": {
    label: "Не начато",
    icon: BookOpen,
    color: "#94A3B8",
    badgeVariant: "outline",
  },
};
