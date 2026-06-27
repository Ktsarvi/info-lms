import {
  BookOpen,
  FileText,
  TrendingUp,
  Award,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    icon: BookOpen,
    title: "Все курсы, все темы",
    desc: "Доступ к нашей библиотеке курсов",
  },
  {
    icon: CheckCircle2,
    title: "Тесты и викторины",
    desc: "Проверьте знания после каждого урока",
  },
  {
    icon: FileText,
    title: "Готовые PDF",
    desc: "Готовые материалы для обучения",
  },
  {
    icon: TrendingUp,
    title: "Отслеживание прогресса",
    desc: "Подробные отчеты и достижения",
  },
  {
    icon: Award,
    title: "Проверенные материалы",
    desc: "Материалы от экспертов",
  },
];

const HeroFeatures = () => {
  return (
    <section
      className="pt-24 pb-20 px-4 sm:px-6 lg:px-8"
      style={{ background: "#F8FAFC" }}
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT — Text & CTA */}
        <div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5"
            style={{ color: "#1E3A5F" }}
          >
            Подготовьтесь к вступительным экзаменам с{" "}
            <span style={{ color: "#3B82F6" }}>нашими курсами</span>
          </h1>

          <p
            className="text-base leading-relaxed mb-8 max-w-md"
            style={{ color: "#64748B" }}
          >
            Получите доступ к материалам, отслеживайте прогресс и получайте
            практические и теоретические знания, которые нужны на экзамене.
            Начните свое обучение сегодня.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link href="/login">
              <Button
                className="h-14 px-10 text-2xl font-semibold text-white rounded-2xl"
                style={{ background: "#3B82F6", border: "none" }}
              >
                Начать
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { num: "50+", label: "Курсов" },
              { num: "2000+", label: "Заданий" },
              { num: "5+", label: "Книг" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#1E3A5F" }}
                >
                  {num}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Features card */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
          }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: "#64748B" }}
          >
            Что вы получите
          </p>

          <div className="space-y-1">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-3"
                style={{
                  borderBottom:
                    i < features.length - 1 ? "1px solid #E2E8F0" : "none",
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(59,130,246,0.1)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "#1E3A5F" }}
                  >
                    {title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroFeatures;
