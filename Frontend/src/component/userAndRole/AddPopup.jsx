import React, { useState, useRef, useEffect } from "react";
import popupCancel from "../../assets/userAndRole/popupCancel.png";
import { useAddUser, useGetAllUsers } from "../../hooks/useUserAndRole";
import {
  Eye,
  EyeOff,
  User,
  Briefcase,
  ShieldCheck,
  Phone,
  Mail,
  Lock,
  ChevronDown,
  UserPlus,
  Sparkles,
} from "lucide-react";

function AddPopup({ isOpen, onClose }) {
  const addUser = useAddUser();
  const { data: allUsers = [] } = useGetAllUsers();
  const uniquePositions = [...new Set(allUsers.map((u) => u.Position).filter(Boolean))];

  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const positionDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        positionDropdownRef.current &&
        !positionDropdownRef.current.contains(event.target)
      ) {
        setIsPositionDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    Name: "",
    Role: "Admin",
    Position: "",
    ContactNumber: "",
    password: "",
    Email: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "ContactNumber") {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    addUser.mutate(formData, {
      onSuccess: () => {
        onClose();
        setFormData({
          Name: "",
          Role: "Admin",
          Position: "",
          password: "",
          ContactNumber: "",
          Email: "",
        });
      },
    });
  };

  if (!isOpen) return null;

  const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  const labelClassName =
    "mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600";

  const fieldIconClassName =
    "pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 px-3 py-5 backdrop-blur-sm sm:px-5">
      <div className="relative my-auto flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_90px_-24px_rgba(15,23,42,0.55)]">
        {/* Modal header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#172554] via-[#293f85] to-[#5b4fc4] px-5 py-5 text-white sm:px-7 sm:py-6">
          <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-violet-300/20 blur-2xl" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close add user popup"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center cursor-pointer rounded-full border border-white/20 bg-white/10 transition hover:rotate-90 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60 sm:right-5 sm:top-5"
          >
            <img src={popupCancel} alt="" className="h-3 w-3 brightness-0 invert" />
          </button>

          <div className="relative flex items-center gap-4 pr-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner shadow-white/10 sm:h-14 sm:w-14">
              <UserPlus className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.8} />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-100/80">
                <Sparkles className="h-3 w-3" /> Team management
              </div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Add new user</h2>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-indigo-100/80 sm:text-sm">
                Create a team account and assign the right role and position.
              </p>
            </div>
          </div>
        </div>

        {/* Form body */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/90 to-white px-5 py-5 sm:px-7 sm:py-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 sm:text-base">User information</h3>
                <p className="mt-1 text-xs text-slate-500">Enter the details for the new team member.</p>
              </div>
              <span className="hidden rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 sm:inline-flex">
                New account
              </span>
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label className={labelClassName}>Name</label>
                <div className="group relative">
                  <User className={fieldIconClassName} />
                  <input
                    type="text"
                    placeholder="Enter full name"
                    name="Name"
                    className={inputClassName}
                    value={formData.Name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Position */}
              <div className="relative" ref={positionDropdownRef}>
                <label className={labelClassName}>Position</label>
                <div className="relative">
                  <Briefcase className={fieldIconClassName} />
                  <input
                    type="text"
                    placeholder="e.g. UI/UX Designer"
                    name="Position"
                    autoComplete="off"
                    className={`${inputClassName} pr-10`}
                    value={formData.Position}
                    onChange={(e) => {
                      handleChange(e);
                      setIsPositionDropdownOpen(true);
                    }}
                    onFocus={() => setIsPositionDropdownOpen(true)}
                  />
                  <button
                    type="button"
                    aria-label="Toggle position suggestions"
                    aria-expanded={isPositionDropdownOpen}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600"
                    onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${isPositionDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
                {isPositionDropdownOpen && uniquePositions.length > 0 && (
                  <div className="absolute z-30 mt-2 max-h-44 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.35)]">
                    {uniquePositions
                      .filter((pos) =>
                        pos.toLowerCase().includes(formData.Position.toLowerCase())
                      )
                      .map((pos) => (
                        <button
                          type="button"
                          key={pos}
                          className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                          onClick={() => {
                            setFormData({ ...formData, Position: pos });
                            setIsPositionDropdownOpen(false);
                          }}
                        >
                          {pos}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label className={labelClassName}>Role</label>
                <div className="relative">
                  <ShieldCheck className={fieldIconClassName} />
                  <select
                    className={`${inputClassName} cursor-pointer appearance-none pr-10`}
                    name="Role"
                    value={formData.Role}
                    onChange={handleChange}
                    required
                  >
                    <option>Admin</option>
                    <option>Interviewer</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <label className={labelClassName}>Contact number</label>
                <div className="relative">
                  <Phone className={fieldIconClassName} />
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    name="ContactNumber"
                    className={inputClassName}
                    value={formData.ContactNumber}
                    onChange={handleChange}
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClassName}>Email address</label>
                <div className="relative">
                  <Mail className={fieldIconClassName} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    name="Email"
                    className={inputClassName}
                    value={formData.Email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={labelClassName}>Password</label>
                <div className="relative">
                  <Lock className={fieldIconClassName} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    name="password"
                    className={`${inputClassName} pr-11`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] leading-relaxed text-slate-400">
                User access will follow the selected role.
              </p>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl hover:shadow-indigo-600/25 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
                disabled={addUser.isPending}
              >
                {addUser.isPending ? "Submitting..." : "Create user"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPopup;
