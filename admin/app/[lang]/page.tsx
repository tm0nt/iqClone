"use client"

import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

type Locale = "pt" | "en" | "es";

export default function Home() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const langParam = Array.isArray(params.lang) ? params.lang[0] : params.lang;
  const currentLang: Locale = langParam === "en" || langParam === "es" ? langParam : "pt";

  const [empresaData, setEmpresaData] = useState({
    name: '',
    logoUrl: ''
  });

  const handleDataLoaded = (data: { logoUrl: string; name: string }) => {
    setEmpresaData(data);
  };

  // State to manage dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Language names translated per locale
  const languageNames: Record<Locale, Record<Locale, string>> = {
    pt: {
      en: "Inglês",
      es: "Espanhol",
      pt: "Português",
    },
    en: {
      en: "English",
      es: "Spanish",
      pt: "Portuguese",
    },
    es: {
      en: "Inglés",
      es: "Español",
      pt: "Portugués",
    },
  };

  const currentLanguageNames = languageNames[currentLang] || languageNames['pt'];

  // Footer texts translated per locale
  const footerTexts: Record<Locale, { terms: string; privacy: string }> = {
    pt: {
      terms: "Termos e Condições",
      privacy: "Política de Privacidade",
    },
    en: {
      terms: "Terms and Conditions",
      privacy: "Privacy Policy",
    },
    es: {
      terms: "Términos y Condiciones",
      privacy: "Política de Privacidad",
    },
  };

  const currentFooterTexts = footerTexts[currentLang] || footerTexts['pt'];

  // Function to handle language selection and redirect
  const selectLanguage = (newLang: string) => {
    setIsDropdownOpen(false);
    // Remove current lang prefix from pathname and build new URL
    const adjustedPath = pathname.replace(`/${currentLang}`, '') || '/';
    router.push(`/${newLang}${adjustedPath}`);
  };

  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Logo onDataLoaded={handleDataLoaded} />
        </div>

        <LoginForm />

        <div className="mt-8 flex flex-col items-center space-y-4">
          <div className="relative flex items-center">
            <button
              onClick={toggleDropdown}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m16.2 7.8-2.3 6.1-6.1 2.3 2.3-6.1z"></path>
              </svg>
              {currentLanguageNames[currentLang] || 'English'}
            </button>
            {isDropdownOpen && (
              <div className="absolute top-8 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={() => selectLanguage('en')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <img
                      src="/flags/en.png" // Replace with actual flag image path
                      alt="English flag"
                      className="w-5 h-5 mr-2"
                    />
                    {currentLanguageNames['en']}
                  </button>
                  <button
                    onClick={() => selectLanguage('es')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <img
                      src="/flags/es.png" // Replace with actual flag image path
                      alt="Spanish flag"
                      className="w-5 h-5 mr-2"
                    />
                    {currentLanguageNames['es']}
                  </button>
                  <button
                    onClick={() => selectLanguage('pt')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <img
                      src="/flags/pt.png" // Replace with actual flag image path
                      alt="Portuguese flag"
                      className="w-5 h-5 mr-2"
                    />
                    {currentLanguageNames['pt']}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-700">
              {currentFooterTexts.terms}
            </a>
            <a href="#" className="hover:text-gray-700">
              {currentFooterTexts.privacy}
            </a>
          </div>

          <div className="text-xs text-gray-400">
            <p>admin@{empresaData.name.toLowerCase().replace(/\s+/g, '')}.online © {empresaData.name}, {currentYear}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
