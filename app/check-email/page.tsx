import { Button } from "@/components/ui/button";
import Link from "next/link";

const CheckEmailPage = () => {
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
            Проверьте вашу почту
          </h1>
          <p style={{ color: "#64748B" }}>
            Мы отправили вам ссылку для подтверждения аккаунта
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: "#fff", border: "1px solid #E2E8F0" }}
        >
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "#475569" }}>
              Перейдите по ссылке в письме, чтобы активировать ваш аккаунт.
              После подтверждения вы сможете войти в систему.
            </p>

            <div className="pt-4">
              <Link href="/login">
                <Button
                  className="w-full h-12 text-lg font-semibold text-white"
                  style={{ background: "#3B82F6", border: "none" }}
                >
                  Перейти ко входу
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm hover:underline"
            style={{ color: "#64748B" }}
          >
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;
