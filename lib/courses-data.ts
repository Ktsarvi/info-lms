import { createClient } from "@/utils/supabase/server";
import type {
  TopicWithSubLessons,
  TopicDetail,
  ExamWithFiles,
} from "@/types/courses";
import type { LessonStatus, ExamStatus } from "@/components/courses/data";

// ─── Topics list ─────────────────────────────────────────────────────────────

/**
 * Fetch all topics ordered by order_index, with a count of their sub-lessons
 * and file IDs for progress computation.
 * Uses the server Supabase client (requires cookies → call from Server Components / Route Handlers).
 */
export async function getTopics(): Promise<TopicWithSubLessons[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("topics")
    .select(
      `
      id,
      order_index,
      slug,
      title,
      description,
      created_at,
      sub_lessons (
        id,
        sub_lesson_files (id)
      ),
      topic_files (id)
    `,
    )
    .order("order_index");

  if (error) throw new Error(`getTopics: ${error.message}`);

  return (data ?? []).map((row) => {
    const subLessons = (row.sub_lessons as any[]) ?? [];
    return {
      id: row.id,
      order_index: row.order_index,
      slug: row.slug,
      title: row.title,
      description: row.description,
      created_at: row.created_at,
      // Compute count from nested data instead of aggregate
      sub_lesson_count: subLessons.length,
      // File IDs for progress computation
      sub_lesson_file_ids: subLessons.flatMap((sl) =>
        (sl.sub_lesson_files ?? []).map((f: any) => f.id),
      ),
      topic_file_ids: (row.topic_files ?? []).map((f: any) => f.id),
    };
  });
}

// ─── Topic detail ─────────────────────────────────────────────────────────────

/**
 * Fetch a single topic by slug, with all sub-lessons (ordered) + their files,
 * plus topic-level files.
 */
export async function getTopicDetail(
  slug: string,
): Promise<TopicDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("topics")
    .select(
      `
      id,
      order_index,
      slug,
      title,
      description,
      created_at,
      sub_lessons (
        id,
        topic_id,
        order_index,
        title,
        created_at,
        sub_lesson_files (
          id,
          sub_lesson_id,
          file_type,
          storage_path,
          original_filename,
          created_at
        )
      ),
      topic_files (
        id,
        topic_id,
        storage_path,
        original_filename,
        title,
        created_at
      )
    `,
    )
    .eq("slug", slug)
    .order("order_index", { referencedTable: "sub_lessons" })
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // no rows
    throw new Error(`getTopicDetail: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    order_index: data.order_index,
    slug: data.slug,
    title: data.title,
    description: data.description,
    created_at: data.created_at,
    sub_lessons: (data.sub_lessons ?? []).map((sl) => ({
      id: sl.id,
      topic_id: sl.topic_id,
      order_index: sl.order_index,
      title: sl.title,
      created_at: sl.created_at,
      sub_lesson_files: sl.sub_lesson_files ?? [],
    })),
    topic_files: data.topic_files ?? [],
  };
}

// ─── Exams list ───────────────────────────────────────────────────────────────

/**
 * Fetch all exams ordered by order_index with their files and the topic titles
 * they cover (via exam_topics → topics join).
 */
export async function getExams(): Promise<ExamWithFiles[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exams")
    .select(
      `
      id,
      order_index,
      title,
      created_at,
      exam_files (
        id,
        exam_id,
        file_type,
        storage_path,
        original_filename,
        created_at
      ),
      exam_topics (
        topics (
          title
        )
      )
    `,
    )
    .order("order_index");

  if (error) throw new Error(`getExams: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    order_index: row.order_index,
    title: row.title,
    created_at: row.created_at,
    exam_files: row.exam_files ?? [],
    exam_file_ids: (row.exam_files ?? []).map((f: any) => f.id),
    covers:
      (
        row.exam_topics as unknown as Array<{
          topics: { title: string } | { title: string }[] | null;
        }>
      )
        ?.map((et) => {
          if (!et?.topics) return [];
          if (Array.isArray(et.topics)) {
            return et.topics.map((t) => t.title).filter(Boolean);
          }
          return [et.topics.title];
        })
        .flat()
        .filter(Boolean) ?? [],
  }));
}

// ─── Single Exam detail ───────────────────────────────────────────────────────

/**
 * Fetch a single exam by ID with its files and covered topic titles.
 */
export async function getExamDetail(
  examId: string,
): Promise<ExamWithFiles | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exams")
    .select(
      `
      id,
      order_index,
      title,
      created_at,
      exam_files (
        id,
        exam_id,
        file_type,
        storage_path,
        original_filename,
        created_at
      ),
      exam_topics (
        topics (
          title
        )
      )
    `,
    )
    .eq("id", examId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`getExamDetail: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    order_index: data.order_index,
    title: data.title,
    created_at: data.created_at,
    exam_files: data.exam_files ?? [],
    exam_file_ids: (data.exam_files ?? []).map((f: any) => f.id),
    covers:
      (
        data.exam_topics as unknown as Array<{
          topics: { title: string } | { title: string }[] | null;
        }>
      )
        ?.map((et) => {
          if (!et?.topics) return [];
          if (Array.isArray(et.topics)) {
            return et.topics.map((t) => t.title).filter(Boolean);
          }
          return [et.topics.title];
        })
        .flat()
        .filter(Boolean) ?? [],
  };
}

// ─── Progress Computation Helpers ──────────────────────────────────────────────

/**
 * Compute topic status and progress from file IDs and user progress set.
 */
export function computeTopicProgress(
  subLessonFileIds: string[],
  topicFileIds: string[],
  userProgress: Set<string>,
): { status: LessonStatus; progress: number } {
  const total = subLessonFileIds.length + topicFileIds.length;

  if (total === 0) {
    return { status: "not-started", progress: 0 };
  }

  let completed = 0;
  for (const id of subLessonFileIds) {
    if (userProgress.has(`sub_lesson_files:${id}`)) {
      completed++;
    }
  }
  for (const id of topicFileIds) {
    if (userProgress.has(`topic_files:${id}`)) {
      completed++;
    }
  }

  const progress = Math.round((completed / total) * 100);

  let status: LessonStatus;
  if (completed === 0) {
    status = "not-started";
  } else if (completed === total) {
    status = "completed";
  } else {
    status = "in-progress";
  }

  return { status, progress };
}

/**
 * Compute exam status from exam file IDs and user progress set.
 */
export function computeExamProgress(
  examFileIds: string[],
  userProgress: Set<string>,
): { status: ExamStatus } {
  if (examFileIds.length === 0) {
    return { status: "not-started" };
  }

  let completed = 0;
  for (const id of examFileIds) {
    if (userProgress.has(`exam_files:${id}`)) {
      completed++;
    }
  }

  const status: ExamStatus =
    completed === examFileIds.length ? "completed" : "not-started";
  return { status };
}

// ─── User Progress ────────────────────────────────────────────────────────────

/**
 * Fetch all completed file entries from user_progress for the given user,
 * returning a Set of string keys in the format `${file_table}:${file_id}`.
 */
export async function getUserProgress(userId: string): Promise<Set<string>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_progress")
    .select("file_id, file_table")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`getUserProgress: ${error.message}`);
  }

  const set = new Set<string>();
  (data ?? []).forEach((row) => {
    set.add(`${row.file_table}:${row.file_id}`);
  });

  return set;
}
