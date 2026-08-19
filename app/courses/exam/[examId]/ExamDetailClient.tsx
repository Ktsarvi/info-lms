"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  Circle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/homepage/navbar";
import { PdfViewer } from "@/components/courses/pdf-viewer";
import type { ExamDisplayClient, ExamFileClient } from "@/types/courses";

interface ExamDetailClientProps {
  exam: ExamDisplayClient;
  user: {
    name: string;
    email: string;
    initials: string;
  };
  initialCompleted?: string[];
}

const EXAM_COLOR = "#F59E0B";

export function ExamDetailClient({
  exam,
  user,
  initialCompleted = [],
}: ExamDetailClientProps) {
  const router = useRouter();

  const files = exam.exam_files;
  const [activeFile, setActiveFile] = useState<ExamFileClient | null>(
    files[0] ?? null,
  );
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(
    () => new Set(initialCompleted),
  );

  const isFileDone = (fileId: string) =>
    completedKeys.has(`exam_files:${fileId}`);

  const toggleComplete = async (fileId: string) => {
    const key = `exam_files:${fileId}`;
    const isDone = completedKeys.has(key);

    // Optimistic update
    setCompletedKeys((prev) => {
      const next = new Set(prev);
      if (isDone) next.delete(key);
      else next.add(key);
      return next;
    });

    try {
      const res = await fetch("/api/progress", {
        method: isDone ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, table: "exam_files" }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      // Revert on failure
      setCompletedKeys((prev) => {
        const next = new Set(prev);
        if (isDone) next.add(key);
        else next.delete(key);
        return next;
      });
      console.error("Failed to update exam progress:", err);
    }
  };

  const isExamCompleted =
    files.length > 0 && files.every((f) => isFileDone(f.id));

  const markAllComplete = async () => {
    const uncompleted = files.filter((f) => !isFileDone(f.id));
    if (uncompleted.length === 0) return;

    const newlyAddedKeys = uncompleted.map((f) => `exam_files:${f.id}`);

    // Optimistic update
    setCompletedKeys((prev) => {
      const next = new Set(prev);
      newlyAddedKeys.forEach((k) => next.add(k));
      return next;
    });

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: uncompleted.map((f) => ({
            fileId: f.id,
            table: "exam_files",
          })),
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      // Revert on failure
      setCompletedKeys((prev) => {
        const next = new Set(prev);
        newlyAddedKeys.forEach((k) => next.delete(k));
        return next;
      });
      console.error("Failed to mark all exam files complete:", err);
    }
  };

  const getFileLabel = (f: ExamFileClient) => {
    if (f.file_type === "exam") return "Экзаменационный тест";
    return "Ключ ответов";
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F8FAFC" }}
    >
      <Navbar user={user} />

      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: EXAM_COLOR }} />

      <div className="flex flex-1 pt-20">
        {/* ═══════════════════════════════════════════════════════════════════
            SIDEBAR (Desktop)
        ═══════════════════════════════════════════════════════════════════ */}
        <aside
          className="hidden md:flex flex-col w-80 shrink-0 border-r"
          style={{
            background: "#F8FAFC",
            borderColor: "#E2E8F0",
            minHeight: "calc(100vh - 5rem)",
          }}
        >
          {/* Back button */}
          <div
            className="px-4 pt-5 pb-4 border-b"
            style={{ borderColor: "#E2E8F0" }}
          >
            <button
              id="back-to-courses"
              onClick={() => router.push("/courses")}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70 cursor-pointer"
              style={{ color: "#1E3A5F" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к курсам
            </button>
          </div>

          {/* Exam Header */}
          <div
            className="px-4 py-4 border-b"
            style={{ borderColor: "#E2E8F0" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: EXAM_COLOR + "22",
                  color: "#D97706",
                }}
              >
                Экзамен {String(exam.examNumber).padStart(2, "0")}
              </span>
            </div>
            <p
              className="text-sm font-semibold leading-snug mt-1"
              style={{ color: "#1E3A5F" }}
            >
              {exam.title}
            </p>
            {exam.description && (
              <p className="text-xs text-gray-500 mt-1">{exam.description}</p>
            )}

            {exam.covers.length > 0 && (
              <div className="mt-2.5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Охватывает:
                </p>
                <div className="flex flex-wrap gap-1">
                  {exam.covers.map((cov) => (
                    <Badge
                      key={cov}
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 bg-white text-blue-700 border-blue-200"
                    >
                      {cov}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1.5">
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Материалы экзамена
            </p>

            {files.length === 0 ? (
              <p className="text-xs text-gray-400 px-2 py-2">
                Файлы пока не добавлены
              </p>
            ) : (
              files.map((file) => {
                const label = getFileLabel(file);
                const isActive = activeFile?.id === file.id;
                const isDone = isFileDone(file.id);

                return (
                  <button
                    key={file.id}
                    id={`sidebar-exam-file-${file.id}`}
                    onClick={() => setActiveFile(file)}
                    className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-all text-xs cursor-pointer"
                    style={{
                      background: isActive ? EXAM_COLOR + "18" : "transparent",
                      border: isActive
                        ? `1px solid ${EXAM_COLOR}50`
                        : "1px solid transparent",
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText
                        className="w-4 h-4 shrink-0"
                        style={{
                          color:
                            file.file_type === "exam" ? "#3B82F6" : "#10B981",
                        }}
                      />
                      <div className="min-w-0">
                        <span
                          className="truncate block"
                          style={{
                            color: isActive ? "#B45309" : "#1E3A5F",
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {label}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate block">
                          {file.original_filename}
                        </span>
                      </div>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Mark Exam Complete */}
          <div
            className="px-4 py-4 border-t"
            style={{ borderColor: "#E2E8F0" }}
          >
            <Button
              id="complete-exam-btn"
              className="w-full text-white text-sm font-semibold h-9 transition-all cursor-pointer"
              style={{
                background: isExamCompleted ? "#10B981" : "#F59E0B",
                border: "none",
              }}
              onClick={markAllComplete}
              disabled={isExamCompleted}
            >
              {isExamCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Экзамен завершён
                </>
              ) : (
                "Отметить выполненным"
              )}
            </Button>
          </div>
        </aside>

        {/* ═══════════════════════════════════════════════════════════════════
            MAIN CONTENT AREA
        ═══════════════════════════════════════════════════════════════════ */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Back Bar */}
          <div
            className="md:hidden flex items-center gap-3 px-4 py-3 border-b"
            style={{ background: "white", borderColor: "#E2E8F0" }}
          >
            <button
              id="back-to-courses-mobile"
              onClick={() => router.push("/courses")}
              className="flex items-center gap-1.5 text-sm font-medium cursor-pointer"
              style={{ color: "#1E3A5F" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </button>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-gray-500 truncate">{exam.title}</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full">
            {/* Header info */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-2 bg-amber-50 text-amber-700 border-amber-300"
                >
                  Экзамен {String(exam.examNumber).padStart(2, "0")}
                </Badge>
                {exam.covers.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 px-2 text-blue-700 border-blue-200"
                  >
                    {exam.covers.join(" · ")}
                  </Badge>
                )}
              </div>
              <h1
                className="text-xl sm:text-2xl font-bold leading-tight"
                style={{ color: "#1E3A5F" }}
              >
                {exam.title}
              </h1>
              {exam.description && (
                <p className="text-sm text-gray-500 mt-1">{exam.description}</p>
              )}
            </div>

            {/* Active File Bar */}
            {activeFile && (
              <div
                className="flex items-center justify-between gap-4 mb-4 px-4 py-3 rounded-xl border bg-white"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: EXAM_COLOR + "20" }}
                  >
                    <FileText
                      className="w-4 h-4"
                      style={{ color: "#D97706" }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "#1E3A5F" }}
                    >
                      {getFileLabel(activeFile)}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {activeFile.original_filename}
                    </p>
                  </div>
                </div>

                <Button
                  id={`complete-exam-file-${activeFile.id}`}
                  size="sm"
                  className="shrink-0 h-8 text-xs font-semibold text-white cursor-pointer"
                  style={{
                    background: isFileDone(activeFile.id)
                      ? "#10B981"
                      : "#F59E0B",
                    border: "none",
                  }}
                  onClick={() => toggleComplete(activeFile.id)}
                >
                  {isFileDone(activeFile.id) ? (
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

            {/* ── Secure PDF / PNG Viewer ── */}
            <div
              className="rounded-2xl border overflow-hidden bg-white shadow-sm"
              style={{
                borderColor: "#E2E8F0",
                minHeight: "560px",
              }}
            >
              {activeFile ? (
                <PdfViewer
                  fileId={activeFile.id}
                  table="exam_files"
                  userEmail={user.email}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-24 px-8 text-center text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mb-3 opacity-40 text-amber-500" />
                  <p className="text-sm font-medium">
                    Для этого экзамена пока нет доступных файлов
                  </p>
                </div>
              )}
            </div>

            {/* ── Mobile: Material Picker ── */}
            <div className="md:hidden mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Материалы экзамена
              </p>
              <div className="space-y-2">
                {files.map((file) => {
                  const label = getFileLabel(file);
                  const isActive = activeFile?.id === file.id;
                  const isDone = isFileDone(file.id);

                  return (
                    <div
                      key={file.id}
                      onClick={() => setActiveFile(file)}
                      className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl border bg-white cursor-pointer"
                      style={{
                        borderColor: isActive ? EXAM_COLOR : "#E2E8F0",
                        background: isActive ? EXAM_COLOR + "08" : "white",
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText
                          className="w-4 h-4 shrink-0"
                          style={{
                            color:
                              file.file_type === "exam" ? "#3B82F6" : "#10B981",
                          }}
                        />
                        <div className="min-w-0">
                          <p
                            className="text-xs font-medium truncate"
                            style={{
                              color: isActive ? "#B45309" : "#1E3A5F",
                            }}
                          >
                            {label}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {file.original_filename}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isDone ? "outline" : "default"}
                        className="shrink-0 h-7 text-[10px] px-2"
                        style={
                          isDone
                            ? { borderColor: "#10B981", color: "#10B981" }
                            : {
                                background: "#F59E0B",
                                border: "none",
                                color: "white",
                              }
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(file.id);
                        }}
                      >
                        {isDone ? "Готово" : "Выполнить"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-8" />
          </div>
        </main>
      </div>
    </div>
  );
}
