"use client";

import { useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import Navbar from "@/components/homepage/navbar";
import { StatsBar } from "@/components/courses/stats-bar";
import { LessonCard } from "@/components/courses/lesson-card";
import { ExamCardIndividual } from "@/components/courses/exam-card-individual";
import {
  lessons,
  exams,
  FILTER_LABELS,
  FilterType,
} from "@/components/courses/data";

// Mock logged-in user — swap this with real auth data when available
const CURRENT_USER = {
  name: "Алибек Искаков",
  email: "[EMAIL_ADDRESS]",
  initials: "АИ",
};

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState<"lessons" | "exams">("lessons");

  const filtered = lessons.filter((l) => {
    const matchesFilter = filter === "all" || l.status === filter;
    const matchesSearch =
      search.trim() === "" ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const filteredExams = exams.filter((e) => {
    const matchesSearch =
      search.trim() === "" ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      {/* Shared navbar — user prop swaps "Начать" for the profile dropdown */}
      <Navbar user={CURRENT_USER} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0.5 pt-24 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-2xl md:text-3xl font-bold mb-1"
            style={{ color: "#1E3A5F" }}
          >
            Информатика
          </h1>
          <p className="text-muted-foreground text-sm">
            15 уроков · 10 дополнительных экзаменов
          </p>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* Overall Progress Banner */}
        <Card
          className="mb-6 border-0 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
          }}
        >
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#1E3A5F" }}
                >
                  Общий прогресс курса
                </p>
                <p className="text-xs text-muted-foreground">
                  Пройдено 4 из 15 уроков
                </p>
              </div>
              <div className="flex-1 min-w-40">
                <Progress value={27} className="h-2" />
              </div>
              <span className="text-sm font-bold" style={{ color: "#3B82F6" }}>
                27%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            size="sm"
            variant={activeTab === "lessons" ? "default" : "outline"}
            onClick={() => setActiveTab("lessons")}
            className="text-xs h-8"
            style={
              activeTab === "lessons"
                ? { background: "#1E3A5F", color: "white", border: "none" }
                : {}
            }
          >
            Уроки
          </Button>
          <Button
            size="sm"
            variant={activeTab === "exams" ? "default" : "outline"}
            onClick={() => setActiveTab("exams")}
            className="text-xs h-8"
            style={
              activeTab === "exams"
                ? { background: "#1E3A5F", color: "white", border: "none" }
                : {}
            }
          >
            Дополнительные экзамены
          </Button>
        </div>

        {/* Search + Filter */}
        {activeTab === "lessons" && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="lesson-search"
                placeholder="Поиск уроков..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
                <Button
                  key={f}
                  id={`filter-${f}`}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                  onClick={() => setFilter(f)}
                  className="text-xs h-8"
                  style={
                    filter === f
                      ? {
                          background: "#1E3A5F",
                          color: "white",
                          border: "none",
                        }
                      : {}
                  }
                >
                  {FILTER_LABELS[f]}
                </Button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "exams" && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="exam-search"
                placeholder="Поиск экзаменов..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        )}

        {/* Results count */}
        <p className="text-xs text-muted-foreground mb-4">
          {activeTab === "lessons"
            ? filter === "all" && !search
              ? "Все уроки"
              : `Найдено: ${filtered.length}`
            : search
              ? `Найдено: ${filteredExams.length}`
              : "Все экзамены"}
        </p>

        {/* Cards Grid */}
        {activeTab === "lessons" ? (
          filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Уроки не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          )
        ) : (
          <>
            {/* Exams Grid */}
            {filteredExams.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Экзамены не найдены</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExams.map((exam) => (
                  <ExamCardIndividual key={exam.id} exam={exam} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
