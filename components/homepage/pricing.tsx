"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const features = [
  "Доступ ко всем курсам",
  "Тесты к урокам",
  "Отслеживание прогресса",
  "Постоянная поддержка",
  "Доступ к экзаменам",
  "Персональный кабинет",
];

const Pricing = () => {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, [supabase]);

  const handleSubscribe = async () => {
    setLoading(true);
    // In a real app, you would integrate with a payment provider here
    // For now, we'll just redirect to courses
    router.push("/courses");
  };

  return (
    <section
      id="pricing"
      className="py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: "#F8FAFC" }}
    >
      <div className="max-w-7xl mx-auto">
        <img
          src="/ia_logo.png"
          alt="Info Academy logo"
          className="h-24 w-24 object-contain mx-auto mb-4"
        />
        <div className="text-center mb-16">
          <h2
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{ color: "#1E3A5F" }}
          >
            Простой и доступный тариф
          </h2>
          <p className="text-lg" style={{ color: "#64748B" }}>
            Получите доступ ко всем материалам по одной цене
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Features list - left */}
          <div className="space-y-4 order-2 md:order-1">
            <h3
              className="text-2xl font-semibold mb-6"
              style={{ color: "#1E3A5F" }}
            >
              Всё включено
            </h3>
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3"
                style={{ color: "#475569" }}
              >
                <Check
                  className="w-5 h-5 shrink-0"
                  style={{ color: "#3B82F6" }}
                />
                <span className="text-base">{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing card - right */}
          <div
            className="relative rounded-2xl p-8 order-1 md:order-2"
            style={{ background: "#fff", border: "2px solid #3B82F6" }}
          >
            <div
              className="text-lg font-semibold mb-1"
              style={{ color: "#1E3A5F" }}
            >
              Подписка
            </div>
            <div className="text-sm mb-5" style={{ color: "#64748B" }}>
              Полный доступ к платформе
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-bold" style={{ color: "#1E3A5F" }}>
                20₼
              </span>
              <span className="text-sm" style={{ color: "#94A3B8" }}>
                /месяц
              </span>
            </div>

            {isAuthenticated ? (
              <Button
                onClick={handleSubscribe}
                className="w-full font-medium"
                style={{ background: "#3B82F6", color: "#fff", border: "none" }}
                disabled={loading}
              >
                {loading ? "Обработка..." : "Подписаться"}
              </Button>
            ) : (
              <Link href="/login">
                <Button
                  className="w-full font-medium"
                  style={{
                    background: "#3B82F6",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Войти для подписки
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
