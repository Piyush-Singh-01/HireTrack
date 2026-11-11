import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";

/**
 * CreateTaskPage
 * Assessment task creation page (/createtask).
 * Allows recruiters to configure aptitude questions, design, coding, or case study tasks.
 */
const CreateTaskPage = () => {
  const steps = ["Aptitude", "Design", "Coding", "Case Study"];
  const [active, setActive] = useState(0);

  useEffect(() => {
    document.title = "Create Assessment Task | Talent OS";
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Create Task</h1>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Category
        </p>

        {/* Category Pills */}
        <div className="my-4 flex items-center justify-around rounded-full bg-slate-100 p-1 w-full sm:w-2/3 md:w-[70%]">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => setActive(index)}
              className={`w-full py-1.5 px-3 rounded-full text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                active === index
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-indigo-600"
              }`}
            >
              {step}
            </button>
          ))}
        </div>

        {/* Title & Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700">
            Add Title and Description
          </label>
          <textarea
            className="mt-2 h-40 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none sm:w-3/4"
            placeholder={`e.g. Build a responsive login page\n\nDescribe the task clearly, expectations, and submission details.`}
          />
        </div>

        {/* Attachments for Design, Coding, Case Study */}
        {active !== 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-slate-700">Attachments</h2>
            <label
              htmlFor="file-upload"
              className="flex h-40 w-full sm:w-3/4 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition"
            >
              <input type="file" id="file-upload" className="hidden" />
              <p className="text-sm font-semibold text-slate-700">
                Attach design files or briefs
              </p>
              <p className="mt-1 text-xs text-slate-400">Supported formats: PDF, Images, ZIPs</p>
              <div className="mt-3">
                <span className="rounded-full bg-slate-200 px-4 py-1 text-xs font-medium text-slate-700">
                  Upload
                </span>
              </div>
            </label>
          </div>
        )}

        {/* Create Questions for Aptitude */}
        {active === 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-slate-700">Create Questions</p>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <FiPlus className="text-base" />
              Add Question
            </button>
          </div>
        )}

        {/* Additional Instructions */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700">
            Additional Instructions
          </label>
          <textarea
            className="mt-2 h-40 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none sm:w-3/4"
            placeholder={`e.g.\n• Why are you interested in this role?\n• Are you available for full-time / part-time?\n• When can you join if selected?`}
          />
          <div className="mt-6 flex justify-end sm:w-3/4">
            <button
              type="button"
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 cursor-pointer"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateTaskPage;
