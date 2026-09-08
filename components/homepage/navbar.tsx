"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

interface NavbarUser {
  name: string;
  email?: string;
  /** Two-letter initials shown in the avatar fallback */
  initials: string;
}

interface NavbarProps {
  /** When provided the login button is replaced with a user profile dropdown */
  user?: NavbarUser;
}

const Navbar = ({ user }: NavbarProps) => {
  const router = useRouter();
  const supabase = createClient();
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    days_remaining: number | null;
    is_expired: boolean;
  } | null>(null);

  const getDayWord = (days: number): string => {
    const lastTwo = days % 100;
    const lastOne = days % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return "дней";
    if (lastOne === 1) return "день";
    if (lastOne >= 2 && lastOne <= 4) return "дня";
    return "дней";
  };

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: subInfo } = await supabase
          .rpc("get_subscription_info", { p_user_id: authUser.id });
        
        if (subInfo && subInfo[0]) {
          setSubscriptionInfo({
            days_remaining: subInfo[0].days_remaining,
            is_expired: subInfo[0].is_expired,
          });
        }
      }
    };

    fetchSubscriptionInfo();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const UserDropdown = ({ compact = false }: { compact?: boolean }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-2"
          id="user-menu-trigger"
        >
          <Avatar size="sm">
            <AvatarFallback
              className="text-xs font-semibold"
              style={{ background: "#1E3A5F", color: "white" }}
            >
              {user!.initials}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <span className="text-sm font-medium">{user!.name}</span>
          )}
          {!compact && (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{user!.name}</p>
          {user!.email && (
            <p className="text-xs text-muted-foreground">{user!.email}</p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {subscriptionInfo && (
          <div className="px-2 py-1.5">
            {subscriptionInfo.is_expired ? (
              <p className="text-xs text-red-600 font-medium">Подписка истекла</p>
            ) : subscriptionInfo.days_remaining !== null ? (
              <p className="text-xs text-green-600 font-medium">
                Осталось {subscriptionInfo.days_remaining} {getDayWord(subscriptionInfo.days_remaining)}
              </p>
            ) : (
              <p className="text-xs text-green-600 font-medium">Активная подписка</p>
            )}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/pricing" className="flex items-center cursor-pointer">
            <RefreshCw className="w-4 h-4 mr-2" />
            Продлить подписку
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          id="logout-link"
          className="text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" /> Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b px-4 sm:px-6 lg:px-8"
      style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="h-20 grid grid-cols-3 items-center gap-4">
          {/* Logo — left */}
          <div className="flex items-center gap-2">
            <Link href="/">
              <span className="flex items-center gap-2 cursor-pointer">
                <img
                  src="/ia_logo_no_bg.png"
                  alt=""
                  className="h-12 w-12 object-contain"
                />
                <span
                  className="text-2xl font-semibold tracking-tight"
                  style={{ color: "#1E3A5F" }}
                >
                  Info Academy
                </span>
              </span>
            </Link>
          </div>

          {/* Nav links — center */}
          <div className="hidden md:flex items-center justify-center gap-8" />

          {/* CTAs — right (desktop) */}
          <div className="hidden md:flex items-center justify-end gap-2">
            {user ? (
              <UserDropdown />
            ) : (
              <Link href="/login">
                <Button
                  size="lg"
                  className="px-6 py-5 font-medium text-lg text-white"
                  style={{ background: "#3B82F6", border: "none" }}
                >
                  Начать
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile — right */}
          <div className="md:hidden flex justify-end col-start-3">
            {user ? (
              <UserDropdown compact />
            ) : (
              <Link href="/login">
                <Button
                  className="text-base font-medium text-white"
                  style={{ background: "#3B82F6", border: "none" }}
                >
                  Начать
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
