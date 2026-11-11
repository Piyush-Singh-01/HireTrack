import React from "react";
import popupCancel from "../../assets/userAndRole/popupCancel.png";
import userprofilePhoto from "../../assets/userAndRole/profilePhoto.png";
import { useGetUserById } from "../../hooks/useUserAndRole";

function ViewProfile({
  isOpen,
  onClose,
  selectedUserId,
  selectedUserName,
  setSelectedUserId,
  setSelectedUserName,
  setSchedulePopup,
  getusers,
  setSchedules,
}) {
  if (!isOpen) return null;

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useGetUserById(selectedUserId);

  const user = response;
  const today = response?.status?.today;
  const thisMonth = response?.status?.thisMonth;
  const profile = response?.profilePhoto;

  const StatCard = ({ label, value }) => (
    <div className="rounded-lg border border-slate-200 bg-white p-2 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-base font-bold tracking-tight text-slate-800">
        {value ?? 0}
      </p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-3 py-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-profile-title"
        className="relative my-auto w-full max-w-md overflow-hidden rounded-xl border border-white/70 bg-white shadow-xl font-inter"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Compact Profile header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center cursor-pointer rounded-full bg-white/10 transition hover:bg-white/20 focus:outline-none"
          >
            <img src={popupCancel} alt="" className="h-2.5 w-2.5 brightness-0 invert" />
          </button>

          <div className="flex items-center gap-3 pr-6">
            {/* <div className="shrink-0 rounded-full bg-white/20 p-0.5 ring-1 ring-white/40">
              <img
                src={profile || userprofilePhoto}
                alt="Profile"
                className="h-12 w-12 rounded-full border border-white/80 object-cover sm:h-14 sm:w-14"
              />
            </div> */}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">
                User profile
              </p>
              <h2
                id="view-profile-title"
                className="truncate text-base font-bold text-white sm:text-lg leading-tight"
              >
                {user?.Name || selectedUserName || "Profile"}
              </h2>
              <p className="text-xs text-slate-300 truncate">
                {user?.Position || "Position not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-3.5 p-4 sm:p-5">
          {/* Loading / error states */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-6 text-xs text-slate-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
              Loading details...
            </div>
          ) : isError ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {error?.message || "Unable to load profile details."}
            </div>
          ) : (
            <>
              {/* Compact Information List */}
              <div>
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="h-4 w-1 rounded-full bg-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Personal Information
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase block">Full name</span>
                    <span className="font-semibold text-slate-800 truncate block">{user?.Name || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase block">Role</span>
                    <span className="font-semibold text-slate-800 truncate block">{user?.Role || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase block">Position</span>
                    <span className="font-semibold text-slate-800 truncate block">{user?.Position || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase block">Contact</span>
                    <span className="font-semibold text-slate-800 truncate block">{user?.ContactNumber || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Monthly stats */}
              <div>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="h-4 w-1 rounded-full bg-violet-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    This Month
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard label="Open" value={thisMonth?.positionsOpen} />
                  <StatCard label="Closed" value={thisMonth?.positionsClosed} />
                  <StatCard label="Hired" value={thisMonth?.hired} />
                </div>
              </div>

              {/* Today's Interviews banner */}
              <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                    Today
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    Interviews scheduled
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-blue-700 shadow-xs ring-1 ring-blue-100">
                  {today?.interviews || 0}
                </div>
              </div>
            </>
          )}

          {/* Compact Actions Footer */}
          <div className="flex gap-2 border-t border-slate-100 pt-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border cursor-pointer border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none"
            >
              Close
            </button>
            <button
              type="button"
              disabled={isLoading || isError || !user}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs cursor-pointer font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                setSchedulePopup(true);
                setSelectedUserId(user._id);
                setSelectedUserName(user.Name);
                setSchedules(response?.schedule || []);
                onClose();
              }}
            >
              View Schedule
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ViewProfile;