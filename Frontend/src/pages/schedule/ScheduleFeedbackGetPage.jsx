import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Schedule_Feedback_Get from "../../component/schedule/Schedule_Feedback_Get";

/**
 * ScheduleFeedbackGetPage Controller
 * Route: /schedule_Feedback_Get
 * Manages viewing previously submitted interview evaluation scores and decision records.
 */
const ScheduleFeedbackGetPage = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Recorded Interview Evaluation | Talent OS";
  }, []);

  const handleBack = () => {
    navigate("/schedule");
  };

  const handleSuccess = () => {
    navigate("/schedule");
  };

  return (
    <Schedule_Feedback_Get
      onBack={handleBack}
      onSuccess={handleSuccess}
      {...props}
    />
  );
};

export default ScheduleFeedbackGetPage;
