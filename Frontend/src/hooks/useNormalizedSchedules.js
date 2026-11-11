import { useMemo, useEffect } from "react";
import { useSchedules } from "./useSchedule";

// ================= NORMALIZER =================
export const normalizeScheduleRecord = (rec) => {
  if (!rec) return null;

  // Extract candidate names list if available
  const extractedCandidateNames = rec.candidateNames ?? 
                                  rec.originalData?.candidateNames ??
                                  rec.candidates?.map(c => c.name) ?? 
                                  rec.originalData?.candidates?.map(c => c.name) ??
                                  rec.interviewSchedule?.candidateNames ?? 
                                  rec.originalData?.interviewSchedule?.candidateNames ??
                                  null;

  return {
    _id: rec._id,

    applicationId: rec.applicationId ?? rec.candidateId ?? null,
    scheduleId: rec.scheduleId ?? rec._id ?? rec.interviewSchedule?.scheduleId ?? null,
    jobId: rec.jobId ?? rec.job?.jobId ?? rec.interviewSchedule?.jobId ?? null,
    candidateId: rec.candidateId ?? rec.applicationId,
    
    // Handle multiple date field names
    date: rec.date ?? rec.Date ?? rec.interviewDate ?? rec.interviewSchedule?.interviewDate ?? null,
    time: rec.time ?? rec.Time ?? rec.interviewTime ?? rec.interviewSchedule?.interviewTime ?? null,
    
    // Handle position field variations
    position: rec.Position ?? rec.position ?? rec.job?.jobTitle ?? rec.jobTitle ?? null,
    
    // Handle name field variations  
    name: (extractedCandidateNames && extractedCandidateNames.length > 0)
         ? extractedCandidateNames.join(", ")
         : rec.name ?? 
         rec.Candidate ?? 
         rec.fullName ??
         rec.userName ??
         rec.candidate?.name ??
         rec.applicant?.name ??
         rec.candidateName ??
         rec.applicantName ??
         null,
         
    recruiter: [rec.recruiter, rec.interviewSchedule?.recruiterName, rec.recruiterName, rec.Recruiter, rec.job?.hiringManager?.name].find(v => v && v !== "Unknown") || "Unknown",
    mode: rec.mode ?? rec.interviewSchedule?.meetingMode ?? rec.meetingMode ?? rec.Mode ?? rec.interviewSchedule?.Mode ?? null,

    status: rec.Status ?? rec.status ?? rec.interviewSchedule?.status ?? null,
    reschedule: rec.Reschedule ?? rec.reschedule ?? null,

    candidateEmail: rec.candidateEmail ?? 
                    rec.email ?? 
                    rec.candidate?.email ??
                    rec.applicant?.email ??
                    rec.businessEmail ??
                    rec.Email ??
                    null,
    meetLink: (() => {
      const link = rec.meetLink ?? rec.meetingLink ?? rec.interviewSchedule?.meetingLink;
      if (!link || (typeof link === "string" && link.includes("placeholder"))) {
        return "https://meet.google.com/new";
      }
      return link;
    })(),
    candidateDetailsId: rec.candidateDetailsId ?? rec._id,

    candidateNames: extractedCandidateNames,

    scheduleType: rec.scheduleType ?? rec.interviewSchedule?.scheduleType ?? null,
    allApplications: rec.allApplications ?? rec.originalData?.allApplications ?? [],
  };
};

// ================= HOOK =================
const useNormalizedSchedules = (userId, filters = {}) => {
  const query = useSchedules(userId, filters);

  // Auto-refetch every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      query.refetch();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [query.refetch]);

  // Also refetch when window gains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      query.refetch();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [query.refetch]);

  const normalizedData = useMemo(() => {
    if (!Array.isArray(query.data)) return [];

    const normalized = query.data
      .map(normalizeScheduleRecord)
      .filter(Boolean);

    // Debug: Log normalized schedules
    console.log("DEBUG: Normalized schedules:", {
      totalCount: normalized.length,
      data: normalized.slice(0, 3) // Log first 3 for inspection
    });

    return normalized;
  }, [query.data]);

  return {
    ...query,
    data: normalizedData,
  };
};

export default useNormalizedSchedules;
