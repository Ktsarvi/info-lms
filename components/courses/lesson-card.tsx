import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { statusConfig } from "./statusConfig";
import { Lesson } from "./data";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const { label, icon: StatusIcon, color } = statusConfig[lesson.status];
  const isCompleted = lesson.status === "completed";
  const isInProgress = lesson.status === "in-progress";

  return (
    <Card
      id={`lesson-card-${lesson.id}`}
      className="border transition-colors hover:border-[#1E3A5F]/30"
    >
      <div className="h-1 w-full rounded-t-xl" style={{ background: color }} />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {String(lesson.lessonNumber).padStart(2, "0")}
            </span>
            <CardTitle className="text-sm font-medium leading-tight text-[#1E3A5F]">
              {lesson.title}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 text-[10px] px-1.5 py-0 h-5 font-normal bg-white"
            style={{ borderColor: color, color }}
          >
            <StatusIcon className="w-2.5 h-2.5 mr-1" style={{ color }} />
            {label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        {(isCompleted || isInProgress) && (
          <div>
            {isInProgress && (
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Прогресс</span>
                <span style={{ color }}>{lesson.progress}%</span>
              </div>
            )}
            <Progress
              value={isCompleted ? 100 : lesson.progress}
              className="h-1"
              style={{ "--progress-color": color } as React.CSSProperties}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        <Button
          size="sm"
          id={`lesson-btn-${lesson.id}`}
          className="h-7 w-full text-xs px-3 text-white"
          style={{ background: color, border: "none" }}
        >
          {isCompleted ? "Повторить" : "Продолжить"}
        </Button>
      </CardFooter>
    </Card>
  );
}
