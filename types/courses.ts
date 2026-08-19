import type { LessonStatus, ExamStatus } from "@/components/courses/data";

// ─── Primitive DB rows ──────────────────────────────────────────────────────

export interface TopicRow {
  id: string;
  order_index: number;
  slug: string;
  title: string;
  description: string | null;
  created_at: string;
}

export interface SubLessonRow {
  id: string;
  topic_id: string;
  order_index: number;
  title: string;
  created_at: string;
}

export interface SubLessonFile {
  id: string;
  sub_lesson_id: string;
  file_type: "theory" | "test";
  storage_path: string;
  original_filename: string;
  created_at: string;
}

export interface TopicFile {
  id: string;
  topic_id: string;
  storage_path: string;
  original_filename: string;
  title: string | null;
  created_at: string;
}

export interface ExamRow {
  id: string;
  order_index: number;
  title: string;
  created_at: string;
}

export interface ExamFile {
  id: string;
  exam_id: string;
  file_type: "exam" | "answer_key";
  storage_path: string;
  original_filename: string;
  created_at: string;
}

// ─── Server query shapes (includes storage_path) ─────────────────────────────

/** Topic with count of sub-lessons and file IDs for progress — used in the courses list */
export interface TopicWithSubLessons extends TopicRow {
  sub_lesson_count: number;
  sub_lesson_file_ids: string[];
  topic_file_ids: string[];
  status?: LessonStatus;
  progress?: number;
}

/** Sub-lesson with its files — used in the topic detail view */
export interface SubLessonWithFiles extends SubLessonRow {
  sub_lesson_files: SubLessonFile[];
}

/** Full topic detail — returned by getTopicDetail */
export interface TopicDetail extends TopicRow {
  sub_lessons: SubLessonWithFiles[];
  topic_files: TopicFile[];
}

/** Exam with its files and the topic titles it covers — returned by getExams / getExamDetail */
export interface ExamWithFiles extends ExamRow {
  exam_files: ExamFile[];
  /** topic titles this exam covers, derived from exam_topics join */
  covers: string[];
  /** file IDs for progress computation */
  exam_file_ids?: string[];
}

/** Exam enriched with display text from data.ts */
export interface ExamDisplay extends ExamWithFiles {
  examNumber: number;
  description: string;
}

// ─── Client-safe file shapes (no storage_path) ──────────────────────────────

export type SubLessonFileClient = Omit<SubLessonFile, "storage_path">;
export type TopicFileClient = Omit<TopicFile, "storage_path">;
export type ExamFileClient = Omit<ExamFile, "storage_path">;

// ─── Client-safe composed shapes ────────────────────────────────────────────

export interface SubLessonWithFilesClient extends SubLessonRow {
  sub_lesson_files: SubLessonFileClient[];
}

export interface TopicDetailForClient extends TopicRow {
  sub_lessons: SubLessonWithFilesClient[];
  topic_files: TopicFileClient[];
}

export interface ExamWithFilesClient extends ExamRow {
  exam_files: ExamFileClient[];
  covers: string[];
}

export interface ExamDisplayClient extends ExamWithFilesClient {
  examNumber: number;
  description: string;
}

/** Overview shape for the courses list page where exam_files is not needed */
export interface ExamOverviewClient extends ExamRow {
  covers: string[];
  examNumber: number;
  description: string;
  status?: ExamStatus;
}

// ─── Viewer-related ──────────────────────────────────────────────────────────

export type FileTable = "sub_lesson_files" | "topic_files" | "exam_files";

export interface SignedFileResponse {
  signedUrl: string;
  fileType: "pdf" | "png";
}
