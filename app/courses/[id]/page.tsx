"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  ChevronRight,
  Download,
  BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { lessons, exams, Material } from "@/components/courses/data";
import { statusConfig } from "@/components/courses/statusConfig";
import Navbar from "@/components/homepage/navbar";

// ─── helpers ────────────────────────────────────────────────────────────────

const PDF_COLOR = "#3B82F6";

const CURRENT_USER = {
  name: "Алибек Искаков",
  email: "a.iskakov@example.com",
  initials: "АИ",
};

// ─── page ────────────────────────────────────────────────────────────────────

export default function LecturePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Find as lesson first, then fall back to exam
  const rawLesson = lessons.find((l) => l.id === Number(id));
  const rawExam = !rawLesson ? exams.find((e) => e.id === Number(id)) : null;

  // Normalise exam into the same shape as Lesson so the rest of the page works
  const lesson =
    rawLesson ??
    (rawExam
      ? {
          id: rawExam.id,
          title: rawExam.title,
          description: rawExam.description,
          status: rawExam.status as "completed" | "not-started",
          progress: rawExam.status === "completed" ? 100 : 0,
          tags: ["Экзамен"],
          lessonNumber: rawExam.examNumber,
          materials: [
            {
              id: `${rawExam.id}-1`,
              title: rawExam.title,
              type: "pdf" as const,
              completed: rawExam.status === "completed",
              description: rawExam.description,
            },
          ],
        }
      : null);

  const isExam = !!rawExam;

  // local materials state (completed toggles)
  const [materials, setMaterials] = useState<Material[]>(
    lesson?.materials ?? [],
  );
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(
    materials[0] ?? null,
  );

  if (!lesson) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F8FAFC" }}
      >
        <div className="text-center">
          <p className="text-lg font-semibold" style={{ color: "#1E3A5F" }}>
            Урок не найден
          </p>
          <Button className="mt-4" onClick={() => router.push("/courses")}>
            ← Вернуться к курсам
          </Button>
        </div>
      </div>
    );
  }

  const { color } = statusConfig[lesson.status];
  const completedCount = materials.filter((m) => m.completed).length;
  const totalCount = materials.length;
  const allDone = completedCount === totalCount && totalCount > 0;
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  function toggleMaterial(matId: string) {
    setMaterials((prev) =>
      prev.map((m) => (m.id === matId ? { ...m, completed: !m.completed } : m)),
    );
    // keep activeMaterial in sync
    setActiveMaterial((prev) =>
      prev?.id === matId ? { ...prev, completed: !prev.completed } : prev,
    );
  }

  function markAllComplete() {
    const updated = materials.map((m) => ({ ...m, completed: true }));
    setMaterials(updated);
    if (activeMaterial) {
      setActiveMaterial({ ...activeMaterial, completed: true });
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F8FAFC" }}
    >
      <Navbar user={CURRENT_USER} />

      {/* ── top accent bar ── */}
      <div className="h-1 w-full" style={{ background: color }} />

      <div className="flex flex-1 pt-20">
        {/* ═══════════════════════════════════════════════════════════════════
            SIDEBAR
        ═══════════════════════════════════════════════════════════════════ */}
        <aside
          className="hidden md:flex flex-col w-72 shrink-0 border-r"
          style={{
            background: "white",
            borderColor: "#E2E8F0",
            minHeight: "calc(100vh - 5rem)",
          }}
        >
          {/* back */}
          <div
            className="px-4 pt-5 pb-4 border-b"
            style={{ borderColor: "#E2E8F0" }}
          >
            <button
              id="back-to-courses"
              onClick={() => router.push("/courses")}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: "#1E3A5F" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к курсам
            </button>
          </div>

          {/* lesson header */}
          <div
            className="px-4 py-4 border-b"
            style={{ borderColor: "#E2E8F0" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: color + "18", color }}
              >
                {isExam
                  ? "Экзамен"
                  : `Урок ${String(lesson.lessonNumber).padStart(2, "0")}`}
              </span>
            </div>
            <p
              className="text-sm font-semibold leading-snug mt-1"
              style={{ color: "#1E3A5F" }}
            >
              {lesson.title}
            </p>

            {/* progress */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Прогресс</span>
                <span style={{ color }}>{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-1.5" />
              <p className="text-xs text-gray-400 mt-1">
                {completedCount} из {totalCount} материалов
              </p>
            </div>
          </div>

          {/* materials list */}
          <div className="flex-1 overflow-y-auto py-2">
            <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Материалы
            </p>
            <ul className="space-y-0.5 px-2">
              {materials.map((mat) => {
                const isActive = activeMaterial?.id === mat.id;

                return (
                  <li key={mat.id}>
                    <button
                      id={`sidebar-mat-${mat.id}`}
                      onClick={() => setActiveMaterial(mat)}
                      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all text-left group"
                      style={{
                        background: isActive ? color + "12" : "transparent",
                        border: isActive
                          ? `1px solid ${color}30`
                          : "1px solid transparent",
                      }}
                    >
                      {/* type icon */}
                      <div
                        className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
                        style={{ background: PDF_COLOR + "18" }}
                      >
                        <FileText
                          className="w-3.5 h-3.5"
                          style={{ color: PDF_COLOR }}
                        />
                      </div>

                      {/* title */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-medium leading-tight truncate"
                          style={{ color: isActive ? color : "#1E3A5F" }}
                        >
                          {mat.title}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">PDF</p>
                      </div>

                      {/* completed indicator */}
                      {mat.completed ? (
                        <CheckCircle2
                          className="shrink-0 w-4 h-4"
                          style={{ color: "#10B981" }}
                        />
                      ) : (
                        <Circle className="shrink-0 w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* complete lesson/exam button */}
          <div
            className="px-4 py-4 border-t"
            style={{ borderColor: "#E2E8F0" }}
          >
            <Button
              id="complete-lesson-btn"
              className="w-full text-white text-sm font-semibold h-9 transition-all"
              style={{
                background: allDone ? "#10B981" : "#3B82F6",
                border: "none",
                opacity: allDone ? 1 : 0.9,
              }}
              onClick={markAllComplete}
              disabled={allDone}
            >
              {allDone ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {isExam ? "Экзамен завершён" : "Урок завершён"}
                </>
              ) : (
                "Отметить выполненным"
              )}
            </Button>
          </div>
        </aside>

        {/* ═══════════════════════════════════════════════════════════════════
            MAIN CONTENT
        ═══════════════════════════════════════════════════════════════════ */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* mobile back */}
          <div
            className="md:hidden flex items-center gap-3 px-4 py-3 border-b"
            style={{ background: "white", borderColor: "#E2E8F0" }}
          >
            <button
              id="back-to-courses-mobile"
              onClick={() => router.push("/courses")}
              className="flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "#1E3A5F" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </button>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-gray-500 truncate">
              {lesson.title}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-4xl mx-auto w-full">
            {/* lesson title area */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-2"
                  style={{ borderColor: color, color }}
                >
                  {isExam
                    ? "Экзамен"
                    : `Урок ${String(lesson.lessonNumber).padStart(2, "0")}`}
                </Badge>
                {lesson.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[10px] h-5 px-2 text-gray-500 border-gray-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1
                className="text-xl sm:text-2xl font-bold leading-tight"
                style={{ color: "#1E3A5F" }}
              >
                {lesson.title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
            </div>

            {/* ── active material header ── */}
            {activeMaterial && (
              <div
                className="flex items-center justify-between gap-4 mb-4 px-4 py-3 rounded-xl border"
                style={{ background: "white", borderColor: "#E2E8F0" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: PDF_COLOR + "18" }}
                  >
                    <FileText
                      className="w-4 h-4"
                      style={{ color: PDF_COLOR }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#1E3A5F" }}
                    >
                      {activeMaterial.title}
                    </p>
                    {activeMaterial.description && (
                      <p className="text-xs text-gray-400">
                        {activeMaterial.description}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  id={`complete-mat-${activeMaterial.id}`}
                  size="sm"
                  className="shrink-0 h-8 text-xs font-semibold text-white"
                  style={{
                    background: activeMaterial.completed
                      ? "#10B981"
                      : "#3B82F6",
                    border: "none",
                  }}
                  onClick={() => toggleMaterial(activeMaterial.id)}
                >
                  {activeMaterial.completed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Выполнено
                    </>
                  ) : (
                    "Отметить выполненным"
                  )}
                </Button>
              </div>
            )}

            {/* ── PDF / content placeholder ── */}
            <div
              className="relative rounded-2xl border overflow-hidden"
              style={{
                background: "white",
                borderColor: "#E2E8F0",
                minHeight: "520px",
              }}
            >
              {/* top bar */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="flex items-center gap-2">
                  <BookMarked className="w-4 h-4" style={{ color }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#1E3A5F" }}
                  >
                    {activeMaterial?.title ?? "Выберите материал"}
                  </span>
                </div>
              </div>

              {/* placeholder body */}
              <div className="flex flex-col items-center justify-center py-24 px-8 gap-5">
                {/* animated PDF icon */}
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`,
                    border: `2px dashed ${color}55`,
                  }}
                >
                  <FileText className="w-12 h-12" style={{ color }} />
                </div>

                <div className="text-center max-w-sm">
                  <p
                    className="text-base font-semibold"
                    style={{ color: "#1E3A5F" }}
                  >
                    {activeMaterial
                      ? "PDF-лекция будет здесь"
                      : "Выберите материал из списка"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {activeMaterial
                      ? `Это место зарезервировано для контента «${activeMaterial.title}». Загрузите PDF-файл или встройте видео.`
                      : "Выберите материал из боковой панели, чтобы начать просмотр."}
                  </p>
                </div>

                {activeMaterial && (
                  <div
                    className="w-full max-w-xs rounded-xl border-2 border-dashed flex items-center justify-center py-8 cursor-pointer transition-colors hover:border-opacity-80"
                    style={{
                      borderColor: color + "55",
                      background: color + "06",
                    }}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Download className="w-6 h-6" style={{ color }} />
                      <p className="text-xs font-medium" style={{ color }}>
                        Загрузить PDF-лекцию
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Поддерживаются файлы .pdf
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── mobile: materials list ── */}
            <div className="md:hidden mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Материалы урока
              </p>
              <div className="space-y-2">
                {materials.map((mat) => {
                  return (
                    <div
                      key={mat.id}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl border"
                      style={{ background: "white", borderColor: "#E2E8F0" }}
                    >
                      <div
                        className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
                        style={{ background: PDF_COLOR + "18" }}
                      >
                        <FileText
                          className="w-3.5 h-3.5"
                          style={{ color: PDF_COLOR }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-medium truncate"
                          style={{ color: "#1E3A5F" }}
                        >
                          {mat.title}
                        </p>
                        <p className="text-[10px] text-gray-400">PDF</p>
                      </div>
                      <Button
                        id={`mobile-complete-mat-${mat.id}`}
                        size="sm"
                        variant={mat.completed ? "outline" : "default"}
                        className="shrink-0 h-7 text-[10px] px-2"
                        style={
                          mat.completed
                            ? { borderColor: "#10B981", color: "#10B981" }
                            : {
                                background: "#3B82F6",
                                border: "none",
                                color: "white",
                              }
                        }
                        onClick={() => toggleMaterial(mat.id)}
                      >
                        {mat.completed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Готово
                          </>
                        ) : (
                          "Выполнить"
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* mobile complete lesson/exam */}
              <Button
                id="complete-lesson-btn-mobile"
                className="w-full mt-4 text-white font-semibold h-10 transition-all"
                style={{
                  background: allDone ? "#10B981" : "#3B82F6",
                  border: "none",
                }}
                onClick={markAllComplete}
                disabled={allDone}
              >
                {allDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    {isExam ? "Экзамен завершён" : "Урок завершён"}
                  </>
                ) : (
                  "Отметить выполненным"
                )}
              </Button>
            </div>

            <div className="h-8" />
          </div>
        </main>
      </div>
    </div>
  );
}
