import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getExamDetail, getUserProgress } from "@/lib/courses-data";
import { exams as mockExams } from "@/components/courses/data";
import { ExamDetailClient } from "./ExamDetailClient";
import type { ExamDisplayClient } from "@/types/courses";

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
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

  const [dbExam, progressSet] = await Promise.all([
    getExamDetail(examId),
    getUserProgress(user.id),
  ]);

  if (!dbExam) {
    notFound();
  }

  const matched = mockExams.find((me) => me.examNumber === dbExam.order_index);

  // Strip storage_path before passing to the client bundle
  const exam: ExamDisplayClient = {
    id: dbExam.id,
    order_index: dbExam.order_index,
    title: dbExam.title,
    created_at: dbExam.created_at,
    covers: dbExam.covers,
    exam_files: dbExam.exam_files.map((f) => ({
      id: f.id,
      exam_id: f.exam_id,
      file_type: f.file_type,
      original_filename: f.original_filename,
      created_at: f.created_at,
    })),
    examNumber: dbExam.order_index,
    description: matched?.description || "",
  };

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
    <ExamDetailClient
      exam={exam}
      user={userData}
      initialCompleted={Array.from(progressSet)}
    />
  );
}
