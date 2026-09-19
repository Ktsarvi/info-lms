"use client";

import { Check, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, Suspense } from "react";
import {
  termsContent,
  privacyContent,
} from "@/components/homepage/legal-content";

const features = [
  "Доступ ко всем курсам",
  "Тесты к урокам",
  "Отслеживание прогресса",
  "PDF материалы",
  "Постоянная поддержка",
  "Доступ к экзаменам",
  "Персональный кабинет",
];

const durationOptions = [
  { id: "weekly", label: "Недельный", price: 8, months: 0.25 },
  { id: "monthly", label: "Месячный", price: 20, months: 1 },
];

const PricingInner = () => {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    days_remaining: number | null;
    is_expired: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [dismissedErrorParam, setDismissedErrorParam] = useState<string | null>(
    null,
  );
  const [selectedDuration, setSelectedDuration] = useState("monthly");
  const [periods, setPeriods] = useState(1);

  const getDayWord = (days: number): string => {
    const lastTwo = days % 100;
    const lastOne = days % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return "дней";
    if (lastOne === 1) return "день";
    if (lastOne >= 2 && lastOne <= 4) return "дня";
    return "дней";
  };

  const getPeriodText = (duration: string, count: number): string => {
    if (duration === "weekly") {
      if (count === 1) return "за неделю";
      const lastTwo = count % 100;
      const lastOne = count % 10;
      if (lastTwo >= 11 && lastTwo <= 14) return `за ${count} недель`;
      if (lastOne === 1) return `за ${count} неделю`;
      if (lastOne >= 2 && lastOne <= 4) return `за ${count} недели`;
      return `за ${count} недель`;
    } else {
      if (count === 1) return "за месяц";
      const lastTwo = count % 100;
      const lastOne = count % 10;
      if (lastTwo >= 11 && lastTwo <= 14) return `за ${count} месяцев`;
      if (lastOne === 1) return `за ${count} месяц`;
      if (lastOne >= 2 && lastOne <= 4) return `за ${count} месяца`;
      return `за ${count} месяцев`;
    }
  };

  const errParam = searchParams.get("error");
  const successParam = searchParams.get("success");

  // Derive message directly from search parameters during render
  const urlMessage = (() => {
    if (errParam && dismissedErrorParam !== errParam) {
      const errorMessages: Record<string, string> = {
        declined: "Оплата была отклонена банком. Пожалуйста, попробуйте снова.",
        missing_order: "Не найден номер заказа.",
        unknown_order: "Заказ не найден в системе.",
        failed: "Произошла ошибка при обработке платежа.",
      };
      return {
        type: "error" as const,
        text: errorMessages[errParam] || "Произошла ошибка при оплате.",
      };
    }
    if (successParam) {
      return {
        type: "success" as const,
        text: "Подписка успешно оформлена! Теперь у вас есть полный доступ.",
      };
    }
    return null;
  })();

  // Auto-dismiss url error message after 10s
  useEffect(() => {
    if (errParam && dismissedErrorParam !== errParam) {
      const timer = setTimeout(() => {
        setDismissedErrorParam(errParam);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [errParam, dismissedErrorParam]);

  // Auto-dismiss inline error message after 10s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsAuthenticated(!!user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select(
            "is_subscribed, subscription_expires_at, last_duration_type, last_periods",
          )
          .eq("id", user.id)
          .single();

        // Get subscription info for all authenticated users
        const { data: subInfo } = await supabase.rpc("get_subscription_info");

        if (subInfo && subInfo[0]) {
          setSubscriptionInfo({
            days_remaining: subInfo[0].days_remaining,
            is_expired: subInfo[0].is_expired,
          });
        }

        if (
          profile?.is_subscribed &&
          (!profile.subscription_expires_at ||
            new Date(profile.subscription_expires_at) > new Date())
        ) {
          setIsSubscribed(true);
        }

        // Set user's last selected duration and periods
        if (profile?.last_duration_type) {
          const validDuration = durationOptions.some(
            (d) => d.id === profile.last_duration_type,
          )
            ? profile.last_duration_type
            : "monthly";
          setSelectedDuration(validDuration);
        }
        if (profile?.last_periods) {
          setPeriods(profile.last_periods);
        }
      }
    };

    checkAuth();
  }, [supabase]);

  const handleSubscribe = async () => {
    if (!agreedToTerms) return;
    setLoading(true);
    setError(null);

    const selectedOption = durationOptions.find(
      (d) => d.id === selectedDuration,
    );
    if (!selectedOption) {
      setLoading(false);
      setError("Неверный период подписки.");
      return;
    }

    const totalMonths = selectedOption.months * periods;
    const totalPrice = selectedOption.price * periods;

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration: selectedDuration,
          periods: periods,
          totalMonths: totalMonths,
          amount: totalPrice,
          consent: {
            termsRevision: termsContent.revision,
            privacyRevision: privacyContent.revision,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.redirectUrl) {
        const originalError =
          data.error || "Не удалось создать заказ на оплату.";
        if (originalError === "ApeError") {
          console.error("Payment gateway ApeError:", originalError);
          setError("Ошибка платежного шлюза. Пожалуйста, попробуйте снова.");
        } else {
          setError(originalError);
        }
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
            alt=" "
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

        {/* Tabs above card */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-100 border border-slate-200 rounded-xl gap-1">
            {durationOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedDuration(option.id)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  selectedDuration === option.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
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
            className="relative rounded-2xl p-8 order-1 md:order-2 shadow-sm flex flex-col justify-between"
            style={{ background: "#fff", border: "2px solid #3B82F6" }}
          >
            <div>
              <div
                className="text-lg font-semibold mb-1"
                style={{ color: "#1E3A5F" }}
              >
                Подписка
              </div>
              <div className="text-sm mb-6" style={{ color: "#64748B" }}>
                Полный доступ к платформе
              </div>

              {/* Total price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span
                  className="text-5xl font-bold"
                  style={{ color: "#1E3A5F" }}
                >
                  {(durationOptions.find((d) => d.id === selectedDuration)
                    ?.price || 20) * periods}
                  ₼
                </span>
                <span className="text-base font-medium text-slate-500">
                  {getPeriodText(selectedDuration, periods)}
                </span>
              </div>

              {/* Periods selection - smaller & below price */}
              <div className="mb-6 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <label
                  className="text-xs font-semibold"
                  style={{ color: "#1E3A5F" }}
                >
                  Количество периодов:
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPeriods(Math.max(1, periods - 1))}
                    className="w-7 h-7 rounded-md border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-slate-700 disabled:opacity-40 transition-colors"
                    disabled={periods <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={periods}
                    onChange={(e) =>
                      setPeriods(
                        Math.max(
                          1,
                          Math.min(36, parseInt(e.target.value) || 1),
                        ),
                      )
                    }
                    className="w-12 text-center text-xs font-bold border border-gray-300 bg-white rounded-md py-1 px-1 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPeriods(Math.min(36, periods + 1))}
                    className="w-7 h-7 rounded-md border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-slate-700 disabled:opacity-40 transition-colors"
                    disabled={periods >= 36}
                  >
                    +
                  </button>
                </div>
              </div>
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
                  {subscriptionInfo?.is_expired ? (
                    <div className="p-3 bg-red-50 rounded-lg text-red-800 text-sm text-center font-medium border border-red-200">
                      Ваша подписка истекла
                    </div>
                  ) : subscriptionInfo &&
                    subscriptionInfo.days_remaining !== null ? (
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 text-sm text-center font-medium border border-emerald-200">
                      Осталось {subscriptionInfo.days_remaining}{" "}
                      {getDayWord(subscriptionInfo.days_remaining)}
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 text-sm text-center font-medium border border-emerald-200">
                      У вас активна подписка
                    </div>
                  )}
                  <Link href="/courses" className="block w-full">
                    <Button
                      className="w-full text-lg font-bold h-14 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
                      style={{
                        background: "#3B82F6",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Перейти к курсам
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                    />
                    <span className="leading-snug">
                      Я принимаю{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Условия обслуживания
                      </Link>{" "}
                      и{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Политику конфиденциальности
                      </Link>
                    </span>
                  </label>

                  <Button
                    onClick={handleSubscribe}
                    className="w-full text-lg font-bold h-14 rounded-xl shadow-md transition-all"
                    style={{
                      background: "#3B82F6",
                      color: "#fff",
                      border: "none",
                      opacity: !agreedToTerms || loading ? 0.6 : 1,
                      cursor:
                        !agreedToTerms || loading ? "not-allowed" : "pointer",
                    }}
                    disabled={loading || !agreedToTerms}
                  >
                    {loading ? "Переход к оплате..." : "Подписаться"}
                  </Button>
                </div>
              )
            ) : (
              <Link href="/login">
                <Button
                  className="w-full text-lg font-bold h-14 rounded-xl shadow-md transition-all"
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
