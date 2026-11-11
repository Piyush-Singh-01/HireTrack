import React, { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Schedule from "../../component/schedule/Schedule";

/**
 * SchedulePage Controller
 * Route: /schedule
 * Manages daily and historical interview schedules, status tabs, date switching, and modals.
 */
const SchedulePage = (props) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const queryDate = searchParams.get("date") || location.state?.date || "Today";
  const queryTab = searchParams.get("tab") || location.state?.tab || "All";

  useEffect(() => {
    document.title = "Interview Schedule | Talent OS";
  }, []);

  return (
    <Schedule
      initialDate={queryDate}
      initialTab={queryTab}
      {...props}
    />
  );
};

export default SchedulePage;
