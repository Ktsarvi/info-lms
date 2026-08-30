"use client";

import { Check, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, Suspense } from "react";

const features = [
  "Доступ ко всем курсам",
  "Тесты к урокам",
  "Отслеживание прогресса",
  "PDF материалы",
  "Постоянная поддержка",
  "Доступ к экзаменам",
  "Персональный кабинет",
];

const PricingInner = () => {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errParam = searchParams.get("error");
  const successParam = searchParams.get("success");

  let urlMessage: { type: "error" | "success"; text: string } | null = null;
  if (errParam) {
    const errorMessages: Record<string, string> = {
      declined: "Оплата была отклонена банком. Пожалуйста, попробуйте снова.",
      missing_order: "Не найден номер заказа.",
      unknown_order: "Заказ не найден в системе.",
      failed: "Произошла ошибка при обработке платежа.",
    };
    urlMessage = {
      type: "error",
      text: errorMessages[errParam] || "Произошла ошибка при оплате.",
    };
  } else if (successParam) {
    urlMessage = {
      type: "success",
      text: "Подписка успешно оформлена! Теперь у вас есть полный доступ.",
    };
  }

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsAuthenticated(!!user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_subscribed, subscription_expires_at")
          .eq("id", user.id)
          .single();

        if (
          profile?.is_subscribed &&
          (!profile.subscription_expires_at ||
            new Date(profile.subscription_expires_at) > new Date())
        ) {
          setIsSubscribed(true);
        }
      }
    };

    checkAuth();
  }, [supabase]);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: "1m" }),
      });

      const data = await res.json();

      if (!res.ok || !data.redirectUrl) {
        let msg = data.error || "Не удалось создать заказ на оплату.";
        if (msg === "ApeError") {
          msg =
            "Ошибка платежного шлюза Kapital Bank (ApeError). Проверьте учетные данные мерчанта в .env.local.";
        }
        setError(msg);
        setLoading(false);
        return;
      }

      // Redirect to Kapital Bank payment page
      window.location.href = data.redirectUrl;
    } catch (err: unknown) {
      console.warn("Payment error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка при переходе к оплате. Попробуйте снова.",
      );
      setLoading(false);
    }
  };

  return (
    <section
      id="pricing"
      className="py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: "#F8FAFC" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-4">
          <Image
            src="/ia_logo_no_bg.png"
            alt="Info Academy logo"
            width={96}
            height={96}
            className="h-24 w-24 object-contain"
            priority
          />
        </div>
        <div className="text-center mb-12">
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

        {urlMessage && (
          <div
            className={`max-w-2xl mx-auto mb-8 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
              urlMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {urlMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{urlMessage.text}</span>
          </div>
        )}

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
            className="relative rounded-2xl p-8 order-1 md:order-2 shadow-sm"
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

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isAuthenticated ? (
              isSubscribed ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 text-sm text-center font-medium border border-emerald-200">
                    У вас уже активна подписка
                  </div>
                  <Link href="/courses" className="block w-full">
                    <Button
                      className="w-full font-medium flex items-center justify-center gap-2"
                      style={{
                        background: "#3B82F6",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Перейти к курсам
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSubscribe}
                    variant="outline"
                    className="w-full font-medium text-xs text-slate-500 hover:text-slate-700"
                    disabled={loading}
                  >
                    {loading ? "Обработка..." : "Продлить подписку на 1 месяц"}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleSubscribe}
                  className="w-full font-medium"
                  style={{
                    background: "#3B82F6",
                    color: "#fff",
                    border: "none",
                  }}
                  disabled={loading}
                >
                  {loading ? "Переход к оплате..." : "Подписаться"}
                </Button>
              )
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

const Pricing = () => {
  return (
    <Suspense fallback={null}>
      <PricingInner />
    </Suspense>
  );
};

export default Pricing;
