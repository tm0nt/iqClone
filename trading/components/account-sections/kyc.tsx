"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/components/ui/toast";
import {
  Check,
  AlertCircle,
  UploadCloud,
  ArrowLeft,
  FileText,
  X,
  CheckCircle,
  CreditCard,
  BadgeIcon as IdCard,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { AccountProcessingSkeleton } from "@/components/account-loading-skeletons";

interface KYCConfirmationScreenProps {
  documentType: string;
  onBack: () => void;
}

interface KYCSuccessScreenProps {
  documentType: string;
  onBack: () => void;
}

interface DocumentUploadSectionProps {
  id: string;
  label: string;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  description: string;
}

function KYCConfirmationScreen({ documentType, onBack }: KYCConfirmationScreenProps) {
  const t = useTranslations("KYC");

  return (
    <div className="bg-white/[0.03] rounded-2xl p-6 animate-in fade-in duration-300">
      <div className="text-center">
        <div className="w-20 h-20 bg-platform-positive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-platform-positive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t("documentSubmitted")}</h3>
        <p className="text-sm text-platform-overlay-muted mb-6">
          {t("documentSubmittedDesc", { documentType })}
        </p>
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black transition-all duration-200 hover:bg-white/90"
        >
          <ArrowLeft size={18} />
          <span>{t("back")}</span>
        </button>
      </div>
    </div>
  );
}

export function KYCSuccessScreen({ documentType, onBack }: KYCSuccessScreenProps) {
  const t = useTranslations("KYC");

  return (
    <div className="bg-white/[0.03] rounded-2xl p-6 animate-in fade-in duration-300">
      <div className="text-center">
        <div className="w-20 h-20 bg-platform-positive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-platform-positive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t("documentApproved")}</h3>
        <p className="text-sm text-platform-overlay-muted mb-6">
          {t("documentApprovedDesc", { documentType })}
        </p>
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black transition-all duration-200 hover:bg-white/90"
        >
          <ArrowLeft size={18} />
          <span>{t("back")}</span>
        </button>
      </div>
    </div>
  );
}

const DocumentUploadSection = ({ id, label, file, setFile, description }: DocumentUploadSectionProps) => {
  const t = useTranslations("KYC");
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
        toast.open({
          variant: "error",
          title: t("invalidFileFormat"),
          description: t("invalidFileFormatDesc"),
          duration: 5000,
        });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.open({
          variant: "error",
          title: t("fileTooLarge"),
          description: t("fileTooLargeDesc"),
          duration: 5000,
        });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm text-platform-overlay-muted font-medium">
        {label}
      </label>
      <div
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 p-6 text-center transition-all duration-300 hover:border-platform-positive/50 hover:bg-white/5 cursor-pointer ${
          file && ALLOWED_FILE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
            ? "border-platform-positive/50"
            : file
              ? "border-platform-danger/50"
              : ""
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud
          className={`h-8 w-8 transition-colors duration-300 ${
            file && ALLOWED_FILE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
              ? "text-platform-positive"
              : file
                ? "text-platform-danger"
                : "text-platform-overlay-muted hover:text-platform-positive"
          } animate-pulse`}
        />
        <p className="mt-2 text-sm text-platform-overlay-muted">
          {t("uploadInstructions")}
        </p>
        <p className="text-xs text-platform-overlay-muted">{description}</p>
        <input
          id={id}
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          ref={fileInputRef}
        />
      </div>
      {file && (
        <div className="mt-2 space-y-1 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-platform-text truncate max-w-[75%]">{t("file")}: {file.name}</p>
            <button
              onClick={handleRemoveFile}
              className="flex items-center text-platform-danger hover:text-platform-danger transition-colors duration-200"
            >
              <X size={16} className="mr-1" />
              {t("remove")}
            </button>
          </div>
          <div className="w-full bg-platform-overlay-card/30 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-platform-success to-platform-positive"
              style={{ width: "100%", transition: "width 2s ease-in-out" }}
            ></div>
          </div>
          <p className="text-xs text-platform-positive">{t("fileReady")}</p>
        </div>
      )}
    </div>
  );
};

type KYCSectionProps = {};

export default function KYCSection() {
  const t = useTranslations("KYC");
  const [documentType, setDocumentType] = useState("drivers_license");
  const [ssnMaskedState, setSsnMaskedState] = useState("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const toast = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const documentOptions = [
    { id: "drivers_license", label: t("driversLicense"), icon: CreditCard },
    { id: "state_id", label: t("stateId"), icon: IdCard },
    { id: "passport", label: t("passport"), icon: FileText },
  ];

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    return digits.replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3");
  };

  const validateSSN = (ssn: string): boolean => {
    const strSSN = ssn.replace(/[^\d]/g, "");
    if (strSSN.length !== 9) return false;
    if (/^(\d)\1+$/.test(strSSN)) return false;
    return true;
  };

  const handleDocumentTypeChange = (type: string) => {
    setDocumentType(type);
    setSsnMaskedState("");
    setFrontFile(null);
    setBackFile(null);
    setSelfieFile(null);
  };

  const handleSsnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    setSsnMaskedState(formatted);
  };

  const handleSubmit = async () => {
    if (documentType === "drivers_license") {
      if (!frontFile || !backFile || !selfieFile) {
        toast.open({
          variant: "error",
          title: t("incompleteFiles"),
          description: t("incompleteFilesDescDrivers"),
          duration: 5000,
        });
        return;
      }
      if (!validateSSN(ssnMaskedState)) {
        toast.open({
          variant: "error",
          title: t("invalidSSN"),
          description: t("invalidSSNDesc"),
          duration: 5000,
        });
        return;
      }
    } else if (documentType === "state_id") {
      if (!frontFile || !backFile || !selfieFile) {
        toast.open({
          variant: "error",
          title: t("incompleteFiles"),
          description: t("incompleteFilesDescStateId"),
          duration: 5000,
        });
        return;
      }
      if (!validateSSN(ssnMaskedState)) {
        toast.open({
          variant: "error",
          title: t("invalidSSN"),
          description: t("invalidSSNDesc"),
          duration: 5000,
        });
        return;
      }
    } else if (documentType === "passport") {
      if (!frontFile || !selfieFile) {
        toast.open({
          variant: "error",
          title: t("incompleteFiles"),
          description: t("incompleteFilesDescPassport"),
          duration: 5000,
        });
        return;
      }
    }

    const formData = new FormData();
    if (frontFile) formData.append("front", frontFile);
    if (backFile) formData.append("back", backFile);
    if (selfieFile) formData.append("selfie", selfieFile);
    formData.append("documentType", documentType);
    if (documentType !== "passport") {
      formData.append("cpf", ssnMaskedState.replace(/\D/g, ""));
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/account/kyc", {
        method: "POST",
        body: formData,
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "Erro ao enviar documento");
      }

      setIsLoading(false);
      setShowConfirmation(true);
      toast.open({
        variant: "success",
        title: t("documentsSubmitted"),
        description: t("documentsSubmittedDesc"),
        duration: 5000,
      });

      setSsnMaskedState("");
      setFrontFile(null);
      setBackFile(null);
      setSelfieFile(null);
    } catch (error) {
      setIsLoading(false);
      toast.open({
        variant: "error",
        title: t("errorSubmitting"),
        description:
          error instanceof Error ? error.message : t("errorSubmittingDesc"),
        duration: 5000,
      });
    }
  };

  const renderSsnValidationIndicator = () => {
    if (!ssnMaskedState) return null;
    if (validateSSN(ssnMaskedState)) {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-platform-positive">
          <Check size={16} />
        </div>
      );
    } else if (ssnMaskedState.length >= 11) {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-platform-danger">
          <AlertCircle size={16} />
        </div>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (isLoading) {
      return <AccountProcessingSkeleton blocks={3} />;
    }

    if (showConfirmation) {
      return (
        <KYCConfirmationScreen
          documentType={documentOptions.find((opt) => opt.id === documentType)?.label || documentType}
          onBack={() => setShowConfirmation(false)}
        />
      );
    }

    return (
      <div className="bg-white/[0.03] rounded-2xl p-6 animate-in fade-in duration-300">
        <h3 className="text-lg font-semibold mb-6">{t("identityVerification")}</h3>

        <div className="grid grid-cols-12 gap-4 mb-6">
          <div className="col-span-12">
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("documentType")}</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {documentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    className={`flex items-center p-4 rounded-xl transition-all duration-300 ${
                      documentType === option.id
                        ? "bg-white/10 text-white"
                        : "bg-white/[0.03] text-white/50 hover:bg-white/8 hover:text-white/80"
                    }`}
                    onClick={() => handleDocumentTypeChange(option.id)}
                  >
                    <Icon size={24} className="mr-3" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {documentType !== "passport" && (
          <div className="mb-6">
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("ssn")}</label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-white/5 rounded-xl py-3 px-4 pr-10 text-platform-text focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                placeholder={t("enterSSN")}
                value={ssnMaskedState}
                onChange={handleSsnChange}
                maxLength={11}
              />
              {renderSsnValidationIndicator()}
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <h3 className="text-xl font-semibold">{t("importantInstructions")}</h3>
          <ul className="list-disc list-inside text-platform-overlay-muted space-y-2 text-sm">
            <li>{t("instructions.legible")}</li>
            <li>{t("instructions.colored")}</li>
            <li>{t("instructions.format")}</li>
            <li>{t("instructions.maxSize")}</li>
          </ul>
        </div>

        <div className="space-y-4 mb-6">
          {documentType === "drivers_license" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <DocumentUploadSection
                  id="license-front"
                  label={t("frontDriversLicense")}
                  file={frontFile}
                  setFile={setFrontFile}
                  description={t("frontDriversLicenseDesc")}
                />
                <DocumentUploadSection
                  id="license-back"
                  label={t("backDriversLicense")}
                  file={backFile}
                  setFile={setBackFile}
                  description={t("backDriversLicenseDesc")}
                />
                <DocumentUploadSection
                  id="license-selfie"
                  label={t("selfieDriversLicense")}
                  file={selfieFile}
                  setFile={setSelfieFile}
                  description={t("selfieDriversLicenseDesc")}
                />
              </div>
            </>
          )}

          {documentType === "state_id" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DocumentUploadSection
                id="id-front"
                label={t("frontStateId")}
                file={frontFile}
                setFile={setFrontFile}
                description={t("frontStateIdDesc")}
              />
              <DocumentUploadSection
                id="id-back"
                label={t("backStateId")}
                file={backFile}
                setFile={setBackFile}
                description={t("backStateIdDesc")}
              />
              <DocumentUploadSection
                id="id-selfie"
                label={t("selfieStateId")}
                file={selfieFile}
                setFile={setSelfieFile}
                description={t("selfieStateIdDesc")}
              />
            </div>
          )}

          {documentType === "passport" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentUploadSection
                id="passport-photo"
                label={t("passportPage")}
                file={frontFile}
                setFile={setFrontFile}
                description={t("passportPageDesc")}
              />
              <DocumentUploadSection
                id="passport-selfie"
                label={t("selfiePassport")}
                file={selfieFile}
                setFile={setSelfieFile}
                description={t("selfiePassportDesc")}
              />
            </div>
          )}
        </div>

        <button
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black transition-all duration-200 hover:bg-white/90 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          <UploadCloud size={18} />
          <span>{isLoading ? t("submitting") : t("submitDocuments")}</span>
        </button>
      </div>
    );
  };

  return <div className="w-full text-platform-text">{renderContent()}</div>;
}
