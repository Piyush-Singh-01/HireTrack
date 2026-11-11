import React from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Camera,
  BadgeCheck,
  Lock,
} from "lucide-react";


const ProfileInfoSection = ({
  formData,
  setFormData,
  photoUrl,
  companyLogoUrl,
  fileInputRef,
  companyLogoInputRef,
  setFileName,
  setCompanyLogoName,
  resizeImageIfSmall,
  effectiveRole,
  canViewConfigurations,
}) => {
  return (
    <>
      {/* Visual Identity & Branding Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition-all">
        {/* Decorative Top Gradient Strip */}
        <div className="h-32 sm:h-36 bg-gradient-to-br from-[#172554] via-[#263b83] to-[#4f46a5]  relative p-6 flex items-end justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 text-white">
            <span className="text-xs font-semibold tracking-wider uppercase bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
              Identity & Visual Branding
            </span>
          </div>
        </div>

        {/* Identity Body Row */}
        <div className="px-6 sm:px-8 pb-6 pt-3 sm:pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* User Avatar + Name Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Profile Photo Avatar (pops over the decorative strip) */}
              <div className="relative group w-fit -mt-16 sm:-mt-20 shrink-0">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl bg-slate-100 overflow-hidden cursor-pointer relative group transition-transform duration-300 hover:scale-105"
                >
                  {formData.profilePhoto ? (
                    <img
                      src={URL.createObjectURL(formData.profilePhoto)}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Profile avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold font-['Outfit']">
                      {(formData.name || "A")[0]?.toUpperCase()}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white text-xs font-semibold gap-1">
                    <Camera className="w-5 h-5 text-cyan-300" />
                    <span>Change</span>
                  </div>
                </div>

                {/* Camera quick edit button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full border-2 border-white flex items-center justify-center shadow-md transition-colors"
                  title="Upload profile photo"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData({ ...formData, profilePhoto: file });
                      setFileName(file.name);
                    }
                  }}
                  className="hidden"
                />
              </div>

              {/* Name & Basic Meta */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
                    {formData.name || "Talent Recruiter"}
                  </h2>
                  <BadgeCheck className="w-6 h-6 text-blue-600 shrink-0" />
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold uppercase tracking-wider border border-blue-100">
                    {effectiveRole}
                  </span>
                  <span>•</span>
                  <span className="text-slate-600 font-medium">
                    {formData.email || "No email assigned"}
                  </span>
                </div>
              </div>
            </div>

            {/* Company Logo Showcase (Visible if recruiter/admin) */}
            {canViewConfigurations && (
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shrink-0">
                <div className="space-y-0.5 text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900">
                    Company Brand Logo
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Displayed on candidate portals
                  </div>
                </div>

                <div className="relative group w-fit">
                  <div
                    onClick={() => companyLogoInputRef.current?.click()}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-dashed border-slate-300 hover:border-blue-500 flex items-center justify-center overflow-hidden cursor-pointer transition-all shadow-xs p-1"
                  >
                    {formData.companyLogo ? (
                      <img
                        src={URL.createObjectURL(formData.companyLogo)}
                        alt="Company logo preview"
                        className="w-full h-full object-contain"
                      />
                    ) : companyLogoUrl ? (
                      <img
                        src={companyLogoUrl}
                        alt="Company logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                        <Building2 className="w-6 h-6" />
                        <span className="text-[9px] font-bold mt-1 uppercase">
                          Logo
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-2xl">
                      <Camera className="w-4 h-4 text-cyan-300" />
                    </div>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={companyLogoInputRef}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const processedFile = await resizeImageIfSmall(file);
                        setFormData({
                          ...formData,
                          companyLogo: processedFile,
                        });
                        setCompanyLogoName(file.name);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Credentials Input Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Personal Credentials
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Manage basic account details, contact number, and authorized role.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Michael Vance"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Contact Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactNumber: e.target.value,
                  })
                }
                placeholder="e.g. +1 (555) 234-5678"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Primary Business Email (Immutable identifier) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Primary Business Email
              </label>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> Read-only
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={formData.email}
                disabled
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-100/80 border border-slate-200 text-slate-500 font-semibold cursor-not-allowed shadow-inner"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 ml-1">
              Your login identifier. Contact your administrator to modify credentials.
            </p>
          </div>

          {/* Platform Role */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Assigned Platform Role
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={effectiveRole}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-100/80 border border-slate-200 text-slate-700 font-semibold cursor-not-allowed shadow-inner"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 ml-1">
              Role determines access to company email relay, interviews & candidate analytics.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileInfoSection;
