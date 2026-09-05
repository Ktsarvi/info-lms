"use client";

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

export function ContactDialog() {
  const handleSend = () => {
    const mailtoLink = `mailto:support@infoacademy.com`;
    window.open(mailtoLink);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <NavLink>Контакты</NavLink>
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
              infoacademysupport@gmail.com
            </p>
            <p className="text-sm mt-1" style={{ color: "#64748B" }}>
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
