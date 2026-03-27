"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const pageLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/statistics": "Estatísticas",
  "/dashboard/users": "Usuários",
  "/dashboard/offers": "Ofertas",
  "/dashboard/withdrawals": "Saques",
  "/dashboard/settings": "Configurações",
};

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.querySelector("main");
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 4);
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Erro ao realizar logout");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMobileSidebar = () => {
    // @ts-ignore
    if (typeof window.toggleMobileSidebar === "function") {
      // @ts-ignore
      window.toggleMobileSidebar();
    }
  };

  const pathnameWithoutLang = "/" + (pathname?.split("/").slice(2).join("/") || "");
  const pageTitle = pageLabels[pathnameWithoutLang] ?? "Dashboard";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b px-4 transition-all duration-200 md:px-6",
        scrolled
          ? "border-border/80 bg-white/90 dark:bg-[hsl(var(--sidebar-bg))]/90 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          : "border-border/50 bg-white/70 dark:bg-[hsl(var(--sidebar-bg))]/70 backdrop-blur-sm"
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted md:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <h1 className="text-sm font-semibold text-foreground/90">{pageTitle}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full ring-2 ring-transparent transition-all hover:ring-primary/20"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src="/avatar.png" alt="Afiliado" />
              <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                AF
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-52 rounded-xl border border-border/60 shadow-xl p-1"
        >
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Minha Conta
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="mx-1" />
          <DropdownMenuItem asChild className="gap-2 rounded-lg px-2 py-1.5 text-sm cursor-pointer">
            <Link href="/dashboard/settings">
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              Configurações
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="mx-1" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="gap-2 rounded-lg px-2 py-1.5 text-sm cursor-pointer text-destructive focus:bg-destructive/8 focus:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
