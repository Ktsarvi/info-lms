"use client";

import React from "react";
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

const triggerStyle = {
  color: "#64748B",
  background: "transparent",
  border: "none",
  fontSize: "13px",
  padding: "6px 12px",
};

const triggerHover = {
  color: "#1E3A5F",
};

function NavLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      style={hovered ? { ...triggerStyle, ...triggerHover } : triggerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Button>
  );
}

export function PrivacyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <NavLink>Privacy</NavLink>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            Your privacy is important to us. Please read our policy carefully.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Course Content Sharing</h3>
            <p className="text-muted-foreground">
              All course materials, including videos, PDFs, quizzes, and other
              content, are strictly for personal use only. Sharing,
              distributing, or reproducing course content without explicit
              written permission is prohibited. Your account may be terminated
              if you violate this policy.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Data Collection</h3>
            <p className="text-muted-foreground">
              We collect information necessary to provide our services,
              including your learning progress, quiz results, and account
              details. We never sell your personal data to third parties.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Account Security</h3>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your
              account credentials. Sharing your account with others is a
              violation of our terms.
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
        <NavLink>Terms</NavLink>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            By using Info Academy, you agree to these terms and conditions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Course Usage Restrictions</h3>
            <p className="text-muted-foreground">
              All courses and materials provided by Info Academy are for
              individual, non-commercial use only. You may not share, resell,
              redistribute, or make available any course content to others. This
              includes but is not limited to: video downloads, PDF materials,
              quiz content, and certificates.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Account Terms</h3>
            <p className="text-muted-foreground">
              Each account is for one individual only. Account sharing is
              strictly prohibited and may result in immediate termination
              without refund. You must provide accurate information when
              creating your account.
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
        <NavLink>Contact</NavLink>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Us</DialogTitle>
          <DialogDescription>Reach out to us via email</DialogDescription>
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
              Email us for any inquiries
            </p>
          </div>
          <Button
            onClick={handleSend}
            className="w-full"
            style={{ background: "#3B82F6", border: "none" }}
          >
            <Mail className="w-4 h-4 mr-2" />
            Open Email Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
