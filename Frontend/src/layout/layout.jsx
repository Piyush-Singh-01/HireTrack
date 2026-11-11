import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import SessionTimeoutPopup from "../component/common/SessionTimeoutPopup";
import { SidebarProvider, useSidebar } from "./SidebarContext";

const LayoutContent = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar: Desktop Floating/Docked Card & Mobile Drawer */}
      <Sidebar />

      {/* Main Column */}
      <div
        className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsed ? "ml-0 md:ml-[92px]" : "ml-0 md:ml-[264px]"
        }`}
      >
        <Header />
        <SessionTimeoutPopup />

        <main className="flex-1 overflow-y-auto hide-scrollbar bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const ProtectedLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default ProtectedLayout;
