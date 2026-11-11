import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Reschedule from "../../component/schedule/Reschedule";

/**
 * ReschedulePage Controller
 * Route: /reschedule
 * Manages interview rescheduling parameters, date/time updates, and post-action redirects.
 */
const ReschedulePage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const interview = props.interview || state.interview;

  useEffect(() => {
    document.title = "Reschedule Interview | Talent OS";
  }, []);

  const handleCancel = () => {
    navigate("/schedule");
  };

  const handleSuccess = () => {
    navigate("/schedule");
  };

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/70">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Interview Selected</h2>
          <p className="text-sm text-slate-500">
            Please select an interview from the schedule to reschedule it.
          </p>
          <button
            type="button"
            onClick={() => navigate("/schedule")}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition cursor-pointer"
          >
            Go to Schedule
          </button>
        </div>
      </div>
    );
  }

  return (
    <Reschedule
      interview={interview}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
      {...props}
    />
  );
};

export default ReschedulePage;
