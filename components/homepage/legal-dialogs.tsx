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
import { termsContent, privacyContent } from "./legal-content";

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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{privacyContent.title}</DialogTitle>
          <DialogDescription>{privacyContent.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm pr-2">
          {privacyContent.sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-2">{section.heading}</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{termsContent.title}</DialogTitle>
          <DialogDescription>{termsContent.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm pr-2">
          {termsContent.sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-2">{section.heading}</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
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
