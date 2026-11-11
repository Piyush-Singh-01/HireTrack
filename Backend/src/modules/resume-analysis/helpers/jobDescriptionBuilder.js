/**
 * Combines Job fields into a single formatted job description string.
 * 
 * @param {object} job - The job document from the Job model.
 * @returns {string} The formatted job description string.
 */
export const buildJobDescription = (job) => {
  if (!job) {
    return "";
  }

  const sections = [];

  if (job.jobTitle) {
    sections.push(`Job Title: ${job.jobTitle}`);
  }

  if (job.about) {
    sections.push(`About the Role:\n${job.about}`);
  }

  if (job.requirements) {
    sections.push(`Requirements:\n${job.requirements}`);
  }

  if (job.responsibilities) {
    sections.push(`Responsibilities:\n${job.responsibilities}`);
  }

  if (job.preferredQualifications) {
    sections.push(`Preferred Qualifications:\n${job.preferredQualifications}`);
  }

  if (job.lookingFor) {
    sections.push(`Looking For:\n${job.lookingFor}`);
  }

  return sections.join("\n\n").trim();
};
