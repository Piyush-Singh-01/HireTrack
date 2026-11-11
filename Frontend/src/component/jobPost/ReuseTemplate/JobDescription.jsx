import { useCallback } from "react";
import TextareaWithLabel from "./TextareaWithLable";

const JobDescription = ({ applicationDetails, setApplicationDetails }) => {
  const handleChangeDescription = useCallback(
    (field, value) => {
      setApplicationDetails((prev) => ({
        ...prev,
        description: {
          ...prev.description,
          [field]: value,
        },
      }));
    },
    [setApplicationDetails]
  );

  const formatToBullets = (text) => {
    if (!text) return "";
    return text
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";
        // If it starts with a bullet, keep it as is
        if (
          trimmed.startsWith("•") ||
          trimmed.startsWith("-") ||
          trimmed.startsWith("*")
        ) {
          return trimmed;
        }
        // Otherwise add the bullet
        return `• ${trimmed}`;
      })
      .filter((line) => line !== "")
      .join("\n");
  };

  const handleBlur = (field, value) => {
    const formattedValue = formatToBullets(value);
    handleChangeDescription(field, formattedValue);
  };

  return (
    <div className="w-full">
      <div className="mb-6 border-b border-slate-100 pb-5">
        <div className="mb-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Step 2 <span className="mx-1.5 text-blue-300">/</span> Job details
        </div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-[28px]">
          Job Description
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Explain the role, responsibilities, and skills candidates need. Clear details help candidates understand whether the position is right for them.
        </p>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-200 hover:border-slate-300 sm:p-5">
          <div className="mb-3 flex items-start gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
              01
            </span>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 sm:text-base">Role overview</h4>
              <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">
                Introduce the position and its impact on the team.
              </p>
            </div>
          </div>
          <TextareaWithLabel
            label="About The Role"
            value={applicationDetails.description.about}
            placeholder="Briefly describe what this role is about and its impact"
            onChange={(value) => handleChangeDescription("about", value)}
            autoNewline={true}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-200 hover:border-slate-300 sm:p-5">
          <div className="mb-3 flex items-start gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-700">
              02
            </span>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 sm:text-base">Responsibilities</h4>
              <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">
                Add the main tasks and day-to-day responsibilities.
              </p>
            </div>
          </div>
          <TextareaWithLabel
            label="Key Responsibilities"
            value={applicationDetails.description.responsibilities}
            placeholder="List main duties (e.g. build UI, collaborate with backend, review code)"
            onChange={(value) => handleChangeDescription("responsibilities", value)}
            onBlur={(value) => handleBlur("responsibilities", value)}
            autoNewline={true}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-200 hover:border-slate-300 sm:p-5">
          <div className="mb-3 flex items-start gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50 text-sm font-bold text-violet-700">
              03
            </span>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 sm:text-base">Required skills</h4>
              <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">
                Specify the essential experience, tools, and frameworks.
              </p>
            </div>
          </div>
          <TextareaWithLabel
            label="Requirements / Skills Needed"
            value={applicationDetails.description.requirements}
            placeholder="Mention required skills, experience, tools, frameworks"
            onChange={(value) => handleChangeDescription("requirements", value)}
            onBlur={(value) => handleBlur("requirements", value)}
            autoNewline={true}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-200 hover:border-slate-300 sm:p-5">
          <div className="mb-3 flex items-start gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700">
              04
            </span>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 sm:text-base">Preferred qualifications</h4>
              <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">
                Include useful skills or experience that are nice to have.
              </p>
            </div>
          </div>
          <TextareaWithLabel
            label="Preferred Qualifications"
            value={applicationDetails.description.preferredQualifications}
            placeholder="Nice-to-have skills or experience"
            onChange={(value) =>
              handleChangeDescription("preferredQualifications", value)
            }
            onBlur={(value) => handleBlur("preferredQualifications", value)}
            autoNewline={true}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-200 hover:border-slate-300 sm:p-5">
          <div className="mb-3 flex items-start gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-sm font-bold text-amber-700">
              05
            </span>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 sm:text-base">Ideal candidate</h4>
              <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">
                Describe the mindset, qualities, or approach you value.
              </p>
            </div>
          </div>
          <TextareaWithLabel
            label="What We're Looking For"
            placeholder="Describe ideal candidate traits or mindset"
            value={applicationDetails.description.lookingFor}
            onChange={(value) => handleChangeDescription("lookingFor", value)}
            onBlur={(value) => handleBlur("lookingFor", value)}
            autoNewline={true}
          />
        </div>
      </div>
    </div>
  );
};

export default JobDescription;
