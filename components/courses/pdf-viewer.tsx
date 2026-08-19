"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FileTable } from "@/types/courses";

// Use the public-hosted worker — works with both Turbopack (dev) and webpack (prod)
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfViewerProps {
  fileId: string;
  table: FileTable;
  userEmail: string;
}

export function PdfViewer({ fileId, table, userEmail }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<ReturnType<PDFPageProxy["render"]> | null>(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"pdf" | "png" | null>(null);

  // ── fetch signed URL on mount ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setPdfDoc(null);
      setImgSrc(null);
      setCurrentPage(1);
      setTotalPages(0);

      try {
        const res = await fetch(
          `/api/files/${encodeURIComponent(fileId)}?table=${encodeURIComponent(table)}`,
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const { signedUrl, fileType: ft } = await res.json();
        if (cancelled) return;

        setFileType(ft);

        if (ft === "png") {
          setImgSrc(signedUrl);
          setLoading(false);
          return;
        }

        // Load PDF
        const loadingTask = pdfjs.getDocument({ url: signedUrl });
        const doc = await loadingTask.promise;
        if (cancelled) {
          loadingTask.destroy();
          return;
        }
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Ошибка загрузки файла");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fileId, table]);

  // ── render current page to canvas ─────────────────────────────────────────
  const renderPage = useCallback(
    async (doc: PDFDocumentProxy, pageNum: number, sc: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: sc });

      // Account for device pixel ratio for sharp rendering on Retina/high-DPI screens
      const dpr = window.devicePixelRatio || 1;

      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;

      // Keep the CSS-displayed size the same as before (so layout doesn't change)
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Scale the drawing context so PDF content renders at full DPR resolution
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const renderTask = page.render({ canvas, canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
      } catch {
        return;
      }

      // Watermark also needs the same scale applied, or it'll draw at the wrong size
      drawWatermark(ctx, viewport.width, viewport.height, userEmail);
    },
    [userEmail],
  );

  useEffect(() => {
    if (!pdfDoc) return;
    renderPage(pdfDoc, currentPage, scale);
  }, [pdfDoc, currentPage, scale, renderPage]);

  // ── helpers ───────────────────────────────────────────────────────────────
  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const zoomIn = () => setScale((s) => Math.min(3, +(s + 0.2).toFixed(1)));
  const zoomOut = () => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(1)));

  // ── states ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#3B82F6" }}
        />
        <p className="text-sm">Загрузка файла...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle className="w-8 h-8" style={{ color: "#EF4444" }} />
        <p className="text-sm font-medium" style={{ color: "#1E3A5F" }}>
          Не удалось загрузить файл
        </p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  // PNG image viewer
  if (fileType === "png" && imgSrc) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt="Ключ ответов"
          className="max-w-full rounded-lg shadow-md"
          style={{ maxHeight: "80vh", objectFit: "contain" }}
        />
        <p className="text-xs text-muted-foreground">
          Ключ ответов — {userEmail}
        </p>
      </div>
    );
  }

  // PDF viewer
  return (
    <div className="flex flex-col">
      {/* toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b sticky top-0 z-10"
        style={{ background: "white", borderColor: "#E2E8F0" }}
      >
        {/* page nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-md disabled:opacity-40 hover:bg-gray-100 transition-colors"
            aria-label="Предыдущая страница"
          >
            <ChevronLeft className="w-4 h-4" style={{ color: "#1E3A5F" }} />
          </button>
          <span className="text-xs font-medium" style={{ color: "#1E3A5F" }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-md disabled:opacity-40 hover:bg-gray-100 transition-colors"
            aria-label="Следующая страница"
          >
            <ChevronRight className="w-4 h-4" style={{ color: "#1E3A5F" }} />
          </button>
        </div>

        {/* zoom */}
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Уменьшить"
          >
            <ZoomOut className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-xs text-gray-500 w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Увеличить"
          >
            <ZoomIn className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* canvas */}
      <div className="overflow-auto flex justify-center bg-gray-100 p-4">
        <canvas
          ref={canvasRef}
          className="shadow-lg rounded"
          style={{ maxWidth: "100%" }}
        />
      </div>

      {/* page nav bottom (mobile-friendly) */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-center gap-3 py-3 border-t"
          style={{ borderColor: "#E2E8F0" }}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="h-8 text-xs"
          >
            ← Назад
          </Button>
          <span className="text-xs text-muted-foreground">
            Стр. {currentPage} из {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="h-8 text-xs"
          >
            Далее →
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Watermark helper ─────────────────────────────────────────────────────────

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  email: string,
) {
  ctx.save();
  ctx.globalAlpha = 0.05; // was 0.12 — much more subtle
  ctx.fillStyle = "#1E3A5F";
  ctx.font = `bold ${Math.max(12, Math.round(width / 32))}px sans-serif`; // slightly smaller text too
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const angle = -Math.PI / 6;
  const text = `Info Academy · ${email}`;
  const stepX = width / 1.5; // wider spacing = fewer repeats = less visual noise
  const stepY = 160; // was 120

  ctx.translate(width / 2, height / 2);
  ctx.rotate(angle);

  for (let y = -height * 1.5; y < height * 1.5; y += stepY) {
    for (let x = -width * 1.5; x < width * 1.5; x += stepX) {
      ctx.fillText(text, x, y);
    }
  }

  ctx.restore();
}
