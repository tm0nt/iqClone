"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { DashboardNav } from "@/components/dashboard-nav";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const W_EXPANDED  = 240 + 12 + 16; // 268
const W_COLLAPSED =  68 + 12 + 16; // 96

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const update = (col: boolean) => {
      document.documentElement.style.setProperty(
        "--sidebar-w",
        window.innerWidth >= 768 ? `${col ? W_COLLAPSED : W_EXPANDED}px` : "0px"
      );
    };
    update(collapsed);
    const onResize = () => update(collapsed);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [collapsed]);

  const toggleMobileSidebar = () => setMobileOpen((v) => !v);
  useEffect(() => {
    // @ts-ignore
    window.toggleMobileSidebar = toggleMobileSidebar;
    return () => {
      // @ts-ignore
      delete window.toggleMobileSidebar;
    };
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar (slide-in drawer) */}
      <aside
        className={cn(
          "fixed inset-y-3 left-3 z-50 flex w-60 flex-col overflow-hidden",
          "rounded-2xl border border-border/40 bg-white/95 shadow-2xl shadow-black/10",
          "backdrop-blur-xl dark:bg-[hsl(var(--sidebar-bg))]/95",
          "transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-[120%]"
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/30 px-4">
          <Link href="/dashboard" className="flex items-center">
            <Logo width={120} background="light" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="h-7 w-7 rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <DashboardNav className="flex-1 overflow-y-auto px-2 py-3" />
        <SidebarFooter collapsed={false} />
      </aside>

      {/* Desktop floating sidebar */}
      <aside
        className={cn(
          "fixed left-3 top-3 bottom-3 z-30 hidden md:flex flex-col overflow-hidden",
          "rounded-2xl border border-border/40 bg-white/95 shadow-xl shadow-black/8",
          "backdrop-blur-xl dark:bg-[hsl(var(--sidebar-bg))]/95",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-60"
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-border/30",
            collapsed ? "justify-center px-0" : "justify-between px-4"
          )}
        >
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center">
              <Logo width={120} background="light" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "h-7 w-7 shrink-0 rounded-full text-muted-foreground hover:bg-muted",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <DashboardNav
          className="flex-1 overflow-y-auto px-2 py-3"
          collapsed={collapsed}
        />
        <SidebarFooter collapsed={collapsed} />
      </aside>
    </>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="shrink-0 border-t border-border/30 px-2 py-2">
      <div
        className={cn(
          "rounded-lg bg-muted/50 px-3 py-2 text-center",
          collapsed && "px-1.5"
        )}
      >
        {!collapsed && (
          <p className="text-[11px] font-medium text-muted-foreground/70 leading-tight">
            Painel de Afiliados
          </p>
        )}
      </div>
    </div>
  );
}
