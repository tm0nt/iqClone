"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Check, AlertCircle, Eye, EyeOff, Shield, Lock, Key } from "lucide-react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

export default function SecuritySection() {
  const t = useTranslations("Security");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!currentPassword) {
      newErrors.currentPassword = t("errors.currentPasswordRequired");
    }

    if (!newPassword) {
      newErrors.newPassword = t("errors.newPasswordRequired");
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t("errors.passwordMinLength");
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = t("errors.passwordComplexity");
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("errors.confirmPasswordRequired");
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("errors.passwordsDoNotMatch");
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = t("errors.passwordSameAsCurrent");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return { label: t("strength.veryWeak"), color: "text-platform-danger" };
      case 2:
        return { label: t("strength.weak"), color: "text-platform-demo" };
      case 3:
        return { label: t("strength.fair"), color: "text-platform-warning" };
      case 4:
        return { label: t("strength.good"), color: "text-platform-positive" };
      case 5:
        return { label: t("strength.strong"), color: "text-platform-positive" };
      default:
        return { label: "", color: "" };
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword: confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("errors.failedToChangePassword"));
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});

      toast.open({
        variant: "success",
        title: t("success.title"),
        description: t("success.description"),
        duration: 5000,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.open({
          variant: "error",
          title: t("errors.failedToChangePassword"),
          description: error.message,
          duration: 5000,
        });
      } else {
        toast.open({
          variant: "error",
          title: t("errors.unknownError"),
          description: t("errors.unknownErrorDesc"),
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderValidationIndicator = (field: string, value: string) => {
    if (!value) return null;

    if (field === "currentPassword" && value) {
      return (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-platform-positive">
          <Check size={16} />
        </div>
      );
    }

    if (field === "newPassword") {
      const strength = getPasswordStrength(value);
      if (strength >= 3) {
        return (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-platform-positive">
            <Check size={16} />
          </div>
        );
      } else if (value) {
        return (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-platform-danger">
            <AlertCircle size={16} />
          </div>
        );
      }
    }

    if (field === "confirmPassword") {
      if (value && value === newPassword && newPassword) {
        return (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-platform-positive">
            <Check size={16} />
          </div>
        );
      } else if (value && value !== newPassword) {
        return (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-platform-danger">
            <AlertCircle size={16} />
          </div>
        );
      }
    }

    return null;
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  return (
    <div className="w-full text-platform-text">
      <div className="bg-white/[0.03] rounded-2xl p-6">
        <div className="flex items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">{t("securitySettings")}</h3>
            <p className="text-sm text-platform-overlay-muted">{t("updatePassword")}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm text-platform-overlay-muted mb-2 flex items-center">
              <Lock size={16} className="mr-2" />
              {t("currentPassword")} *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                className={`w-full bg-white/5 border ${
                  errors.currentPassword
                    ? "border-platform-danger/50 focus:ring-1 focus:ring-platform-danger/50"
                    : currentPassword
                      ? "border-platform-positive/50 focus:ring-1 focus:ring-platform-positive/50"
                      : "border-transparent focus:ring-1 focus:ring-white/20"
                } rounded-xl py-3 px-4 pr-20 text-platform-text focus:outline-none focus:bg-white/10 transition-all duration-200`}
                placeholder={t("enterCurrentPassword")}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              {renderValidationIndicator("currentPassword", currentPassword)}
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-platform-overlay-muted hover:text-platform-text transition-colors"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-platform-danger mt-1 flex items-center">
                <AlertCircle size={12} className="mr-1" />
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm text-platform-overlay-muted mb-2 flex items-center">
              <Key size={16} className="mr-2" />
              {t("newPassword")} *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                className={`w-full bg-white/5 border ${
                  errors.newPassword
                    ? "border-platform-danger/50 focus:ring-1 focus:ring-platform-danger/50"
                    : passwordStrength >= 3 && newPassword
                      ? "border-platform-positive/50 focus:ring-1 focus:ring-platform-positive/50"
                      : "border-transparent focus:ring-1 focus:ring-white/20"
                } rounded-xl py-3 px-4 pr-20 text-platform-text focus:outline-none focus:bg-white/10 transition-all duration-200`}
                placeholder={t("enterNewPassword")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {renderValidationIndicator("newPassword", newPassword)}
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-platform-overlay-muted hover:text-platform-text transition-colors"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-platform-overlay-muted">{t("passwordStrength")}:</span>
                  <span className={`text-xs font-medium ${strengthInfo.color}`}>{strengthInfo.label}</span>
                </div>
                <div className="w-full bg-platform-overlay-card/30 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength <= 1
                        ? "bg-platform-danger"
                        : passwordStrength === 2
                          ? "bg-platform-demo"
                          : passwordStrength === 3
                            ? "bg-platform-warning"
                            : "bg-platform-positive"
                    }`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {errors.newPassword && (
              <p className="text-xs text-platform-danger mt-1 flex items-center">
                <AlertCircle size={12} className="mr-1" />
                {errors.newPassword}
              </p>
            )}

            {/* Password Requirements */}
            {newPassword && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-platform-overlay-muted mb-2">{t("passwordRequirements")}:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                  <div
                    className={`flex items-center ${newPassword.length >= 8 ? "text-platform-positive" : "text-platform-overlay-muted"}`}
                  >
                    {newPassword.length >= 8 ? (
                      <Check size={12} className="mr-1" />
                    ) : (
                      <div className="w-3 h-3 mr-1 rounded-full border border-platform-overlay-muted"></div>
                    )}
                    {t("requirements.characters")}
                  </div>
                  <div
                    className={`flex items-center ${/[a-z]/.test(newPassword) ? "text-platform-positive" : "text-platform-overlay-muted"}`}
                  >
                    {/[a-z]/.test(newPassword) ? (
                      <Check size={12} className="mr-1" />
                    ) : (
                      <div className="w-3 h-3 mr-1 rounded-full border border-platform-overlay-muted"></div>
                    )}
                    {t("requirements.lowercase")}
                  </div>
                  <div
                    className={`flex items-center ${/[A-Z]/.test(newPassword) ? "text-platform-positive" : "text-platform-overlay-muted"}`}
                  >
                    {/[A-Z]/.test(newPassword) ? (
                      <Check size={12} className="mr-1" />
                    ) : (
                      <div className="w-3 h-3 mr-1 rounded-full border border-platform-overlay-muted"></div>
                    )}
                    {t("requirements.uppercase")}
                  </div>
                  <div
                    className={`flex items-center ${/\d/.test(newPassword) ? "text-platform-positive" : "text-platform-overlay-muted"}`}
                  >
                    {/\d/.test(newPassword) ? (
                      <Check size={12} className="mr-1" />
                    ) : (
                      <div className="w-3 h-3 mr-1 rounded-full border border-platform-overlay-muted"></div>
                    )}
                    {t("requirements.number")}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-platform-overlay-muted mb-2 flex items-center">
              <Key size={16} className="mr-2" />
              {t("confirmNewPassword")} *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full bg-white/5 border ${
                  errors.confirmPassword
                    ? "border-platform-danger/50 focus:ring-1 focus:ring-platform-danger/50"
                    : confirmPassword && confirmPassword === newPassword
                      ? "border-platform-positive/50 focus:ring-1 focus:ring-platform-positive/50"
                      : "border-transparent focus:ring-1 focus:ring-white/20"
                } rounded-xl py-3 px-4 pr-20 text-platform-text focus:outline-none focus:bg-white/10 transition-all duration-200`}
                placeholder={t("enterConfirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {renderValidationIndicator("confirmPassword", confirmPassword)}
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-platform-overlay-muted hover:text-platform-text transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-platform-danger mt-1 flex items-center">
                <AlertCircle size={12} className="mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Security Tips */}
          <div className="bg-white/[0.03] rounded-xl p-4">
            <h4 className="text-sm font-medium text-platform-text mb-2 flex items-center">
              <Shield size={16} className="mr-2 text-platform-positive" />
              {t("securityTips")}
            </h4>
            <ul className="text-xs text-platform-overlay-muted space-y-1">
              <li>• {t("tips.uniquePassword")}</li>
              <li>• {t("tips.mixCharacters")}</li>
              <li>• {t("tips.avoidPersonalInfo")}</li>
              <li>• {t("tips.passwordManager")}</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={
              isLoading || !currentPassword || !newPassword || !confirmPassword || Object.keys(errors).length > 0
            }
            className="w-full bg-white text-black py-3 rounded-xl transition-all duration-200 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Skeleton className="mr-2 h-4 w-20 rounded-full bg-black/10" />
                {t("updatingPassword")}
              </>
            ) : (
              <>
                <Lock size={16} className="mr-2" />
                {t("updatePassword")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
