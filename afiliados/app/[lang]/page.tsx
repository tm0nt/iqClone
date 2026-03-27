"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

export default function Home() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLang = pathname?.split("/")[1] || "pt";

  const [empresaData, setEmpresaData] = useState<{
    nome: string;
    logoUrl: string;
  }>({
    nome: "Empresa",
    logoUrl: "/logo.png",
  });

  const handleDataLoaded = (data: { logoUrl: string; nome: string }) => {
    setEmpresaData(data);
  };

  const handleLanguageChange = (code: string) => {
    const newPath = pathname?.replace(`/${currentLang}`, `/${code}`) || `/${code}`;
    router.push(newPath);
  };

  const email = `affiliates@${empresaData.nome.toLowerCase().replace(/\s+/g, "")}.com`;
  const currentLanguage = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Logo onDataLoaded={handleDataLoaded} />
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-primary-foreground bg-primary rounded-full">
            PROGRAMA DE AFILIADOS
          </span>
        </div>

        <LoginForm />

        <div className="mt-8 flex flex-col items-center space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="h-4 w-4" />
              {currentLanguage.label}
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="cursor-pointer"
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex space-x-4 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Termos e Condições
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Política de Privacidade
            </Link>
          </div>

          <div className="text-xs text-muted-foreground/60">
            <p>
              {email} © {empresaData.nome}, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
