"use client";

import {
  ArrowRight,
  BookOpen,
  FileText,
  TrendingUp,
  Award,
  CheckCircle2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BookOpen,
    title: "All courses, all topics",
    desc: "Access our entire library of courses",
  },
  {
    icon: CheckCircle2,
    title: "Lesson tests & quizzes",
    desc: "Test your knowledge after each lesson",
  },
  {
    icon: FileText,
    title: "Downloadable PDFs",
    desc: "Offline study materials included",
  },
  {
    icon: TrendingUp,
    title: "Progress tracking",
    desc: "Detailed reports and achievements",
  },
  {
    icon: Award,
    title: "Verified certificates",
    desc: "Industry-recognized on completion",
  },
];

const HeroFeatures = () => {
  return (
    <section
      className="pt-28 pb-24 px-4 sm:px-6 lg:px-8"
      style={{ background: "#F8FAFC" }}
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT — Text & CTA */}
        <div>
          <div
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
              color: "#3B82F6",
            }}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Trusted by 10,000+ learners
          </div>

          <h1
            className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-5"
            style={{ color: "#1E3A5F" }}
          >
            Master any skill with{" "}
            <span style={{ color: "#3B82F6" }}>expert-led courses</span>
          </h1>

          <p
            className="text-base leading-relaxed mb-8 max-w-md"
            style={{ color: "#64748B" }}
          >
            Access unlimited courses, track your progress, and earn verified
            certificates. Start your learning journey today.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Button
              size="lg"
              className="text-white font-medium px-8 py-6 text-lg"
              style={{ background: "#3B82F6", border: "none" }}
            >
              Get started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { num: "500+", label: "Courses" },
              { num: "50+", label: "Instructors" },
              { num: "10K+", label: "Students" },
              { num: "4.9★", label: "Rating" },
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
            What you get
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
