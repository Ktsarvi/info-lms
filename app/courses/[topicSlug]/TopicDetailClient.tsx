"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  BookOpen,
  CheckCircle2,
  Circle,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/homepage/navbar";
import { PdfViewer } from "@/components/courses/pdf-viewer";
import type { TopicDetailForClient, FileTable } from "@/types/courses";

interface SelectedFile {
  id: string;
  title: string;
  table: FileTable;
  description?: string;
}

interface TopicDetailClientProps {
  topic: TopicDetailForClient;
  user: {
    name: string;
    email: string;
    initials: string;
  };
  initialCompleted?: string[];
}

const PDF_COLOR = "#3B82F6";
const TOPIC_COLOR = "#3B82F6";

export function TopicDetailClient({
  topic,
  user,
  initialCompleted = [],
}: TopicDetailClientProps) {
  const router = useRouter();

  // Flatten all available files to easily determine default and total count
  const allFiles = useMemo(() => {
    const list: SelectedFile[] = [];

    topic.sub_lessons.forEach((sl) => {
      sl.sub_lesson_files.forEach((f) => {
        const typeLabel = f.file_type === "theory" ? "Теория" : "Тест";
        list.push({
          id: f.id,
          title: `${sl.order_index}. ${sl.title} (${typeLabel})`,
          table: "sub_lesson_files",
          description: f.original_filename,
        });
      });
    });

    topic.topic_files.forEach((tf) => {
      list.push({
        id: tf.id,
        title: tf.title || tf.original_filename,
        table: "topic_files",
        description: "Обобщающие задания",
      });
    });

    return list;
  }, [topic]);

  const [activeFile, setActiveFile] = useState<SelectedFile | null>(
    allFiles[0] ?? null,
  );

  // Persisted state for completed files (keys formatted as `${table}:${fileId}`)
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(
    () => new Set(initialCompleted),
  );

  // Accordion open/close state for sub-lessons
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = { topic_files: true };
      topic.sub_lessons.forEach((sl) => {
        initial[sl.id] = true;
      });
      return initial;
    },
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isFileDone = (table: FileTable, id: string) =>
    completedKeys.has(`${table}:${id}`);

  const toggleComplete = async (table: FileTable, fileId: string) => {
    const key = `${table}:${fileId}`;
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
        body: JSON.stringify({ fileId, table }),
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
      console.error("Failed to update progress:", err);
    }
  };

  const markAllComplete = async () => {
    const uncompleted = allFiles.filter(
      (f) => !completedKeys.has(`${f.table}:${f.id}`),
    );
    if (uncompleted.length === 0) return;

    const newlyAddedKeys = uncompleted.map((f) => `${f.table}:${f.id}`);

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
          items: uncompleted.map((f) => ({ fileId: f.id, table: f.table })),
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
      console.error("Failed to mark all complete:", err);
    }
  };

  const completedCount = allFiles.filter((f) =>
    completedKeys.has(`${f.table}:${f.id}`),
  ).length;
  const totalCount = allFiles.length;
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F8FAFC" }}
    >
      <Navbar user={user} />

      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: TOPIC_COLOR }} />

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

          {/* Topic header */}
          <div
            className="px-4 py-4 border-b"
            style={{ borderColor: "#E2E8F0" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: TOPIC_COLOR + "18",
                  color: TOPIC_COLOR,
                }}
              >
                Урок {String(topic.order_index).padStart(2, "0")}
              </span>
            </div>
            <p
              className="text-sm font-semibold leading-snug mt-1"
              style={{ color: "#1E3A5F" }}
            >
              {topic.title}
            </p>

            {/* Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Прогресс</span>
                <span style={{ color: TOPIC_COLOR }}>{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-1.5" />
              <p className="text-xs text-gray-400 mt-1">
                {completedCount} из {totalCount} материалов
              </p>
            </div>
          </div>

          {/* Sub-lessons + Files list */}
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-3">
            {topic.sub_lessons.map((sl) => {
              const isOpen = openSections[sl.id] ?? true;

              return (
                <div
                  key={sl.id}
                  className="rounded-lg border bg-white overflow-hidden"
                  style={{ borderColor: "#E2E8F0" }}
                >
                  <button
                    onClick={() => toggleSection(sl.id)}
                    className="w-full flex items-center justify-between p-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <BookOpen
                        className="w-4 h-4 shrink-0"
                        style={{ color: "#1E3A5F" }}
                      />
                      <span
                        className="text-xs font-semibold truncate"
                        style={{ color: "#1E3A5F" }}
                      >
                        {sl.order_index}. {sl.title}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div
                      className="border-t px-2 py-1 space-y-1 bg-slate-50/50"
                      style={{ borderColor: "#F1F5F9" }}
                    >
                      {[...sl.sub_lesson_files]
                        .sort((a, b) => {
                          // Theory files come first, then test files
                          if (
                            a.file_type === "theory" &&
                            b.file_type !== "theory"
                          )
                            return -1;
                          if (
                            a.file_type !== "theory" &&
                            b.file_type === "theory"
                          )
                            return 1;
                          return 0;
                        })
                        .map((file) => {
                          const isTheory = file.file_type === "theory";
                          const label = isTheory
                            ? "Теория (PDF)"
                            : "Тест (PDF)";
                          const fileTitle = `${sl.order_index}. ${sl.title} (${isTheory ? "Теория" : "Тест"})`;
                          const isActive = activeFile?.id === file.id;
                          const isDone = isFileDone(
                            "sub_lesson_files",
                            file.id,
                          );

                          return (
                            <button
                              key={file.id}
                              id={`sidebar-file-${file.id}`}
                              onClick={() =>
                                setActiveFile({
                                  id: file.id,
                                  title: fileTitle,
                                  table: "sub_lesson_files",
                                  description: file.original_filename,
                                })
                              }
                              className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left transition-all text-xs cursor-pointer"
                              style={{
                                background: isActive
                                  ? TOPIC_COLOR + "15"
                                  : "transparent",
                                border: isActive
                                  ? `1px solid ${TOPIC_COLOR}40`
                                  : "1px solid transparent",
                              }}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText
                                  className="w-3.5 h-3.5 shrink-0"
                                  style={{
                                    color: isTheory ? "#3B82F6" : "#F59E0B",
                                  }}
                                />
                                <span
                                  className="truncate"
                                  style={{
                                    color: isActive ? TOPIC_COLOR : "#334155",
                                    fontWeight: isActive ? 600 : 400,
                                  }}
                                >
                                  {label}
                                </span>
                              </div>
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Topic-level review files */}
            {topic.topic_files.length > 0 && (
              <div
                className="rounded-lg border bg-white overflow-hidden"
                style={{ borderColor: "#E2E8F0" }}
              >
                <button
                  onClick={() => toggleSection("topic_files")}
                  className="w-full flex items-center justify-between p-2.5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <FolderOpen
                      className="w-4 h-4 shrink-0"
                      style={{ color: "#8B5CF6" }}
                    />
                    <span className="text-xs font-semibold text-[#1E3A5F] truncate">
                      Обобщающие задания
                    </span>
                  </div>
                  {openSections.topic_files ? (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  )}
                </button>

                {openSections.topic_files && (
                  <div
                    className="border-t px-2 py-1 space-y-1 bg-slate-50/50"
                    style={{ borderColor: "#F1F5F9" }}
                  >
                    {topic.topic_files.map((file) => {
                      const fileTitle = file.title || file.original_filename;
                      const isActive = activeFile?.id === file.id;
                      const isDone = isFileDone("topic_files", file.id);

                      return (
                        <button
                          key={file.id}
                          id={`sidebar-topic-file-${file.id}`}
                          onClick={() =>
                            setActiveFile({
                              id: file.id,
                              title: fileTitle,
                              table: "topic_files",
                              description: file.original_filename,
                            })
                          }
                          className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left transition-all text-xs cursor-pointer"
                          style={{
                            background: isActive
                              ? TOPIC_COLOR + "15"
                              : "transparent",
                            border: isActive
                              ? `1px solid ${TOPIC_COLOR}40`
                              : "1px solid transparent",
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ color: "#8B5CF6" }}
                            />
                            <span
                              className="truncate"
                              style={{
                                color: isActive ? TOPIC_COLOR : "#334155",
                                fontWeight: isActive ? 600 : 400,
                              }}
                            >
                              {fileTitle}
                            </span>
                          </div>
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Complete topic button */}
          <div
            className="px-4 py-4 border-t"
            style={{ borderColor: "#E2E8F0" }}
          >
            <Button
              id="complete-topic-btn"
              className="w-full text-white text-sm font-semibold h-9 transition-all cursor-pointer"
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
                  Урок завершён
                </>
              ) : (
                "Отметить все выполненными"
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
            <span className="text-sm text-gray-500 truncate">
              {topic.title}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full">
            {/* Header info */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-2"
                  style={{ borderColor: TOPIC_COLOR, color: TOPIC_COLOR }}
                >
                  Урок {String(topic.order_index).padStart(2, "0")}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-2 text-gray-500 border-gray-200"
                >
                  {topic.sub_lessons.length} подтем
                </Badge>
              </div>
              <h1
                className="text-xl sm:text-2xl font-bold leading-tight"
                style={{ color: "#1E3A5F" }}
              >
                {topic.title}
              </h1>
              {topic.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {topic.description}
                </p>
              )}
            </div>

            {/* Active file banner + toggle completed button */}
            {activeFile && (
              <div
                className="flex items-center justify-between gap-4 mb-4 px-4 py-3 rounded-xl border bg-white"
                style={{ borderColor: "#E2E8F0" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: PDF_COLOR + "18" }}
                  >
                    <FileText
                      className="w-4 h-4"
                      style={{ color: PDF_COLOR }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "#1E3A5F" }}
                    >
                      {activeFile.title}
                    </p>
                    {activeFile.description && (
                      <p className="text-xs text-gray-400 truncate">
                        {activeFile.description}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  id={`complete-file-${activeFile.id}`}
                  size="sm"
                  className="shrink-0 h-8 text-xs font-semibold text-white cursor-pointer"
                  style={{
                    background: isFileDone(activeFile.table, activeFile.id)
                      ? "#10B981"
                      : "#3B82F6",
                    border: "none",
                  }}
                  onClick={() =>
                    toggleComplete(activeFile.table, activeFile.id)
                  }
                >
                  {isFileDone(activeFile.table, activeFile.id) ? (
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

            {/* ── Secure PDF Viewer ── */}
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
                  table={activeFile.table}
                  userEmail={user.email}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-24 px-8 text-center text-muted-foreground">
                  <BookOpen className="w-12 h-12 mb-3 opacity-40" />
                  <p className="text-sm font-medium">
                    Выберите материал для просмотра
                  </p>
                </div>
              )}
            </div>

            {/* ── Mobile: Material Picker ── */}
            <div className="md:hidden mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Все материалы урока
              </p>
              <div className="space-y-2">
                {allFiles.map((file) => {
                  const isActive = activeFile?.id === file.id;
                  const isDone = isFileDone(file.table, file.id);

                  return (
                    <div
                      key={file.id}
                      onClick={() => setActiveFile(file)}
                      className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl border bg-white cursor-pointer"
                      style={{
                        borderColor: isActive ? TOPIC_COLOR : "#E2E8F0",
                        background: isActive ? TOPIC_COLOR + "08" : "white",
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText
                          className="w-4 h-4 shrink-0"
                          style={{ color: PDF_COLOR }}
                        />
                        <div className="min-w-0">
                          <p
                            className="text-xs font-medium truncate"
                            style={{
                              color: isActive ? TOPIC_COLOR : "#1E3A5F",
                            }}
                          >
                            {file.title}
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
                                background: "#3B82F6",
                                border: "none",
                                color: "white",
                              }
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(file.table, file.id);
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
