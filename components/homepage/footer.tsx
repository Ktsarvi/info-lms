"use client";

import { PrivacyDialog, TermsDialog, ContactDialog } from "./legal-dialogs";

const Footer = () => {
  return (
    <footer
      className="px-4 sm:px-6 lg:px-8"
      style={{
        background: "#F8FAFC",
        borderTop: "1px solid #E2E8F0",
        padding: "1.75rem 2rem",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span
            className="text-base font-semibold"
            style={{ color: "#1E3A5F" }}
          >
            Info Academy
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1">
          <PrivacyDialog />
          <TermsDialog />
          <ContactDialog />
        </div>

        {/* Copyright */}
        <div className="text-xs" style={{ color: "#94A3B8" }}>
          © 2026 Info Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
