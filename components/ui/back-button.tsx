"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  fallbackUrl?: string;
  className?: string;
}

export function BackButton({
  label = "Назад",
  fallbackUrl = "/",
  className = "flex items-center gap-2 text-slate-600 hover:text-[#1E3A5F] text-sm font-medium transition-colors cursor-pointer",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button type="button" onClick={handleBack} className={className}>
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
