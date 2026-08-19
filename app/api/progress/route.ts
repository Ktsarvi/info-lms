import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { FileTable } from "@/types/courses";

const ALLOWED_TABLES: FileTable[] = [
  "sub_lesson_files",
  "topic_files",
  "exam_files",
];

interface ProgressRequestBody {
  fileId?: string;
  table?: FileTable;
  items?: Array<{
    fileId: string;
    table: FileTable;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProgressRequestBody;
    const supabase = await createClient();

    // ── authenticate ─────────────────────────────────────────────────────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── verify subscription ──────────────────────────────────────────────────
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

    // ── collect records to upsert ────────────────────────────────────────────
    const records: Array<{
      user_id: string;
      file_id: string;
      file_table: FileTable;
    }> = [];

    if (Array.isArray(body.items) && body.items.length > 0) {
      for (const item of body.items) {
        if (item.fileId && item.table && ALLOWED_TABLES.includes(item.table)) {
          records.push({
            user_id: user.id,
            file_id: item.fileId,
            file_table: item.table,
          });
        }
      }
    } else if (
      body.fileId &&
      body.table &&
      ALLOWED_TABLES.includes(body.table)
    ) {
      records.push({
        user_id: user.id,
        file_id: body.fileId,
        file_table: body.table,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 },
      );
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: "No valid records provided" },
        { status: 400 },
      );
    }

    const { error: upsertError } = await supabase
      .from("user_progress")
      .upsert(records, { onConflict: "user_id,file_id,file_table" });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json()) as ProgressRequestBody;
    const supabase = await createClient();

    // ── authenticate ─────────────────────────────────────────────────────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── verify subscription ──────────────────────────────────────────────────
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

    // ── delete record ────────────────────────────────────────────────────────
    if (!body.fileId || !body.table || !ALLOWED_TABLES.includes(body.table)) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 },
      );
    }

    const { error: deleteError } = await supabase
      .from("user_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("file_id", body.fileId)
      .eq("file_table", body.table);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
