import React from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Server,
  Cloud,
  Key,
  ExternalLink,
} from "lucide-react";

/**
 * CompanyConfigSection Component
 * 
 * Section 2 of Profile Settings:
 * Allows authorized recruiters/admins to configure:
 * 1. Email Dispatch & SMTP relay (Gmail 16-digit App Password or custom SMTP)
 * 2. Cloud Media Storage (Cloudinary Cloud Name, API Key, and API Secret)
 */
const CompanyConfigSection = ({
  formData,
  setFormData,
  emailHostingType,
  setEmailHostingType,
  showAppPassword,
  setShowAppPassword,
  showApiSecret,
  setShowApiSecret,
}) => {
  return (
    <>
      {/* 1. Email Dispatch & SMTP Integration */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                Email Dispatch & SMTP Integration
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Automated interview calendar invites, candidate notifications & system alerts.
              </p>
            </div>
          </div>

          {/* Service Type Selector: Gmail vs Custom SMTP */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => {
                setEmailHostingType("gmail");
                setFormData({
                  ...formData,
                  smtpHost: "",
                  smtpPort: "",
                  smtpSecure: false,
                });
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                emailHostingType === "gmail"
                  ? "bg-white text-emerald-700 shadow-sm border border-emerald-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Gmail (App Password)
            </button>

            <button
              type="button"
              onClick={() => setEmailHostingType("others")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                emailHostingType === "others"
                  ? "bg-white text-emerald-700 shadow-sm border border-emerald-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Custom SMTP Relay
            </button>
          </div>
        </div>

        {/* Email Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Sending Email Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {emailHostingType === "gmail"
                ? "Google / Gmail Address"
                : "Sender Authentication Email"}
              <span className="text-rose-500"> *</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companyEmail: e.target.value,
                  })
                }
                placeholder={
                  emailHostingType === "gmail"
                    ? "recruiting@gmail.com"
                    : "noreply@company.com"
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-xs"
              />
            </div>
            {emailHostingType === "gmail" && (
              <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
                Must be a valid @gmail.com or Google Workspace address.
              </p>
            )}
          </div>

          {/* Password / Google App Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                {emailHostingType === "gmail"
                  ? "Google 16-Digit App Password"
                  : "SMTP Relay Password"}
                <span className="text-rose-500"> *</span>
              </label>
              {emailHostingType === "gmail" && (
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                >
                  <span>Generate Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showAppPassword ? "text" : "password"}
                value={formData.appPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    appPassword: e.target.value,
                  })
                }
                placeholder={
                  emailHostingType === "gmail"
                    ? "abcd efgh ijkl mnop"
                    : "Enter SMTP password"
                }
                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowAppPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showAppPassword ? "Hide password" : "Show password"}
              >
                {showAppPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {emailHostingType === "gmail" && (
              <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
                Generated via Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords.
              </p>
            )}
          </div>

          {/* Custom SMTP Server Config (only if "others" selected) */}
          {emailHostingType === "others" && (
            <>
              {/* Provider Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Email Provider Name
                </label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      provider: e.target.value,
                    })
                  }
                  placeholder="e.g. Outlook, SendGrid, Amazon SES"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-xs"
                />
              </div>

              {/* SMTP Host */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  SMTP Server Host
                </label>
                <div className="relative">
                  <Server className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.smtpHost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtpHost: e.target.value,
                      })
                    }
                    placeholder="e.g. smtp.office365.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* SMTP Port */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  SMTP Port
                </label>
                <input
                  type="text"
                  value={formData.smtpPort}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      smtpPort: e.target.value,
                    })
                  }
                  placeholder="e.g. 587 or 465"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-xs"
                />
              </div>

              {/* TLS / SSL Security Protocol */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  TLS / SSL Security Protocol
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, smtpSecure: false })
                    }
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                      !formData.smtpSecure
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    STARTTLS (Port 587)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, smtpSecure: true })
                    }
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                      formData.smtpSecure
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    SSL / TLS (Port 465)
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Cloud Media Storage (Cloudinary API) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Cloud Media Storage (Cloudinary)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Encrypted CDN bucket credentials for resume PDFs, candidate photos, and interview recordings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Cloud Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Cloudinary Cloud Name
            </label>
            <div className="relative">
              <Cloud className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.cloudName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cloudName: e.target.value,
                  })
                }
                placeholder="e.g. talent-os-prod"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all shadow-xs"
              />
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Cloudinary API Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.apiKey}
                onChange={(e) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                placeholder="e.g. 842192938491823"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all shadow-xs"
              />
            </div>
          </div>

          {/* API Secret with Eye Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Cloudinary API Secret
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showApiSecret ? "text" : "password"}
                value={formData.apiSecret}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    apiSecret: e.target.value,
                  })
                }
                placeholder="Enter secret token"
                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowApiSecret((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showApiSecret ? "Hide secret" : "Show secret"}
              >
                {showApiSecret ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyConfigSection;
