"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { translateSupabaseError } from "@/utils/supabase/error-translations";
import { Eye, EyeOff } from "lucide-react";

const SignupPage = () => {
  const [name, setName] = React.useState("");
  const [surname, setSurname] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setErrors({});
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors: {
      name?: string;
      surname?: string;
      email?: string;
      phone?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name) {
      newErrors.name = "Имя обязательно";
    } else if (name.length < 2) {
      newErrors.name = "Имя должно быть минимум 2 символа";
    }

    if (!surname) {
      newErrors.surname = "Фамилия обязательна";
    } else if (surname.length < 2) {
      newErrors.surname = "Фамилия должна быть минимум 2 символа";
    }

    if (!email) {
      newErrors.email = "Email обязателен";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Неверный формат email";
    }

    if (!phone) {
      newErrors.phone = "Номер телефона обязателен";
    } else if (!/^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "Неверный формат телефона (например: +994501234567)";
    }

    if (!password) {
      newErrors.password = "Пароль обязателен";
    } else if (password.length < 8) {
      newErrors.password = "Пароль должен быть минимум 8 символов";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Подтвердите пароль";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      setErrors({});

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            surname,
            full_name: `${name} ${surname}`,
            phone,
          },
        },
      });

      if (error) {
        setErrors({ general: translateSupabaseError(error.message) });
        setLoading(false);
      } else if (!data.session) {
        // No session returned = email confirmation required
        router.push("/check-email");
      } else {
        // Save phone to profile after signup
        if (data.user) {
          await supabase
            .from("profiles")
            .update({ phone })
            .eq("id", data.user.id);
        }
        // Confirmation somehow already satisfied (rare) — proceed normally
        router.push("/pricing");
      }
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
            Регистрация в Info Academy
          </h1>
          <p style={{ color: "#64748B" }}>
            Создайте аккаунт, чтобы начать обучение
          </p>
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
                Имя
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: errors.name ? "#EF4444" : "#E2E8F0" }}
                placeholder="Ваше имя"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#1E3A5F" }}
              >
                Фамилия
              </label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: errors.surname ? "#EF4444" : "#E2E8F0" }}
                placeholder="Ваша фамилия"
              />
              {errors.surname && (
                <p className="text-red-500 text-xs mt-1">{errors.surname}</p>
              )}
            </div>

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
                Номер телефона
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: errors.phone ? "#EF4444" : "#E2E8F0" }}
                placeholder="+994501234567"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
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

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#1E3A5F" }}
              >
                Подтвердите пароль
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  style={{
                    borderColor: errors.confirmPassword ? "#EF4444" : "#E2E8F0",
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer z-10"
                  style={{ color: "#64748B" }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold text-white"
              style={{ background: "#3B82F6", border: "none" }}
              disabled={loading}
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>

            {errors.general && (
              <p className="text-red-500 text-sm text-center">
                {errors.general}
              </p>
            )}

            <div className="text-center text-sm" style={{ color: "#64748B" }}>
              Уже есть аккаунт?{" "}
              <Link
                href="/login"
                className="font-medium hover:underline"
                style={{ color: "#3B82F6" }}
              >
                Войти
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
};

export default SignupPage;
