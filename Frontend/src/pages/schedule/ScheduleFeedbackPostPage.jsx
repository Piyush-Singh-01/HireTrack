import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Schedule_Feedback_Post from "../../component/schedule/Schedule_Feedback_Post";

/**
 * ScheduleFeedbackPostPage Controller
 * Route: /schedule_Feedback_Post
 * Manages post-interview feedback submission, criteria ratings, and recommendation outcomes.
 */
const ScheduleFeedbackPostPage = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Interview Evaluation & Feedback | Talent OS";
  }, []);

  const handleBack = () => {
    navigate("/schedule");
  };

  const handleSuccess = () => {
    navigate("/schedule");
  };

  return (
    <Schedule_Feedback_Post
      onBack={handleBack}
      onSuccess={handleSuccess}
      {...props}
    />
  );
};

export default ScheduleFeedbackPostPage;
