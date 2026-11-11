import React from "react";

const steps = [
  { id: 1, label: "Select Template" },
  { id: 2, label: "Offer Details" },
  { id: 3, label: "Review and Send" },
];

const OfferLetterStepper = ({ currentStep = 1 }) => {
  return (
    <div className="flex items-center justify-start xl:justify-center mb-12 pb-4">
      <div className="flex items-center min-w-max">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors duration-200 ${
                    isCompleted || isCurrent
                      ? "bg-blue-600 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isCurrent || isCompleted ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`w-16 sm:w-24 md:w-32 h-px mx-4 transition-colors duration-200 ${
                    step.id < currentStep ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OfferLetterStepper;
