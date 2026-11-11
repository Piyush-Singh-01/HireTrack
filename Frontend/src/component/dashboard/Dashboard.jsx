import React from "react";
import Toast from "../ui/Toast";
import DashboardHeader from "./DashboardHeader";
import DashboardStats from "./DashboardStats";
import DashboardSchedule from "./DashboardSchedule";
import DashboardAnalytics from "./DashboardAnalytics";
import {
  StartInterviewModal,
  ApplicantDetailsModal,
  RescheduleModal,
  RejectConfirmModal,
} from "./DashboardModals";

/**
 * Presentational Component for the Recruitment Dashboard.
 * Assembles header, stats, schedule, analytics, and modals together cleanly.
 */
const Dashboard = ({
  toast,
  greeting,
  todayLabel,
  options,
  selected,
  onSelectPeriod,
  stats,
  expanded,
  onToggleExpand,
  interviewData,
  isTodayView,
  onStartInterviewClick,
  onDetailsClick,
  analyticsData,
  shortLabelMap,
  monthlyHiredQuery,
  conversionData,
  interviewAnalyticsQuery,
  donutData,
  candidateRates,
  position,
  setPosition,
  activeIndex,
  setActiveIndex,
  showStartConfirm,
  onCloseStartConfirm,
  onConfirmStartInterview,
  showViewDetail,
  selectedApplicant,
  onCloseViewDetail,
  onGoToResume,
  onGoToFeedback,
  onOpenReschedule,
  onOpenReject,
  showReschedule,
  onCloseReschedule,
  selectedDate,
  setSelectedDate,
  hour,
  setHour,
  minute,
  setMinute,
  period,
  setPeriod,
  rescheduleDuration,
  setRescheduleDuration,
  sendNotification,
  setSendNotification,
  onSaveReschedule,
  isRescheduling,
  showRejectModel,
  onCloseReject,
  onConfirmReject,
  isRejecting,
}) => {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8">
        {toast && <Toast message={toast.message} type={toast.type} />}

        {/* 1. Hero Header */}
        <DashboardHeader
          greeting={greeting}
          todayLabel={todayLabel}
          options={options}
          selected={selected}
          onSelectPeriod={onSelectPeriod}
        />

        {/* 2. Stat Cards */}
        <DashboardStats
          stats={stats}
          expanded={expanded}
          onToggleExpand={onToggleExpand}
        />

        {/* 3. Schedule Table & List */}
        <DashboardSchedule
          interviewData={interviewData}
          selected={selected}
          isTodayView={isTodayView}
          onStartInterviewClick={onStartInterviewClick}
          onDetailsClick={onDetailsClick}
        />

        {/* 4. Analytics Visualizations */}
        <DashboardAnalytics
          data={analyticsData}
          shortLabelMap={shortLabelMap}
          monthlyHiredQuery={monthlyHiredQuery}
          conversionData={conversionData}
          interviewAnalyticsQuery={interviewAnalyticsQuery}
          donutData={donutData}
          candidateRates={candidateRates}
          position={position}
          setPosition={setPosition}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />

        {/* 5. Modals */}
        <StartInterviewModal
          isOpen={showStartConfirm}
          onClose={onCloseStartConfirm}
          onConfirm={onConfirmStartInterview}
        />

        <ApplicantDetailsModal
          isOpen={showViewDetail}
          applicant={selectedApplicant}
          onClose={onCloseViewDetail}
          onGoToResume={onGoToResume}
          onGoToFeedback={onGoToFeedback}
          onOpenReschedule={onOpenReschedule}
          onOpenReject={onOpenReject}
        />

        <RescheduleModal
          isOpen={showReschedule}
          applicant={selectedApplicant}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          hour={hour}
          setHour={setHour}
          minute={minute}
          setMinute={setMinute}
          period={period}
          setPeriod={setPeriod}
          rescheduleDuration={rescheduleDuration}
          setRescheduleDuration={setRescheduleDuration}
          sendNotification={sendNotification}
          setSendNotification={setSendNotification}
          onClose={onCloseReschedule}
          onSave={onSaveReschedule}
          isSaving={isRescheduling}
        />

        <RejectConfirmModal
          isOpen={showRejectModel}
          applicant={selectedApplicant}
          onClose={onCloseReject}
          onConfirm={onConfirmReject}
          isRejecting={isRejecting}
        />
      </div>
    </div>
  );
};

export default Dashboard;