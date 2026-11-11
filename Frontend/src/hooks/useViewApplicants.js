import { useState, useCallback, useEffect, useMemo } from "react";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";
import { scheduleQueryKeys } from "./useSchedule";
import { useToast } from "../utils/ToastContext";

export function useViewApplicants() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const location = useLocation();
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const { status, jobId: stateJobId } = location.state || {};
  const persistedJobId =
    typeof window !== "undefined" ? sessionStorage.getItem("jobId") : null;

  const jobId = stateJobId || persistedJobId;

  // Persist jobId so refresh/direct visit works
  useEffect(() => {
    if (typeof window !== "undefined" && stateJobId) {
      sessionStorage.setItem("jobId", stateJobId);
    }
  }, [stateJobId]);

  const [tabs, setTabs] = useState({ main: "Applied", secondary: "All" });

  const [dialogs, setDialogs] = useState({
    schedule: false,
    reschedule: false,
    close: false,
    scheduleGD: false,
  });

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);

  const [extendDate, setExtendDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime] = useState("01:00");
  const [mode, setMode] = useState("Online");

  const [selectedRows, setSelectedRows] = useState(new Set());

  const getFilteredByRating = useCallback(
    (list = []) => {
      if (!activeFilter) return list;
      return list.filter((x) => x.ratings === activeFilter);
    },
    [activeFilter],
  );

  const dltCandidate = useCallback((item) => {
    setSelectedCandidates((prev) => prev.filter((c) => c !== item));
  }, []);

  const handleDetails = useCallback(() => {
    navigate("/viewDetails", { state: { status, jobId } });
  }, [navigate, status, jobId]);

  const handleCheckboxChange = useCallback((rowId) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(rowId) ? next.delete(rowId) : next.add(rowId);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((rows) => {
    if (!rows?.length) {
      setSelectedRows(new Set());
      return;
    }
    setSelectedRows((prev) =>
      prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id)),
    );
  }, []);

  /* ---------------- NORMALIZER  FOR UI ---------------- */

  const normalizeCandidate = (c, key) => {
    const base = {
      id: c?.applicationId, // UI already depends on this
      applicationId: c?.applicationId, // added safely (no break)
      candidateId: c?.candidateId ?? null,

      name: c?.name || c?.fullName || c?.candidateName || "Unknown",
      appliedOn: c?.appliedDate || c?.appliedOn || c?.createdAt || null,
      contactNumber: c?.contactNumber ?? null,
      lastUpdated: c.lastUpdated,

      ratings: c?.ratings || c?.rating || c?.candidateRating || null,
      feedbackDescription: c?.candidateFeedback?.feedbackDescription || c?.candidate?.candidateFeedback?.feedbackDescription || null,

      profile: c?.profileView ? "Viewed" : "View",

      candidate: c, // keep full backend object
      profileStatus: c?.profileStatus || null,
      status: c?.status || null,
    };

    if (key === "interview" || key === "rescheduled") {
      const scheduleFromMap = scheduleMap.get(c.applicationId);
      const schedule = c?.interviewSchedule || c?.rescheduledInfo || null;

      return {
        ...base,
        task: "Interview",
        ...(scheduleFromMap?.Candidate && {
          name: scheduleFromMap.Candidate,
        }),

        candidateDetailsId: scheduleFromMap?._id || null,
        scheduleType: schedule?.scheduleType || null,
        interview:
          schedule?.status === "Scheduled" || schedule?.status === "Rescheduled"
            ? "Reschedule"
            : "Schedule",
        scheduleId: schedule?.scheduleId || null,
        interviewDate: schedule?.interviewDate || null,
        interviewTime: schedule?.interviewTime || null,
        recruiterName: schedule?.recruiterName,
        meetingMode: schedule?.meetingMode || null,
        interviewStatus: schedule?.status || null,
        meetingLink: schedule?.meetingLink || "https://meet.google.com/new",
      };
    }

    if (key === "onhold" || key === "hired" || key === "rejected") {
      const scheduleFromMap = scheduleMap.get(c.candidateId || c.applicationId);
      const schedule = c?.interviewSchedule || c?.rescheduledInfo || null;
      return {
        ...base,
        scheduleId: schedule?.scheduleId || null,
        ...(scheduleFromMap?.Candidate && {
          name: scheduleFromMap.Candidate,
        }),
        candidateDetailsId: scheduleFromMap?._id || null,
        interviewDate: c?.interviewSchedule?.interviewDate || null,
        interviewTime: c?.interviewSchedule?.interviewTime || null,
      };
    }

    return base;
  };

  const allCandidatesQuery = useQuery({
    queryKey: ["candidates", jobId, "all"],
    enabled: Boolean(jobId),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/positions/${jobId}/all`);
      const json = res?.data;
      const candidates = Array.isArray(json?.data?.candidates)
        ? json.data.candidates
        : [];
      return {
        list: candidates,
        page: json?.data?.pagination || null,
      };
    },
  });

  /*=====================get all schedule====================*/
  const allSchedulesApiCall = useQueries({
    queries: [
      {
        queryKey: ["all-schedules", userId],
        enabled: !!userId, // 🔴 important
        queryFn: async () => {
          const res = await axiosInstance.get(ApiRoutes.SCHEDULE.GET(userId));

          return Array.isArray(res.data?.data) ? res.data.data : [];
        },
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  //Extract schedules safely
  const allSchedules = allSchedulesApiCall[0]?.data || [];
  //Filter schedules by jobId
  const schedulesByJob = useMemo(() => {
    return allSchedules.filter((s) => s.jobId === jobId);
  }, [allSchedules, jobId]);

  //Build a lookup map(for fast access)
  const scheduleMap = useMemo(() => {
    const map = new Map();

    schedulesByJob.forEach((s) => {
      // s.candidateId === applicationId
      map.set(s.candidateId, s);
    });

    return map;
  }, [schedulesByJob]);

  const qDataAndPg = useMemo(() => {
    const empty = {
      applied: [],
      shortlisted: [],
      interview: [],
      onhold: [],
      rejected: [],
      hired: [],
      rescheduled: [],
    };

    const nextData = { ...empty };
    const nextPg = { ...empty };

    const rawList = allCandidatesQuery.data?.list || [];
    const pageData = allCandidatesQuery.data?.page || null;

    rawList.forEach((c) => {
      const status = c.profileStatus?.toLowerCase();
      const isRescheduled = c.interviewSchedule?.rescheduled === true;

      if (status === "applied") {
        nextData.applied.push(normalizeCandidate(c, "applied"));
      } else if (status === "shortlisted") {
        nextData.shortlisted.push(normalizeCandidate(c, "shortlisted"));
      } else if (status === "interview") {
        if (isRescheduled) {
          nextData.rescheduled.push(normalizeCandidate(c, "rescheduled"));
        } else {
          nextData.interview.push(normalizeCandidate(c, "interview"));
        }
      } else if (status === "onhold") {
        nextData.onhold.push(normalizeCandidate(c, "onhold"));
      } else if (status === "hired") {
        nextData.hired.push(normalizeCandidate(c, "hired"));
      } else if (status === "rejected") {
        nextData.rejected.push(normalizeCandidate(c, "rejected"));
      }
    });

    // Provide the global pagination for all tabs
    if (pageData) {
      Object.keys(nextPg).forEach((key) => {
        nextPg[key] = pageData;
      });
    }

    return { data: nextData, pagination: nextPg };
  }, [allCandidatesQuery.data, scheduleMap]);

  const qLoading = useMemo(() => {
    const isLoading = Boolean(allCandidatesQuery.isLoading || allCandidatesQuery.isFetching);
    return {
      applied: isLoading,
      shortlisted: isLoading,
      interview: isLoading,
      onhold: isLoading,
      rejected: isLoading,
      hired: isLoading,
      rescheduled: isLoading,
      all: isLoading,
    };
  }, [allCandidatesQuery.isLoading, allCandidatesQuery.isFetching]);

  const qError = useMemo(() => {
    const error = allCandidatesQuery.error || null;
    return {
      applied: error,
      shortlisted: error,
      interview: error,
      onhold: error,
      rejected: error,
      hired: error,
      rescheduled: error,
      all: error,
    };
  }, [allCandidatesQuery.error]);

  const queryClient = useQueryClient();

  useEffect(() => {
    let channel;

    const refreshCandidates = (payload) => {
      if (!payload) return;
      if (payload.type !== "candidate-submitted") return;
      if (payload.jobId !== jobId) return;
      queryClient.invalidateQueries(["candidates", jobId]);
    };

    let channelHandler;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("view-applicants");
      channelHandler = (event) => {
        refreshCandidates(event.data);
      };
      channel.addEventListener("message", channelHandler);
    }

    const storageHandler = (event) => {
      if (!event.key || event.key !== "view-applicants") return;
      try {
        const payload = JSON.parse(event.newValue);
        refreshCandidates(payload);
      } catch {
        // ignore invalid payload
      }
    };

    window.addEventListener("storage", storageHandler);

    return () => {
      if (channel && channelHandler) {
        channel.removeEventListener("message", channelHandler);
        channel.close();
      }
      window.removeEventListener("storage", storageHandler);
    };
  }, [jobId, queryClient]);

  //Reject Candidate
  const rejectCandidate = useMutation({
    mutationKey: ["candidate-reject", jobId],
    mutationFn: async ({ candidateId, feedbackDescription, jobId: overrideJobId }) => {
      const activeJobId = overrideJobId || jobId;
      if (!activeJobId) throw new Error("Missing jobId");
      if (!candidateId) throw new Error("Missing candidateId");

      if (feedbackDescription) {
        // Use feedback endpoint to set specific feedback (Direct Reject)
        const res = await axiosInstance.post(ApiRoutes.POSITION.FEEDBACK(activeJobId), {
          applicationId: candidateId,
          candidateFeedback: {
            communication: "Inadequate",
            technical: "Inadequate",
            programming: "Inadequate",
            problemSolving: "Inadequate",
            feedbackDescription
          },
          candidateRating: "Not a fit",
          updateStatus: true,
          newStatus: "rejected",
        });
        return res?.data;
      } else {
        // Standard reject
        const res = await axiosInstance.post(ApiRoutes.POSITION.REJECT(activeJobId), {
          applicationId: candidateId,
          action: "reject",
        });
        return res?.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["candidates", jobId]);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["candidates", jobId]);
    },
  });

  const scheduleInterview = useMutation({
    mutationKey: ["schedule-interview"],
    mutationFn: async ({
      jobId,
      candidateId,
      interviewDate,
      interviewTime,
      recruiterName,
      meetingMode,
      durationMinutes,
      sendNotification,
    }) => {
      if (!jobId) throw new Error("Missing jobId");
      if (!candidateId) throw new Error("Missing candidateId");

      const res = await axiosInstance.post(ApiRoutes.SCHEDULE.POST(jobId), {
        candidateId,
        interviewDate,
        interviewTime,
        recruiterName,
        meetingMode,
        durationMinutes,
        sendNotification,
      });
      return res?.data;
    },
    onSuccess: () => {
      // Refresh interview list
      if (jobId) {
        queryClient.invalidateQueries(["candidates", jobId]);
      }

      // Refresh schedules page with correct query keys
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });
      queryClient.refetchQueries({ queryKey: scheduleQueryKeys.all });
      queryClient.refetchQueries({ queryKey: scheduleQueryKeys.lists() });
    },
  });

  //Reschedule Interview
  const rescheduleInterview = useMutation({
    mutationKey: ["reschedule-interview"],
    mutationFn: async ({
      candidateId,
      candidateDetailsId,
      applicant,
      scheduleId,
      newDate,
      newTime,
      jobId,
      durationMinutes,
      sendNotification,
    }) => {
      if (!jobId) throw new Error("Missing jobId");
      if (!candidateId) throw new Error("Missing candidateId");

      const res = await axiosInstance.put(
        ApiRoutes.POSITION.RESCHEDULE(jobId),
        {
          candidateDetailsId,
          scheduleId,
          candidateId,
          applicant,
          newDate,
          newTime,
          sendNotification,
          durationMinutes,
        },
      );

      return res?.data;
    },
    onSuccess: () => {
      // Refresh interview list
      if (jobId) {
        queryClient.invalidateQueries(["candidates", jobId]);
      }

      // Refresh schedules page with correct query keys
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });
      queryClient.refetchQueries({ queryKey: scheduleQueryKeys.all });
      queryClient.refetchQueries({ queryKey: scheduleQueryKeys.lists() });
    },
  });

  //Extend date
  const extendJobDate = useMutation({
    mutationKey: ["extend-job"],
    mutationFn: async ({ jobId, closingDate }) => {
      if (!jobId) throw new Error("Missing jobId");

      const res = await axiosInstance.put(ApiRoutes.POSITION.UPDATEJOB(jobId), {
        closingDate,
      });
      return res?.data;
    },
    onSuccess: (_data, variables) => {
      const { jobId } = variables;

      // Refresh candidates page
      if (jobId) {
        queryClient.invalidateQueries(["candidates", jobId]);
      }

      // Refresh schedules page with correct query keys
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });

      // Refresh positions page
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });

  const startInterview = useMutation({
    mutationKey: ["start-interview"],
    mutationFn: async ({ applicantId, interviewer, applicant }) => {
      if (!applicantId) throw new Error("Missing applicantId");

      const res = await axiosInstance.post(ApiRoutes.POSITION.STARTINTERVIEW, {
        applicantId,
        interviewRound: "Initial Screening",
        interviewer,
      });

      return {
        ...res.data,
        _passedApplicant: applicant // Pass through for onSuccess
      };
    },

    onSuccess: (data) => {
      // Refresh dashboard schedules
      queryClient.invalidateQueries(["todayInterviewSchedule"]);
      queryClient.invalidateQueries(["dashboard-summary"]);

      const passedApplicant = data?._passedApplicant;
      const rawLink = 
        data?.data?.meetingLink || 
        passedApplicant?.meetingLink || 
        passedApplicant?.meetLink || 
        selectedApplicant?.meetingLink || 
        selectedApplicant?.meetLink;

      const isValidLink = (url) => {
        if (!url || typeof url !== "string") return false;
        if (url.includes("placeholder")) return false;
        return url.startsWith("http://") || url.startsWith("https://");
      };

      const meetingLink = isValidLink(rawLink)
        ? rawLink
        : "https://meet.google.com/new";

      window.open(meetingLink, "_blank");
    },
  });

  const scheduleGD = useMutation({
    mutationKey: ["schedule-gd"],
    mutationFn: async ({
      candidateIds,
      recruiterName,
      interviewDate,
      interviewTime,
      durationMinutes,
      meetingMode,
    }) => {
      // ✅ AUTO GET FROM localStorage IF NOT PASSED
      if (!recruiterName) {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          recruiterName =
            user?.username || user?.userName || user?.fullName || "HR";
        } catch {
          recruiterName = "HR";
        }
      }

      const res = await axiosInstance.post(
        ApiRoutes.POSITION.SCHEDULEGD(jobId),
        {
          candidateIds,
          recruiterName, // ✅ guaranteed now
          interviewDate,
          interviewTime,
          durationMinutes,
          meetingMode,
          sendNotification: true,
        },
      );

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["candidates", jobId]);
    },
  });

  //close date
  const closeJob = useMutation({
    mutationKey: ["close-job"],
    mutationFn: async ({ jobId }) => {
      if (!jobId) throw new Error("Missing jobId");

      const res = await axiosInstance.put(ApiRoutes.POSITION.UPDATEJOB(jobId), {
        jobStatus: "Closed",
        closingDate: new Date().toISOString().slice(0, 10),
      });
      return res?.data;
    },
    onSuccess: (_data, variables) => {
      const { jobId } = variables;

      // Refresh candidates page
      if (jobId) {
        queryClient.invalidateQueries(["candidates", jobId]);
      }

      // Refresh schedules page with correct query keys
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });

      // Refresh positions page
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });

  return {
    status,
    jobId,
    navigate,

    tabs,
    setTabs,

    dialogs,
    setDialogs,

    selectedApplicant,
    setSelectedApplicant,
    selectedCandidates,
    setSelectedCandidates,

    activeFilter,
    setActiveFilter,

    extendDate,
    setExtendDate,
    selectedDate,
    setSelectedDate,
    time,
    setTime,
    mode,
    setMode,

    selectedRows,
    setSelectedRows,

    data: qDataAndPg.data,
    pagination: qDataAndPg.pagination,
    loading: qLoading,
    error: qError,

    getFilteredByRating,
    dltCandidate,
    handleDetails,
    handleCheckboxChange,
    handleSelectAll,

    rejectCandidate,
    scheduleInterview,
    rescheduleInterview,
    extendJobDate,
    closeJob,
    startInterview,
    scheduleGD,
  };
}
