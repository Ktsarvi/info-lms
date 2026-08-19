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
import type { ExamOverviewClient } from "@/types/courses";
import type { ExamStatus } from "./data";

interface ExamCardIndividualProps {
  exam: ExamOverviewClient;
  status?: ExamStatus;
}

export function ExamCardIndividual({
  exam,
  status = "not-started",
}: ExamCardIndividualProps) {
  const { label, icon: StatusIcon, color } = statusConfig[status];

  return (
    <Card
      id={`exam-card-${exam.id}`}
      className="border transition-colors hover:border-[#1E3A5F]/30"
    >
      <div className="h-1 w-full rounded-t-xl" style={{ background: color }} />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {String(exam.examNumber).padStart(2, "0")}
            </span>
            <CardTitle className="text-sm font-medium leading-tight text-[#1E3A5F]">
              {exam.title}
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
        {exam.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {exam.description}
          </p>
        )}
        {exam.covers.length > 0 && (
          <p className="text-[11px] text-blue-600 font-medium truncate">
            Охватывает: {exam.covers.join(", ")}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        <Link href={`/courses/exam/${exam.id}`} className="w-full">
          <Button
            size="sm"
            id={`exam-btn-${exam.id}`}
            className="h-7 w-full text-xs px-3 text-white cursor-pointer"
            style={{ background: color, border: "none" }}
          >
            {status === "completed" ? "Повторить" : "Начать"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
