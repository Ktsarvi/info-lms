import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

function NavLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="text-slate-500 hover:text-[#1E3A5F] bg-transparent border-none text-[13px] px-3 py-1.5"
      style={{
        background: "transparent",
        border: "none",
      }}
    >
      {children}
    </Button>
  );
}

export function PrivacyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <NavLink>Конфиденциальность</NavLink>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Политика конфиденциальности</DialogTitle>
          <DialogDescription>
            Ваша конфиденциальность важна для нас. Пожалуйста, внимательно
            ознакомьтесь с нашей политикой.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Обмен содержанием курса</h3>
            <p className="text-muted-foreground">
              Все материалы курса, включая видео, PDF, тесты и другое
              содержание, предназначены исключительно для личного использования.
              Распространение, передача или воспроизведение содержания курса без
              явного письменного разрешения запрещено. Ваш аккаунт может быть
              прекращен, если вы нарушите эту политику.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Сбор данных</h3>
            <p className="text-muted-foreground">
              Мы собираем информацию, необходимую для предоставления наших
              услуг, включая ваш прогресс обучения, результаты тестов и данные
              аккаунта. Мы никогда не продаем ваши личные данные третьим лицам.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Безопасность аккаунта</h3>
            <p className="text-muted-foreground">
              Вы несете ответственность за сохранение конфиденциальности ваших
              учетных данных. Передача вашего аккаунта другим лицам является
              нарушением наших условий.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TermsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <NavLink>Условия</NavLink>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Условия обслуживания</DialogTitle>
          <DialogDescription>
            Используя Info Academy, вы соглашаетесь с этими условиями.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">
              Ограничения использования курсов
            </h3>
            <p className="text-muted-foreground">
              Все курсы и материалы, предоставленные академией, предназначены
              только для индивидуального некоммерческого использования. Вы не
              можете передавать, перепродавать, распространять или делать
              доступным любое содержание курса другим лицам. Это включает, но не
              ограничивается: загрузку видео, PDF материалов, содержание тестов
              и сертификаты.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Условия аккаунта</h3>
            <p className="text-muted-foreground">
              Каждый аккаунт предназначен только для одного человека. Передача
              аккаунта строго запрещена и может привести к немедленному
              прекращению без возврата средств. Вы должны предоставлять точную
              информацию при создании аккаунта.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ContactDialog() {
  const handleSend = () => {
    const mailtoLink = `mailto:support@infoacademy.com`;
    window.open(mailtoLink);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <NavLink>Контакт</NavLink>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Свяжитесь с нами</DialogTitle>
          <DialogDescription>
            Свяжитесь с нами по электронной почте
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className="p-4 rounded-lg text-center"
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <Mail
              className="w-8 h-8 mx-auto mb-2"
              style={{ color: "#3B82F6" }}
            />
            <p className="text-lg font-semibold" style={{ color: "#3B82F6" }}>
              support@infoacademy.com
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Напишите нам по любым вопросам
            </p>
          </div>
          <Button
            onClick={handleSend}
            className="w-full"
            style={{ background: "#3B82F6", border: "none" }}
          >
            <Mail className="w-4 h-4 mr-2" />
            Написать нам
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
