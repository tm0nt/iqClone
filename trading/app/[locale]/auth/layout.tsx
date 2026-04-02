import type React from "react";
import { ServerLogo } from "@/components/server-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex justify-center px-4 pt-8">
        <div className="pointer-events-auto flex items-center justify-center">
          <ServerLogo width={180} variant="dark" />
        </div>
      </div>
      {children}
    </>
  );
}
