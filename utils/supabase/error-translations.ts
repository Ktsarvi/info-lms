export const supabaseErrorTranslations: Record<string, string> = {
  "Email not confirmed":
    "Email не подтвержден. Пожалуйста, проверьте вашу почту.",
  "Invalid login credentials": "Неверный email или пароль.",
  "User already registered": "Пользователь с таким email уже зарегистрирован.",
  "Password should be at least 8 characters":
    "Пароль должен быть минимум 8 символов.",
  "Password is too short": "Пароль слишком короткий.",
  "Invalid email": "Неверный формат email.",
  "Signup requires a valid password": "Требуется действительный пароль.",
  "Unable to validate email address": "Не удалось подтвердить email адрес.",
  "To signup, please provide your email": "Для регистрации укажите ваш email.",
  "Only verified email can login":
    "Только подтвержденный email может войти в систему.",
  "Email rate limit exceeded": "Превышен лимит запросов. Попробуйте позже.",
  "Phone rate limit exceeded": "Превышен лимит запросов. Попробуйте позже.",
  "Security code is invalid": "Неверный код безопасности.",
  "Security code expired": "Срок действия кода безопасности истек.",
  "Email link is invalid or has expired":
    "Ссылка для подтверждения недействительна или истекла.",
  auth_failed: "Ошибка авторизации. Попробуйте снова.",
  missing_code: "Отсутствует код авторизации.",
};

export function translateSupabaseError(error: string): string {
  return supabaseErrorTranslations[error] || error;
}
