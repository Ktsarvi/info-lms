import { BarChart3, CheckCircle2, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { lessons } from "./data";

export function StatsBar() {
  const completedCount = lessons.filter((l) => l.status === "completed").length;
  const inProgressCount = lessons.filter(
    (l) => l.status === "in-progress",
  ).length;
  const overallProgress = Math.round((completedCount / lessons.length) * 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {[
        {
          label: "Пройдено уроков",
          value: `${completedCount}/15`,
          icon: CheckCircle2,
          color: "#10B981",
        },
        {
          label: "В процессе",
          value: inProgressCount,
          icon: PlayCircle,
          color: "#3B82F6",
        },
        {
          label: "Общий прогресс",
          value: `${overallProgress}%`,
          icon: BarChart3,
          color: "#8B5CF6",
        },
      ].map(({ label, value, icon: Icon, color }) => (
        <Card
          key={label}
          size="sm"
          className="border-0 shadow-sm"
          style={{ background: "#F8FAFC" }}
        >
          <CardContent className="pt-1">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: color + "20" }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p
                  className="text-lg font-bold leading-none"
                  style={{ color: "#1E3A5F" }}
                >
                  {value}{" "}
                  <span className="text-xs text-muted-foreground">{label}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
