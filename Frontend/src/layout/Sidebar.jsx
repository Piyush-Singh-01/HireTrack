import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";
import { useSidebar } from "./SidebarContext";
import { useGetProfile } from "../hooks/settings/useGetProfile";
import getDisplayName from "../utils/getDisplayName";
import LogoutModal from "../component/ui/LogoutModal";

import logoutIcon from "../assets/sidebar_img/logout.png";
import dashboardIcon from "../assets/sidebar_img/dashboard.png";
import positionsIcon from "../assets/sidebar_img/position.png";
import scheduleIcon from "../assets/sidebar_img/schedule.png";
import jobpostIcon from "../assets/sidebar_img/jobPost.png";
import UserIcon from "../assets/sidebar_img/UserRole.png";
import settingsIcon from "../assets/sidebar_img/settings.png";

import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  FilePlus2,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Sparkles,
  ShieldCheck,
  User,
  Sliders,
  Bell,
  Lock,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeMainSection, setActiveMainSection] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: profileData } = useGetProfile();
  const role = useSelector(
    (state) => state.auth.role || state.auth.user?.role || state.auth.user?.Role || "User"
  );
  const normalizedRole = role.toString().trim().toLowerCase();
  const canSeeUserAndRole = ["admin", "superadmin"].includes(normalizedRole);

  const authUser = useSelector((state) => state.auth.user);
  const storedUsername = useSelector((state) => state.auth.username);
  const displayName = getDisplayName(authUser) || storedUsername || "User";

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      pngIcon: dashboardIcon,
    },
    {
      name: "Positions",
      path: "/positions",
      icon: Briefcase,
      pngIcon: positionsIcon,
    },
    {
      name: "Schedule",
      path: "/schedule",
      icon: CalendarDays,
      pngIcon: scheduleIcon,
    },
    {
      name: "Job Post",
      path: "/jobpost",
      icon: FilePlus2,
      pngIcon: jobpostIcon,
    },
    ...(canSeeUserAndRole
      ? [
          {
            name: "User & Role",
            path: "/userAndRole",
            icon: Users,
            pngIcon: UserIcon,
          },
        ]
      : []),
    {
      name: "Settings",
      path: "/profile",
      icon: Settings,
      pngIcon: settingsIcon,
      isDropdown: true,
    },
  ];

  const settingsItems = [
    { name: "Profile", path: "/profile", icon: User },
    { name: "Meeting Settings", path: "/meetings", icon: Sliders },
    { name: "Notifications", path: "/notification", icon: Bell },
    { name: "Privacy & Security", path: "/privacy", icon: Lock },
  ];

  const determineActiveSection = (pathname) => {
    const currentMain = pathname.split("/")[1];
    const matchingMainItem = menuItems.find(
      (item) => item.path.split("/")[1] === currentMain
    );
    if (matchingMainItem) return matchingMainItem.name;

    const isInSettings = settingsItems.some((item) =>
      pathname.startsWith(item.path)
    );
    if (isInSettings) return "Settings";

    return null;
  };

  useEffect(() => {
    const section = determineActiveSection(location.pathname);
    if (section) setActiveMainSection(section);

    const isInSettings = settingsItems.some((item) =>
      location.pathname.startsWith(item.path)
    );
    if (isInSettings) {
      setSettingsOpen(true);
    }
  }, [location.pathname]);

  const isSettingsActive = settingsItems.some((item) =>
    location.pathname.startsWith(item.path)
  );

  // Render Sidebar Content shared between Desktop card and Mobile drawer
  const renderSidebarContent = (isMobile = false) => {
    const collapsed = !isMobile && isCollapsed;

    return (
      <div className="flex flex-col h-full w-full justify-between select-none relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.18),_transparent_70%)] pointer-events-none" />

        {/* 1. Header & Brand Area */}
        <div className="shrink-0 px-3.5 pt-4 pb-3 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center justify-between">
            {collapsed ? (
              <button
                onClick={toggleCollapse}
                className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-500 p-[1.5px] shadow-lg shadow-blue-500/30 hover:shadow-cyan-400/40 hover:scale-105 transition-all duration-200 cursor-pointer group relative"
                title="Expand sidebar"
              >
                <div className="w-full h-full rounded-[10px] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                  <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                    HT
                  </span>
                </div>
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-[0_0_8px_#34d399]" />
              </button>
            ) : (
              <div className="flex items-center justify-between w-full">
                <NavLink
                  to="/dashboard"
                  onClick={() => isMobile && closeMobile()}
                  className="flex items-center gap-2.5 min-w-0 group cursor-pointer select-none"
                  title="HireTrack Dashboard"
                >
                  {/* Modern Glass Gradient Icon Emblem */}
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-400 p-[1.5px] shadow-md shadow-blue-500/30 group-hover:shadow-cyan-400/40 group-hover:scale-105 transition-all duration-300">
                      <div className="w-full h-full rounded-[10px] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center">
                        <Sparkles
                          size={16}
                          className="text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)] group-hover:rotate-12 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950 shadow-[0_0_6px_#34d399]" />
                  </div>

                  {/* Stylish Typography for HireTrack */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center leading-none">
                      <span className="font-extrabold text-[18px] tracking-tight text-white group-hover:text-cyan-50 transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] font-['Outfit',sans-serif]">
                        Hire
                      </span>
                      <span className="font-black text-[18px] tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(56,189,248,0.45)] font-['Outfit',sans-serif]">
                        Track
                      </span>
                      <span className="ml-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
                    </div>
                    {/* <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-400/80 group-hover:text-cyan-400/90 transition-colors mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
                      Talent OS
                    </span> */}
                  </div>
                </NavLink>

                {isMobile ? (
                  <button
                    onClick={closeMobile}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    aria-label="Close sidebar"
                  >
                    <X size={19} />
                  </button>
                ) : (
                  <button
                    onClick={toggleCollapse}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    <PanelLeftClose size={17} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Workspace Pill (Expanded only) */}
          {!collapsed && (
            <div className="mt-3.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="text-xs font-semibold text-slate-200 truncate">
                  HireTrack Workspace
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-700/50 px-1.5 py-0.5 rounded tracking-wider shrink-0">
                PRO
              </span>
            </div>
          )}
        </div>

        {/* 2. Main Navigation Links */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-2.5 py-3.5 space-y-1 relative z-10">
          {!collapsed && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Navigation
            </p>
          )}

          {menuItems.map((item) => {
            const isActive = activeMainSection === item.name;
            const Icon = item.icon;

            if (item.isDropdown) {
              return (
                <div key={item.name} className="flex flex-col">
                  {collapsed ? (
                    <NavLink
                      to={item.path}
                      onClick={() => isMobile && closeMobile()}
                      className={`relative group flex items-center justify-center w-11 h-11 mx-auto rounded-xl transition-all duration-200 cursor-pointer ${
                        isActive || isSettingsActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                          : "text-slate-300 hover:text-white hover:bg-white/[0.08]"
                      }`}
                      title={item.name}
                    >
                      <Icon size={19} />
                      {/* Tooltip */}
                      <span className="absolute left-full ml-3.5 px-2.5 py-1 bg-slate-900/95 text-white text-xs font-semibold rounded-lg shadow-xl border border-white/10 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.name}
                      </span>
                    </NavLink>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setSettingsOpen((prev) => !prev)}
                        className={`w-full relative group flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                          isActive || isSettingsActive
                            ? "bg-white/[0.08] text-white font-semibold"
                            : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            size={18}
                            className={
                              isActive || isSettingsActive
                                ? "text-cyan-400"
                                : "text-slate-400 group-hover:text-white"
                            }
                          />
                          <span className="text-[13px] font-medium tracking-tight">
                            {item.name}
                          </span>
                        </div>
                        <ChevronDown
                          size={15}
                          className={`text-slate-400 transition-transform duration-200 ${
                            settingsOpen ? "rotate-180 text-white" : ""
                          }`}
                        />
                      </button>

                      {/* Animated Submenu */}
                      {settingsOpen && (
                        <div className="ml-4 pl-3.5 my-1 border-l-2 border-white/10 flex flex-col space-y-0.5 animate-fadeIn">
                          {settingsItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = location.pathname.startsWith(
                              subItem.path
                            );

                            return (
                              <NavLink
                                key={subItem.name}
                                to={subItem.path}
                                onClick={() => isMobile && closeMobile()}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                                  isSubActive
                                    ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white font-semibold shadow-sm"
                                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <SubIcon
                                    size={13}
                                    className={
                                      isSubActive ? "text-cyan-300" : "text-slate-400"
                                    }
                                  />
                                  <span>{subItem.name}</span>
                                </div>
                                {isSubActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9]" />
                                )}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => isMobile && closeMobile()}
                className={({ isActive: navActive }) => {
                  const currentActive = isActive || navActive;
                  return collapsed
                    ? `relative group flex items-center justify-center w-11 h-11 mx-auto rounded-xl transition-all duration-200 cursor-pointer ${
                        currentActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                          : "text-slate-300 hover:text-white hover:bg-white/[0.08]"
                      }`
                    : `relative group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                        currentActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/20"
                          : "text-slate-300 hover:text-white hover:bg-white/[0.07]"
                      }`;
                }}
              >
                {({ isActive: navActive }) => {
                  const currentActive = isActive || navActive;
                  return (
                    <>
                      {/* Leading Active Glow Bar (Expanded only) */}
                      {!collapsed && currentActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-300 rounded-r-full shadow-[0_0_8px_#38bdf8]" />
                      )}

                      <Icon
                        size={collapsed ? 19 : 18}
                        className={`transition-colors shrink-0 ${
                          currentActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-white"
                        }`}
                      />

                      {!collapsed && (
                        <span className="text-[13px] tracking-tight truncate">
                          {item.name}
                        </span>
                      )}

                      {/* Tooltip when collapsed */}
                      {collapsed && (
                        <span className="absolute left-full ml-3.5 px-2.5 py-1 bg-slate-900/95 text-white text-xs font-semibold rounded-lg shadow-xl border border-white/10 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.name}
                        </span>
                      )}
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </div>

        {/* 3. Footer: User Status Card & Logout */}
        <div className="shrink-0 p-3 border-t border-white/[0.08] relative z-10 space-y-2">
          {/* User Preview */}
          {!collapsed ? (
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-2.5">
              <div className="relative shrink-0">
                {profileData?.profilePhoto || profileData?.avatar ? (
                  <img
                    src={profileData?.profilePhoto || profileData?.avatar}
                    alt={displayName}
                    className="w-8 h-8 rounded-lg object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 shadow-[0_0_6px_#34d399]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {displayName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-medium text-slate-400 truncate">
                    {normalizedRole === "superadmin"
                      ? "Super Admin"
                      : normalizedRole === "admin"
                      ? "Administrator"
                      : "Recruiter"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-1 group relative">
              <div className="relative">
                {profileData?.profilePhoto || profileData?.avatar ? (
                  <img
                    src={profileData?.profilePhoto || profileData?.avatar}
                    alt={displayName}
                    className="w-9 h-9 rounded-xl object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900" />
              </div>

              {/* Tooltip */}
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900/95 text-white text-xs font-semibold rounded-lg shadow-xl border border-white/10 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                {displayName} ({role})
              </span>
            </div>
          )}

          {/* Logout Action */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className={`w-full group flex items-center rounded-xl transition-all duration-200 cursor-pointer text-slate-400 hover:text-red-300 hover:bg-red-500/15 ${
              collapsed
                ? "justify-center h-10 w-10 mx-auto"
                : "gap-2.5 px-3 py-2 text-xs font-medium"
            }`}
            title="Sign out of account"
          >
            <LogOut
              size={17}
              className="group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-red-400"
            />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ============================================================
          DESKTOP SIDEBAR (Floating Modern Card)
          ============================================================ */}
      <aside
        className={`hidden md:flex fixed top-2.5 bottom-2.5 left-2.5 z-40 flex-col rounded-2xl border border-white/[0.09] shadow-[0_20px_50px_rgba(11,20,48,0.38)] bg-gradient-to-b from-[#141f3d]/98 via-[#18264e]/98 to-[#0d162a]/98 backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsed ? "w-[78px]" : "w-[250px]"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* ============================================================
          MOBILE DRAWER & BACKDROP (< 768px)
          ============================================================ */}
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobile}
      />

      {/* Mobile Slide-out Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-[275px] z-50 flex flex-col bg-gradient-to-b from-[#141f3d] via-[#18264e] to-[#0d162a] border-r border-white/10 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderSidebarContent(true)}
      </div>

      {/* ============================================================
          MODERN LOGOUT CONFIRMATION MODAL (Portal-based)
          ============================================================ */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
      />
    </>
  );
};

export default Sidebar;
