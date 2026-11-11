import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const STATUS_FILTERS = ["All", "Open", "Closed"];

/**
 * PositionFilters Component
 * Toolbar providing status segment tabs (All, Open, Closed) and role dropdown filter.
 */
const PositionFilters = ({
  activeFilter = "All",
  onFilterChange,
  selectedRole = "All Position",
  onRoleChange,
  roles = ["All Position"],
}) => {
  const [roleOpen, setRoleOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!roleOpen) return;
    const onClick = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [roleOpen]);

  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status Segmented Buttons */}
      <div className="inline-flex w-full sm:w-auto rounded-xl bg-slate-100 p-1">
        {STATUS_FILTERS.map((filter) => {
          const active = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => onFilterChange && onFilterChange(filter)}
              className={`flex-1 sm:flex-none px-5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                active
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Role Dropdown Filter */}
      <div ref={roleDropdownRef} className="relative w-full sm:w-64">
        <button
          type="button"
          onClick={() => setRoleOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={roleOpen}
          className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-blue/50 focus:outline-none focus:ring-2 focus:ring-blue/30 transition-colors cursor-pointer"
        >
          <span className="truncate">{selectedRole}</span>
          <FiChevronDown
            className={`shrink-0 text-slate-400 transition-transform duration-200 ${
              roleOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {roleOpen && (
          <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
            <ul className="max-h-64 overflow-auto text-sm">
              {roles.map((r) => (
                <li key={r}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onRoleChange) onRoleChange(r);
                      setRoleOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 font-bold rounded-lg transition-colors cursor-pointer ${
                      selectedRole === r
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {r}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default PositionFilters;
