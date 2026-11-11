import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApplicationModules } from "../../utils/AppModulesContext";
import CreateApplicationPage from "./CreateApplicationPage";
import CreateApplicationPage2 from "./CreateApplicationPage2";
import ScreeningPage from "./ScreeningPage";
import Review from "../../component/jobPost/Application/Review";

/**
 * MainApplicationPage
 * Wizard controller for setting up candidate application forms across 4 steps:
 * 1. Personal & Education info fields (CreateApplicationPage)
 * 2. Experience, skills & attachments (CreateApplicationPage2)
 * 3. Screening questions (ScreeningPage - if selected)
 * 4. Final Review & application link generation (Review)
 */
const MainApplicationPage = () => {
  const [step, setStep] = useState(1);
  const location = useLocation();
  const jobDetails = location.state?.jobDetails;
  const { selectedModules, formData, setFormData, resetFormData } =
    useApplicationModules();
  const [lastJobId, setLastJobId] = useState(null);

  useEffect(() => {
    document.title = "Application Form Setup | Talent OS";
  }, []);

  useEffect(() => {
    if (location.state?.step) {
      setStep(location.state.step);
    }
  }, [location.state]);

  useEffect(() => {
    const currentJobId = jobDetails?._id || null;
    if (!currentJobId) return;
    if (!lastJobId) {
      setLastJobId(currentJobId);
      return;
    }
    if (currentJobId !== lastJobId && !location.state?.step) {
      resetFormData();
      setStep(1);
    }
    setLastJobId(currentJobId);
  }, [jobDetails?._id, lastJobId, resetFormData, location.state?.step]);

  // Auto-advance past screening if not selected
  useEffect(() => {
    if (step === 3 && !selectedModules.screening && !location.state?.step) {
      nextStep();
    }
  }, [step, selectedModules.screening]);

  const nextStep = () => {
    if (step === 2 && !selectedModules.screening) {
      setStep(4); // Skip directly to review if screening not selected
    } else if (step === 2 && selectedModules.screening) {
      setStep(3); // Go to screening if selected
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step === 4 && !selectedModules.screening) {
      setStep(2); // Go back to page 2 if screening was skipped
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const goToStep = (num) => {
    if (num === 3 && !selectedModules.screening) {
      setStep(4);
    } else {
      setStep(num);
    }
  };

  return (
    <>
      {step === 1 && (
        <CreateApplicationPage
          jobDetails={jobDetails}
          nextStep={nextStep}
        />
      )}
      {step === 2 && (
        <CreateApplicationPage2
          jobDetails={jobDetails}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
      {step === 3 && selectedModules.screening && (
        <ScreeningPage
          jobDetails={jobDetails}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
      {step === 4 && (
        <main className="min-h-screen bg-slate-50 px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Review
              formData={formData}
              selectedModules={selectedModules}
              prevStep={prevStep}
              goToStep={goToStep}
              jobDetails={jobDetails}
            />
          </div>
        </main>
      )}
    </>
  );
};

export default MainApplicationPage;
