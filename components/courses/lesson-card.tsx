import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { statusConfig } from "./statusConfig";
import type { TopicWithSubLessons } from "@/types/courses";
import type { LessonStatus } from "./data";

interface LessonCardProps {
  topic: TopicWithSubLessons;
  status?: LessonStatus;
  progress?: number;
}

export function LessonCard({
  topic,
  status = "not-started",
  progress = 0,
}: LessonCardProps) {
  const { label, icon: StatusIcon, color } = statusConfig[status];
  const isCompleted = status === "completed";
  const isInProgress = status === "in-progress";

  return (
    <Card
      id={`lesson-card-${topic.id}`}
      className="border transition-colors hover:border-[#1E3A5F]/30"
    >
      <div className="h-1 w-full rounded-t-xl" style={{ background: color }} />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {String(topic.order_index).padStart(2, "0")}
            </span>
            <CardTitle className="text-sm font-medium leading-tight text-[#1E3A5F]">
              {topic.title}
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
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{topic.sub_lesson_count} подтем(ы)</span>
          {isInProgress && <span style={{ color }}>{progress}%</span>}
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Link href={`/courses/${topic.slug}`} className="w-full">
          <Button
            size="sm"
            id={`lesson-btn-${topic.id}`}
            className="h-7 w-full text-xs px-3 text-white cursor-pointer"
            style={{ background: color, border: "none" }}
          >
            {isCompleted ? "Повторить" : isInProgress ? "Продолжить" : "Начать"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
