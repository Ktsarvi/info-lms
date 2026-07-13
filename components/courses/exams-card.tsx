import { Clock, FileText, Star, Trophy, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function ExamsCard() {
  return (
    <Card
      id="exams-card"
      className="group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg border-0 overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, #1E3A5F 0%, #2D5B8E 50%, #3B82F6 100%)",
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10 bg-white" />
      <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-10 bg-white" />

      {/* Top accent */}
      <div
        className="h-1 w-full"
        style={{
          background: "linear-gradient(90deg, #F59E0B, #FBBF24, #FCD34D)",
        }}
      />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(245, 158, 11, 0.25)" }}
            >
              <Trophy className="w-4 h-4" style={{ color: "#FCD34D" }} />
            </div>
            <CardTitle className="text-sm font-bold text-white">
              Дополнительные экзамены
            </CardTitle>
          </div>
          <Badge
            className="text-xs shrink-0"
            style={{
              background: "rgba(245,158,11,0.25)",
              color: "#FCD34D",
              border: "1px solid rgba(245,158,11,0.4)",
            }}
          >
            <Star className="w-3 h-3 mr-1" /> Премиум
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed pl-10 text-blue-100">
          10 дополнительных экзаменационных тестов для углублённой подготовки и
          проверки знаний.
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        {/* Exam pills */}
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="h-7 rounded-md flex items-center justify-center text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              #{i + 1}
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4">
          {[
            { icon: FileText, label: "10 тестов" },
            { icon: Clock, label: "90–120 мин" },
            { icon: Zap, label: "Адаптивный" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1 text-xs text-blue-200"
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-1 text-xs text-blue-200">
          <Star className="w-3 h-3 fill-current text-yellow-300" />
          <span>Повышенная сложность</span>
        </div>
        <Button
          size="sm"
          id="start-exams-btn"
          className="h-7 text-xs px-3 font-semibold"
          style={{ background: "#F59E0B", color: "#1E3A5F", border: "none" }}
        >
          Начать экзамен
        </Button>
      </CardFooter>
    </Card>
  );
}
