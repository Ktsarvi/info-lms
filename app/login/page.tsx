"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { translateSupabaseError } from "@/utils/supabase/error-translations";
import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const errorParam = searchParams.get("error");
  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
    general?: string;
  }>(() => (errorParam ? { general: translateSupabaseError(errorParam) } : {}));
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setErrors({});
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email обязателен";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Неверный формат email";
    }

    if (!password) {
      newErrors.password = "Пароль обязателен";
    } else if (password.length < 8) {
      newErrors.password = "Пароль должен быть минимум 8 символов";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      setErrors({});

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrors({ general: translateSupabaseError(error.message) });
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_subscribed, subscription_expires_at")
        .eq("id", data.user.id)
        .single();

      const isActive =
        !!profile?.is_subscribed &&
        (!profile.subscription_expires_at ||
          new Date(profile.subscription_expires_at) > new Date());

      router.push(isActive ? "/courses" : "/pricing");
      router.refresh();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#F8FAFC" }}
    >
      <div className="w-full max-w-md">
        <img
          src="/ia_logo_no_bg.png"
          alt="Info Academy logo"
          className="h-24 w-24 object-contain mx-auto mb-4"
        />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#1E3A5F" }}>
            Вход в Info Academy
          </h1>
          <p style={{ color: "#64748B" }}>Войдите, чтобы продолжить обучение</p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: "#fff", border: "1px solid #E2E8F0" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#1E3A5F" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: errors.email ? "#EF4444" : "#E2E8F0" }}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#1E3A5F" }}
              >
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  style={{
                    borderColor: errors.password ? "#EF4444" : "#E2E8F0",
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer z-10"
                  style={{ color: "#64748B" }}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold text-white"
              style={{ background: "#3B82F6", border: "none" }}
              disabled={loading}
            >
              {loading ? "Вход..." : "Войти"}
            </Button>

            {errors.general && (
              <p className="text-red-500 text-sm text-center">
                {errors.general}
              </p>
            )}

            <div className="text-center text-sm" style={{ color: "#64748B" }}>
              Нет аккаунта?{" "}
              <Link
                href="/signup"
                className="font-medium hover:underline"
                style={{ color: "#3B82F6" }}
              >
                Зарегистрироваться
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm hover:underline"
            style={{ color: "#64748B" }}
          >
            ← Вернуться
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
