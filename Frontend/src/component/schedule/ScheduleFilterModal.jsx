import React from "react";

/**
 * ScheduleFilterModal Component
 * Modal dialog for filtering interviews by position, status, and custom date range.
 */
const ScheduleFilterModal = ({
  isOpen,
  onClose,
  onApply,
  filterPosition,
  setFilterPosition,
  positionOptions = [],
  filterStatus,
  setFilterStatus,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-slate-900/40 p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 w-full max-w-md animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-extrabold text-slate-900 mb-6">
          Filter &amp; Sort Interviews
        </h3>

        <div className="space-y-4 text-xs font-bold text-slate-600 mb-8">
          <div>
            <label className="block mb-1.5 text-slate-400 uppercase tracking-wider text-[10px]">
              Position
            </label>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full bg-white border border-slate-200 cursor-pointer rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All Position">All Position</option>
              {positionOptions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-slate-400">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All Status" className="bg-indigo-50 font-semibold text-indigo-700">
                All Status
              </option>
              <option value="Scheduled" className="bg-blue-50 text-blue-700">
                Scheduled
              </option>
              <option value="Completed" className="bg-emerald-50 text-emerald-700">
                Completed
              </option>
              <option value="Hired" className="bg-green-50 font-semibold text-green-700">
                Hired
              </option>
              <option value="Rejected" className="bg-red-50 text-red-700">
                Rejected
              </option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-slate-400 uppercase tracking-wider text-[10px]">
                From Date
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-slate-400 uppercase tracking-wider text-[10px]">
                To Date
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApply}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-500/20"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleFilterModal;
