import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getTopicDetail, getUserProgress } from "@/lib/courses-data";
import { TopicDetailClient } from "./TopicDetailClient";
import type { TopicDetailForClient } from "@/types/courses";

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
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

  const [topic, progressSet] = await Promise.all([
    getTopicDetail(topicSlug),
    getUserProgress(user.id),
  ]);

  if (!topic) {
    notFound();
  }

  // Strip storage_path before passing to the client bundle
  const safeTopicForClient: TopicDetailForClient = {
    id: topic.id,
    order_index: topic.order_index,
    slug: topic.slug,
    title: topic.title,
    description: topic.description,
    created_at: topic.created_at,
    sub_lessons: topic.sub_lessons.map((sl) => ({
      id: sl.id,
      topic_id: sl.topic_id,
      order_index: sl.order_index,
      title: sl.title,
      created_at: sl.created_at,
      sub_lesson_files: sl.sub_lesson_files.map((f) => ({
        id: f.id,
        sub_lesson_id: f.sub_lesson_id,
        file_type: f.file_type,
        original_filename: f.original_filename,
        created_at: f.created_at,
      })),
    })),
    topic_files: topic.topic_files.map((tf) => ({
      id: tf.id,
      topic_id: tf.topic_id,
      original_filename: tf.original_filename,
      title: tf.title,
      created_at: tf.created_at,
    })),
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
    <TopicDetailClient
      topic={safeTopicForClient}
      user={userData}
      initialCompleted={Array.from(progressSet)}
    />
  );
}
