"use client";

import React from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 grid grid-cols-3 items-center gap-4">
          {/* Logo — left */}
          <div className="flex items-center gap-2">
            <span
              className="text-xl font-semibold tracking-tight"
              style={{ color: "#1E3A5F" }}
            >
              Info Academy
            </span>
          </div>

          {/* Nav links — center */}
          <div className="hidden md:flex items-center justify-center gap-8"></div>

          {/* CTAs — right */}
          <div className="hidden md:flex items-center justify-end gap-2">
            <Button
              className="text-sm font-medium text-white"
              style={{ background: "#3B82F6", border: "none" }}
            >
              Get started
            </Button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex justify-end col-start-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              style={{ color: "#1E3A5F" }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-3"
          style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
        >
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm border"
              style={{ color: "#1E3A5F", borderColor: "#CBD5E1" }}
            >
              Sign in
            </Button>
            <Button
              className="w-full text-sm text-white"
              style={{ background: "#3B82F6" }}
            >
              Get started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
