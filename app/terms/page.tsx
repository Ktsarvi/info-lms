import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { termsContent } from "@/components/homepage/legal-content";
import Footer from "@/components/homepage/footer";

export const metadata: Metadata = {
  title: "Условия обслуживания — Info Academy",
  description:
    "Условия обслуживания и правила использования платформы Info Academy",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Minimalist Top Nav */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-600 hover:text-[#1E3A5F] text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>На главную</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/ia_logo_no_bg.png"
              alt="Info Academy"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="text-base font-semibold text-[#1E3A5F]">
              Info Academy
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1E3A5F] mb-3">
            {termsContent.title}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
            {termsContent.description}
          </p>
        </div>

        <div className="space-y-6">
          {termsContent.sections.map((section, idx) => (
            <section
              key={idx}
              className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-sm"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-[#1E3A5F] mb-3">
                {section.heading}
              </h2>
              <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
