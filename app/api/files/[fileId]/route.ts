import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { FileTable, SignedFileResponse } from "@/types/courses";

const ALLOWED_TABLES: FileTable[] = [
  "sub_lesson_files",
  "topic_files",
  "exam_files",
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;
  const { searchParams } = _req.nextUrl;
  const table = searchParams.get("table") as FileTable | null;

  // ── validate inputs ──────────────────────────────────────────────────────
  if (!fileId || !table || !ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const supabase = await createClient();

  // ── authenticate ─────────────────────────────────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── verify subscription (re-check server-side, do not rely solely on RLS) ─
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
    return NextResponse.json(
      { error: "Subscription required" },
      { status: 403 },
    );
  }

  // ── look up storage_path from the correct table ──────────────────────────
  const { data: fileRow, error: rowError } = await supabase
    .from(table)
    .select("storage_path, original_filename")
    .eq("id", fileId)
    .single();

  if (rowError || !fileRow) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // ── generate a short-lived signed URL (60 s — enough to fetch bytes) ─────
  const { data: signed, error: signError } = await supabase.storage
    .from("courses")
    .createSignedUrl(fileRow.storage_path, 60);

  if (signError || !signed) {
    return NextResponse.json(
      { error: "Could not generate URL" },
      { status: 500 },
    );
  }

  // ── determine file type from extension ───────────────────────────────────
  const ext = fileRow.original_filename.split(".").pop()?.toLowerCase();
  const fileType: SignedFileResponse["fileType"] =
    ext === "png" ? "png" : "pdf";

  const body: SignedFileResponse = {
    signedUrl: signed.signedUrl,
    fileType,
  };

  // Cache-Control: no-store so the signed URL is never cached by CDN/browser
  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store" },
  });
}
