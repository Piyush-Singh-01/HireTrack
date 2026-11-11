import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {
  UserPlus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Lock,
  ShieldAlert,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Eye,
  X,
} from "lucide-react";

import AddPopup from "../../component/userAndRole/AddPopup";
import ViewProfile from "../../component/userAndRole/ViewProfile";
import DeletePopup from "../../component/userAndRole/DeletePopup";
import EditPopup from "../../component/userAndRole/EditPopup";
import SchedulePopup from "../../component/userAndRole/SchedulePopup";
import DeactivatePopUp from "../../component/userAndRole/DeactivatePopUp";
import { useDeleteUser, useGetAllUsers } from "../../hooks/useUserAndRole";

/**
 * UserAndRolePage (Route: /userAndRole)
 * 
 * Main page controller for User Directory & Access Roles.
 * Responsibilities:
 * 1. Restricts access to authorized roles (Admin, SuperAdmin).
 * 2. Fetches company team members and user directories.
 * 3. Provides live search (by name, role, position) and position dropdown filter.
 * 4. Displays real-time summary metrics (Total, Active, Disabled users).
 * 5. Controls modal popups for adding, editing, viewing, scheduling, deleting, and deactivating users.
 */
const UserAndRolePage = () => {
  // Authorization check
  const role = useSelector(
    (state) =>
      state.auth.role ||
      state.auth.user?.role ||
      state.auth.user?.Role ||
      ""
  );
  const normalizedRole = role.toString().trim().toLowerCase();
  const canAccessUserAndRole = ["admin", "superadmin"].includes(normalizedRole);

  // Data fetching
  const { data: getusers = [] } = useGetAllUsers();
  const deleteUser = useDeleteUser();

  // Document title
  useEffect(() => {
    document.title = "User & Role Management | Talent OS";
  }, []);

  // Selected user for modals
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState(null);

  // Modal visibility states
  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [schedulePopup, setSchedulePopup] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [deactivateAccountPopup, setDeactivateAccountPopup] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("All Position");

  // Derive unique positions from loaded users
  const uniquePositions = useMemo(() => {
    const positions = getusers
      .map((user) => user.Position)
      .filter(Boolean)
      .map((p) => p.trim());
    return ["All Position", ...new Set(positions)];
  }, [getusers]);

  // Filtered users based on search term and selected position
  const filteredUsers = useMemo(() => {
    return getusers.filter((user) => {
      const matchesPosition =
        selectedPosition === "All Position" ||
        user.Position?.toLowerCase() === selectedPosition.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        user.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.Role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.Position?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesPosition && matchesSearch;
    });
  }, [getusers, selectedPosition, searchTerm]);

  // Statistics counters
  const totalUsersCount = getusers.length;
  const activeUsersCount = getusers.filter(
    (u) => u.accountStatus === "Active"
  ).length;
  const disabledUsersCount = getusers.filter(
    (u) => u.accountStatus === "Disabled"
  ).length;

  // Actions
  const handleConfirmDelete = () => {
    deleteUser.mutate(selectedUserId, {
      onSuccess: () => {
        setDeletePopupOpen(false);
        setSelectedUserId(null);
      },
    });
  };

  const confirmDisable = () => {
    setDeactivateAccountPopup(false);
    setSelectedUserId(null);
  };

  // Redirect unauthorized users to dashboard
  if (!canAccessUserAndRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-12 font-inter">
      {/* 1. Header Banner & Quick Stats Section */}
      <div className="bg-white border-b border-slate-200 px-6 lg:px-12 py-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              <span>User &amp; Role Management</span>
              <ChevronRight size={14} />
              <span className="text-blue-600 font-semibold">Directory</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              User Profiles &amp; Permissions
            </h1>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center">
            {/* Total Users */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Total Users
                </p>
                <p className="text-base font-bold text-slate-800">
                  {totalUsersCount}
                </p>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <UserCheck size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Active
                </p>
                <p className="text-base font-bold text-slate-800">
                  {activeUsersCount}
                </p>
              </div>
            </div>

            {/* Disabled Users */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <UserX size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Disabled
                </p>
                <p className="text-base font-bold text-slate-800">
                  {disabledUsersCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Filter & Action Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Search & Position Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by name, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Position Dropdown */}
            <div className="relative w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Filter size={15} className="text-slate-400" />
                <select
                  className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer w-full"
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                >
                  {uniquePositions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Add User Button */}
          <button
            type="button"
            onClick={() => setAddPopupOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition duration-200 cursor-pointer"
          >
            <UserPlus size={18} />
            <span>Add New User</span>
          </button>
        </div>

        {/* Enterprise Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Position</th>
                  <th className="py-4 px-6">Profile Details</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50/80 transition duration-150"
                    >
                      {/* Name */}
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {user.Name
                              ? user.Name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <span>{user.Name || "Unnamed User"}</span>
                        </div>
                      </td>

                      {/* Department / Role */}
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                          <Briefcase size={12} className="text-slate-400" />
                          {user.Role || "N/A"}
                        </span>
                      </td>

                      {/* Position */}
                      <td className="py-4 px-6 text-slate-600">
                        {user.Position || "Unassigned"}
                      </td>

                      {/* View Details Link */}
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => {
                            setViewDetails(true);
                            setSelectedUserId(user._id);
                            setSelectedUserName(user.Name);
                          }}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs hover:underline cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>View Profile</span>
                        </button>
                      </td>

                      {/* Account Status Badge */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            user.accountStatus === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-rose-50 text-rose-700 border border-rose-200/60"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.accountStatus === "Active"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />
                          {user.accountStatus || "Active"}
                        </span>
                      </td>

                      {/* Actions Icons */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit */}
                          <button
                            type="button"
                            title="Edit User"
                            onClick={() => {
                              setEditPopupOpen(true);
                              setSelectedUserId(user._id);
                            }}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition cursor-pointer"
                          >
                            <Edit3 size={16} />
                          </button>

                          {/* Deactivate/Lock */}
                          <button
                            type="button"
                            title="Deactivate / Enable"
                            onClick={() => {
                              setDeactivateAccountPopup(true);
                              setSelectedUserId(user._id);
                            }}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 transition cursor-pointer"
                          >
                            <Lock size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            title="Delete User"
                            onClick={() => {
                              setDeletePopupOpen(true);
                              setSelectedUserId(user._id);
                            }}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShieldAlert size={36} className="text-slate-300" />
                        <p className="text-base font-semibold text-slate-600">
                          No users found
                        </p>
                        <p className="text-xs text-slate-400">
                          Try adjusting your search criteria or position filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Modal Dialogs */}
      <EditPopup
        isOpen={editPopupOpen}
        onClose={() => setEditPopupOpen(false)}
        selectedUserId={selectedUserId}
        getusers={getusers}
      />

      <AddPopup
        isOpen={addPopupOpen}
        onClose={() => setAddPopupOpen(false)}
      />

      {viewDetails && (
        <ViewProfile
          isOpen={viewDetails}
          onClose={() => setViewDetails(false)}
          selectedUserId={selectedUserId}
          selectedUserName={selectedUserName}
          setSelectedUserId={setSelectedUserId}
          setSelectedUserName={setSelectedUserName}
          setSchedulePopup={(val) => {
            setSchedulePopup(val);
            if (val) setViewDetails(false);
          }}
          getusers={getusers}
          setSchedules={setSchedules}
        />
      )}

      {schedulePopup && (
        <SchedulePopup
          isOpen={schedulePopup}
          onClose={() => setSchedulePopup(false)}
          selectedUserId={selectedUserId}
          getusers={getusers}
          schedules={schedules}
          selectedUserName={selectedUserName}
        />
      )}

      <DeletePopup
        isOpen={deletePopupOpen}
        onConfirm={() => {
          setDeletePopupOpen(false);
          handleConfirmDelete();
        }}
        isLoading={deleteUser.isPending}
        onCancel={() => setDeletePopupOpen(false)}
      />

      <DeactivatePopUp
        isOpen={deactivateAccountPopup}
        onClose={() => setDeactivateAccountPopup(false)}
        selectedUserId={selectedUserId}
        title={
          getusers.find((u) => u._id === selectedUserId)?.accountStatus ===
          "Disabled"
            ? "Enable Account?"
            : "Disable Account?"
        }
        message={
          getusers.find((u) => u._id === selectedUserId)?.accountStatus ===
          "Disabled"
            ? "This account will be re-activated and permissions restored."
            : "This account will be temporarily disabled. The user will not be able to log in."
        }
        isEnableMode={
          getusers.find((u) => u._id === selectedUserId)?.accountStatus ===
          "Disabled"
        }
        onConfirm={confirmDisable}
        onCancel={() => setDeactivateAccountPopup(false)}
      />
    </div>
  );
};

export default UserAndRolePage;
