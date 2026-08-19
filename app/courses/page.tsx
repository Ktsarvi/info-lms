import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  getTopics,
  getExams,
  getUserProgress,
  computeTopicProgress,
  computeExamProgress,
} from "@/lib/courses-data";
import { exams as mockExams } from "@/components/courses/data";
import { CoursesClientPage } from "./CoursesClientPage";
import type { ExamOverviewClient } from "@/types/courses";

export default async function CoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_subscribed, subscription_expires_at")
    .eq("id", user.id)
    .single();

  const isActive =
    !!profile?.is_subscribed &&
    (!profile.subscription_expires_at ||
      new Date(profile.subscription_expires_at) > new Date());

  if (!isActive) {
    redirect("/pricing");
  }

  const [topics, dbExams, userProgress] = await Promise.all([
    getTopics(),
    getExams(),
    getUserProgress(user.id),
  ]);

  // Compute status and progress for each topic
  const topicsWithProgress = topics.map((topic) => {
    const { status, progress } = computeTopicProgress(
      topic.sub_lesson_file_ids,
      topic.topic_file_ids,
      userProgress,
    );
    return {
      ...topic,
      status,
      progress,
    };
  });

  // Merge DB exams with display descriptions from data.ts (matched by order_index ↔ examNumber)
  // and strip exam_files so storage_path never leaks to the client bundle
  const exams: ExamOverviewClient[] = dbExams.map((dbExam) => {
    const matched = mockExams.find(
      (me) => me.examNumber === dbExam.order_index,
    );
    const { status } = computeExamProgress(
      dbExam.exam_file_ids || [],
      userProgress,
    );
    return {
      id: dbExam.id,
      order_index: dbExam.order_index,
      title: dbExam.title,
      created_at: dbExam.created_at,
      covers: dbExam.covers,
      examNumber: dbExam.order_index,
      description: matched?.description || "",
      status,
    };
  });

  // Compute page-wide aggregates for StatsBar
  const completedCount = topicsWithProgress.filter(
    (t) => t.status === "completed",
  ).length;
  const inProgressCount = topicsWithProgress.filter(
    (t) => t.status === "in-progress",
  ).length;

  const userData = {
    name: user.user_metadata?.full_name || user.user_metadata?.name || "User",
    email: user.email || "",
    initials: (
      user.user_metadata?.name?.[0] ||
      user.email?.[0] ||
      "U"
    ).toUpperCase(),
  };

  return (
    <CoursesClientPage
      topics={topicsWithProgress}
      exams={exams}
      user={userData}
      completedCount={completedCount}
      inProgressCount={inProgressCount}
    />
  );
}
