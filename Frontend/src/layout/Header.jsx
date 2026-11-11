import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";
import getDisplayName from "../utils/getDisplayName";
import { useGetProfile } from "../hooks/settings/useGetProfile";
import { useNotifications } from "../hooks/useNotifications";
import { useSidebar } from "./SidebarContext";
import {
  Menu,
  Bell,
  CalendarDays,
  Calendar,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Mail,
} from "lucide-react";
import LogoutModal from "../component/ui/LogoutModal";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);

  const { logout } = useAuth();
  const { allNotifications } = useNotifications();
  const [hasUnread, setHasUnread] = useState(false);
  const [animateBell, setAnimateBell] = useState(false);

  const profileRef = useRef(null);
  const { data: profileData } = useGetProfile();

  const businessEmail = useSelector((state) => state.auth.businessEmail);
  const authUser = useSelector((state) => state.auth.user);
  const storedUsername = useSelector((state) => state.auth.username);
  const role = useSelector(
    (state) => state.auth.role || state.auth.user?.role || state.auth.user?.Role || "User"
  );
  const normalizedRole = role.toString().trim().toLowerCase();
  const roleLabel =
    normalizedRole === "superadmin"
      ? "Super Admin"
      : normalizedRole === "admin"
      ? "Administrator"
      : "Recruiter";

  const displayName = getDisplayName(authUser);
  const username = displayName === "Unknown" ? storedUsername || "Unknown" : displayName;
  const email =
    profileData?.email ||
    profileData?.businessEmail ||
    businessEmail ||
    authUser?.businessEmail ||
    authUser?.email ||
    authUser?.Email ||
    "No email";

  const todayDateNumber = new Date().getDate();
  const todayMonthName = new Date().toLocaleDateString("en-US", { month: "short" });

  /* Handles Profile pop-up toggle */
  const handleToggle = () => {
    setShowProfile((prev) => !prev);
  };

  useEffect(() => {
    setShowProfile(false);
  }, [location.pathname]);

  useEffect(() => {
    setHasUnread(allNotifications.some((n) => !n.isSeen));
  }, [allNotifications]);

  useEffect(() => {
    if (hasUnread) {
      setAnimateBell(true);
      const timer = setTimeout(() => {
        setAnimateBell(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [hasUnread]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { toggleMobile } = useSidebar();

  return (
    <header className="flex justify-between items-center px-4 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 transition-all shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
      {/* Left: Mobile Menu Trigger + Workspace Status Pill */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobile}
          className="md:hidden p-2 -ml-1.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition flex items-center justify-center cursor-pointer shadow-xs"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Desktop Workspace Status Pill */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/70 border border-slate-200/60 text-slate-700 font-semibold text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-['Outfit',sans-serif]">HireTrack Portal</span>
            <span className="text-[10px] uppercase font-bold text-cyan-600 bg-cyan-50 border border-cyan-200/60 px-1.5 py-0.2 rounded">
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions (Calendar, Notifications, User Profile) */}
      <div className="flex items-center py-2.5 sm:py-3 gap-2.5 sm:gap-3.5 relative">
        {/* 1. Smart Calendar Action Button */}
        <button
          type="button"
          onClick={() => navigate("/calendar")}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100/80 hover:bg-blue-50/80 border border-slate-200/70 hover:border-blue-300/80 text-slate-600 hover:text-blue-600 shadow-xs hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer group"
          title={`Interview Calendar (${todayMonthName} ${todayDateNumber})`}
          aria-label="View Calendar"
        >
          <CalendarDays size={18} className="group-hover:scale-110 transition-transform duration-200 text-slate-700 group-hover:text-blue-600" />
          <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black rounded-md shadow-xs leading-tight tabular-nums">
            {todayDateNumber}
          </span>
        </button>

        {/* 2. Notifications Action Button */}
        <button
          type="button"
          onClick={() => {
            navigate("/notify");
            setHasUnread(false);
          }}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100/80 hover:bg-indigo-50/80 border border-slate-200/70 hover:border-indigo-300/80 text-slate-600 hover:text-indigo-600 shadow-xs hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer group"
          title="Notifications"
          aria-label="View Notifications"
        >
          <Bell
            size={18}
            className={`text-slate-700 group-hover:text-indigo-600 group-hover:rotate-12 transition-transform duration-200 ${
              animateBell ? "animate-bell" : ""
            }`}
          />
          {hasUnread && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-red-500 to-rose-600 border-2 border-white shadow-[0_0_8px_#f43f5e]" />
            </span>
          )}
        </button>

        {/* 3. Modern User Profile Pill Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={handleToggle}
            className={`flex items-center gap-2.5 pl-1.5 pr-2.5 sm:pr-3 py-1 rounded-2xl transition-all duration-200 cursor-pointer border shadow-xs group ${
              showProfile
                ? "bg-blue-50/90 border-blue-200 ring-2 ring-blue-500/20"
                : "bg-slate-100/80 hover:bg-slate-200/70 border-slate-200/80 hover:border-slate-300"
            }`}
            aria-expanded={showProfile}
            aria-label="User profile menu"
          >
            {/* Avatar with Status Ring */}
            <div className="relative shrink-0">
              {profileData?.profilePhoto || profileData?.profileImage || profileData?.avatar ? (
                <img
                  src={profileData?.profilePhoto || profileData?.profileImage || profileData?.avatar}
                  alt={username}
                  className="w-8 h-8 rounded-xl object-cover border border-white shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white shadow-[0_0_6px_#34d399]" />
            </div>

            {/* Name & Role (Hidden on small viewports) */}
            <div className="hidden sm:flex flex-col text-left min-w-0">
              <span className="text-xs font-bold text-slate-800 truncate max-w-[110px] leading-tight font-['Outfit',sans-serif]">
                {username}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 truncate leading-tight">
                {roleLabel}
              </span>
            </div>

            {/* Chevron */}
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${
                showProfile ? "rotate-180 text-blue-600" : "group-hover:text-slate-600"
              }`}
            />
          </button>

          {/* 4. Executive User Profile Dropdown */}
          {showProfile && (
            <div
              ref={profileRef}
              className="absolute top-12 sm:top-14 right-0 w-80 max-w-[calc(100vw-24px)] rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.15)] z-50 overflow-hidden animate-scaleIn"
            >
              {/* Top Accent Gradient Bar */}
              <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400" />

              {/* Profile Card Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
                <div className="relative shrink-0">
                  {profileData?.profilePhoto || profileData?.profileImage || profileData?.avatar ? (
                    <img
                      src={profileData?.profilePhoto || profileData?.profileImage || profileData?.avatar}
                      alt={username}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-[0_0_8px_#34d399]" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate font-['Outfit',sans-serif]">
                      {username}
                    </h3>
                    <span className="text-[9px] uppercase font-bold text-cyan-700 bg-cyan-50 border border-cyan-200/60 px-1.5 py-0.5 rounded-full shrink-0">
                      {roleLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{email}</span>
                  </p>
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div className="p-2 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <User size={14} />
                    </span>
                    <span>View Profile & Settings</span>
                  </div>
                  <ChevronDown size={14} className="-rotate-90 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/calendar");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Calendar size={14} />
                    </span>
                    <span>Interview Calendar</span>
                  </div>
                  <ChevronDown size={14} className="-rotate-90 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/notify");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                      <Bell size={14} />
                    </span>
                    <span>Notifications</span>
                  </div>
                  {hasUnread ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-600 shadow-xs">
                      Unread
                    </span>
                  ) : (
                    <ChevronDown size={14} className="-rotate-90 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  )}
                </button>
              </div>

              {/* Card Footer: Sign Out Action */}
              <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    setShowPopUp(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Modern Logout Confirmation Modal (Rendered via Portal to body) */}
      <LogoutModal
        isOpen={showPopUp}
        onClose={() => setShowPopUp(false)}
        onConfirm={() => {
          setShowPopUp(false);
          logout();
        }}
      />
    </header>
  );
};

export default Header;
