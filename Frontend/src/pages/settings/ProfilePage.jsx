import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { Shield, RotateCcw, Save, Info } from "lucide-react";
import useSaveProfile from "../../hooks/settings/useSaveProfile";
import { useGetProfile } from "../../hooks/settings/useGetProfile";
import { updateUser } from "../../store/slice/LoginSlice";
import { useToast } from "../../utils/ToastContext";
import ProfileInfoSection from "../../component/setting/ProfileInfoSection";
import CompanyConfigSection from "../../component/setting/CompanyConfigSection";


const ProfilePage = () => {
  const { data: profileData } = useGetProfile();
  const { mutate, isLoading } = useSaveProfile();
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // File input refs
  const fileInputRef = useRef(null);
  const companyLogoInputRef = useRef(null);
  const [, setFileName] = useState("No file chosen");
  const [, setCompanyLogoName] = useState("No file chosen");

  // Visibility toggles for sensitive credential fields
  const [showAppPassword, setShowAppPassword] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

  // User role check from Redux
  const userRole = useSelector((state) => state.auth.role);
  const restrictedRoles = ["interview", "hr", "interviewer"];
  const canViewConfigurations = !restrictedRoles.includes(
    userRole?.toLowerCase()
  );

  // Email provider mode state (Gmail vs custom SMTP)
  const [emailHostingType, setEmailHostingType] = useState("gmail");

  // Comprehensive profile form data
  const [formData, setFormData] = useState({
    name: "",
    organizationName: "",
    contactNumber: "",
    email: "",
    profilePhoto: null,
    companyLogo: null,
    cloudName: "",
    apiKey: "",
    apiSecret: "",
    companyEmail: "",
    appPassword: "",
    provider: "",
    smtpHost: "",
    smtpPort: "",
    smtpSecure: false,
  });

  // Set document title
  useEffect(() => {
    document.title = "Profile & Account Settings | Talent OS";
  }, []);

  // Initialize form when backend profile data is loaded
  useEffect(() => {
    if (profileData) {
      setFormData((prev) => ({
        ...prev,
        name:
          profileData.userName ||
          profileData.name ||
          profileData.Name ||
          "",
        organizationName:
          profileData.organizationName ||
          profileData.companyName ||
          "",
        contactNumber:
          profileData.contactNumber ||
          profileData.ContactNumber ||
          "",
        email:
          profileData.businessEmail ||
          profileData.email ||
          profileData.Email ||
          "",
        provider: profileData?.emailConfig?.provider || "",
        companyEmail: profileData?.emailConfig?.authEmail || "",
        appPassword: profileData?.emailConfig?.authPassword || "",
        smtpHost: profileData?.emailConfig?.smtpHost || "",
        smtpPort: String(profileData?.emailConfig?.smtpPort || ""),
        smtpSecure: profileData?.emailConfig?.smtpSecure ?? false,
        cloudName: profileData?.cloudinary?.cloudName || "",
        apiKey: profileData?.cloudinary?.apiKey || "",
        apiSecret: profileData?.cloudinary?.apiSecret || "",
      }));

      setEmailHostingType(
        profileData?.emailConfig?.provider === "others" ? "others" : "gmail"
      );
    }
  }, [profileData]);

  const photoUrl =
    profileData?.profilePhoto ||
    profileData?.profileImage ||
    profileData?.avatar ||
    "";
  const companyLogoUrl = profileData?.companyLogo || "";

  // Helper to ensure small logos are properly scaled
  const resizeImageIfSmall = (file, minWidth = 500) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width >= minWidth) {
            resolve(file);
            return;
          }

          const canvas = document.createElement("canvas");
          const scale = minWidth / img.width;
          canvas.width = minWidth;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              const newFile = new File([blob], file.name, {
                type: file.type,
              });
              resolve(newFile);
            },
            file.type,
            0.95
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Revert changes to initial saved data
  const handleReset = () => {
    if (profileData) {
      setFormData({
        name:
          profileData.userName ||
          profileData.name ||
          profileData.Name ||
          "",
        organizationName:
          profileData.organizationName ||
          profileData.companyName ||
          "",
        contactNumber:
          profileData.contactNumber ||
          profileData.ContactNumber ||
          "",
        email:
          profileData.businessEmail ||
          profileData.email ||
          profileData.Email ||
          "",
        profilePhoto: null,
        companyLogo: null,
        provider: profileData?.emailConfig?.provider || "",
        companyEmail: profileData?.emailConfig?.authEmail || "",
        appPassword: profileData?.emailConfig?.authPassword || "",
        smtpHost: profileData?.emailConfig?.smtpHost || "",
        smtpPort: String(profileData?.emailConfig?.smtpPort || ""),
        smtpSecure: profileData?.emailConfig?.smtpSecure ?? false,
        cloudName: profileData?.cloudinary?.cloudName || "",
        apiKey: profileData?.cloudinary?.apiKey || "",
        apiSecret: profileData?.cloudinary?.apiSecret || "",
      });
      setEmailHostingType(
        profileData?.emailConfig?.provider === "others" ? "others" : "gmail"
      );
      setFileName("No file chosen");
      setCompanyLogoName("No file chosen");
      showToast("Reverted changes to saved state", "info");
    }
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("organizationName", formData.organizationName);
    payload.append("contactNumber", formData.contactNumber);
    payload.append("businessEmail", formData.email);
    payload.append(
      "position",
      profileData?.role ||
        profileData?.Position ||
        profileData?.position ||
        userRole ||
        ""
    );
    payload.append("cloudName", formData.cloudName);
    payload.append("apiKey", formData.apiKey);
    payload.append("apiSecret", formData.apiSecret);
    payload.append("authEmail", formData.companyEmail);
    payload.append("authPassword", formData.appPassword);
    payload.append(
      "provider",
      emailHostingType === "others" ? "others" : "gmail"
    );
    payload.append("smtpHost", formData.smtpHost);
    payload.append("smtpPort", formData.smtpPort);
    payload.append("smtpSecure", formData.smtpSecure);

    if (formData.profilePhoto) {
      payload.append("profilePhoto", formData.profilePhoto);
    }
    if (formData.companyLogo) {
      payload.append("companyLogo", formData.companyLogo);
    }

    mutate(
      { formData: payload },
      {
        onSuccess: (res) => {
          showToast(res.message || "Profile updated successfully", "success");
          queryClient.invalidateQueries(["profile"]);
          if (res.data) {
            dispatch(updateUser(res.data));
          }
        },
        onError: (err) => {
          console.error("ERROR:", err.response?.data?.message);
          showToast(
            err.response?.data?.message || "Failed to update profile",
            "error"
          );
        },
      }
    );
  };

  const effectiveRole =
    profileData?.role ||
    profileData?.Position ||
    profileData?.position ||
    userRole ||
    "Recruiter";

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-['Plus_Jakarta_Sans'] text-slate-800">
      {/* 1. Breadcrumb & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <span className="text-slate-400">Settings</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-700">Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] mt-1">
            Profile & Workspace
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>{effectiveRole}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Verified Session</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2. Personal Credentials & Identity Showcase */}
        <ProfileInfoSection
          formData={formData}
          setFormData={setFormData}
          photoUrl={photoUrl}
          companyLogoUrl={companyLogoUrl}
          fileInputRef={fileInputRef}
          companyLogoInputRef={companyLogoInputRef}
          setFileName={setFileName}
          setCompanyLogoName={setCompanyLogoName}
          resizeImageIfSmall={resizeImageIfSmall}
          effectiveRole={effectiveRole}
          canViewConfigurations={canViewConfigurations}
        />

        {/* 3. Company Integrations: SMTP & Cloudinary (for authorized roles) */}
        {canViewConfigurations && (
          <CompanyConfigSection
            formData={formData}
            setFormData={setFormData}
            emailHostingType={emailHostingType}
            setEmailHostingType={setEmailHostingType}
            showAppPassword={showAppPassword}
            setShowAppPassword={setShowAppPassword}
            showApiSecret={showApiSecret}
            setShowApiSecret={setShowApiSecret}
          />
        )}

        {/* 4. Sticky Footer Action Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Changes to email relays and Cloudinary tokens take effect immediately upon saving.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Reset button */}
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-40"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Reset</span>
            </button>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
