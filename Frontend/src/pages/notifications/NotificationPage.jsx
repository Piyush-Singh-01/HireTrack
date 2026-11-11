import React, { useState, useEffect, useMemo } from "react";
import Notification from "../../component/notification/Notification";
import { useNotifications } from "../../hooks/useNotifications";
import { mapNotification } from "../../component/notification/notificationUtils";

/**
 * NotificationPage Controller
 * Manages the Notifications Hub (/notify).
 * Coordinates notifications querying, filtering tabs, unread toggles, search queries,
 * mutations (mark read, star, delete), and document title.
 */
const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const {
    notificationsQuery,
    allNotifications: allRaw,
    reminders: remindersRaw,
    applicantsNotify: applicantsRaw,
    favourites: favouritesRaw,
    markAsReadMutation,
    markAllAsReadMutation,
    toggleFavouriteMutation,
    deleteReminderMutation,
    deleteApplicantMutation,
    refetch,
  } = useNotifications();

  useEffect(() => {
    document.title = "Notification Hub | Talent OS";
  }, []);

  // Standardized domain items
  const allNotifications = useMemo(
    () => (allRaw || []).map((n) => mapNotification(n, "All")),
    [allRaw]
  );
  const reminders = useMemo(
    () => (remindersRaw || []).map((r) => mapNotification(r, "Reminder")),
    [remindersRaw]
  );
  const applicants = useMemo(
    () => (applicantsRaw || []).map((a) => mapNotification(a, "Applicant")),
    [applicantsRaw]
  );
  const favourites = useMemo(
    () => (favouritesRaw || []).map((f) => mapNotification(f, "Favourite")),
    [favouritesRaw]
  );

  const handleToggleFavourite = (item) => {
    toggleFavouriteMutation.mutate(item.id);
  };

  const handleMarkSeen = (item) => {
    if (!item.isSeen) {
      markAsReadMutation.mutate(item.id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (item) => {
    if (item.type === "Reminder" || item.rawType === "reminder") {
      deleteReminderMutation.mutate(item.id);
    } else {
      deleteApplicantMutation.mutate(item.id);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Notification
      allNotifications={allNotifications}
      reminders={reminders}
      applicants={applicants}
      favourites={favourites}
      isLoading={notificationsQuery?.isLoading}
      isRefreshing={notificationsQuery?.isFetching}
      isMarkingAllAsRead={markAllAsReadMutation?.isPending}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      filterUnreadOnly={filterUnreadOnly}
      onToggleUnreadFilter={setFilterUnreadOnly}
      onMarkSeen={handleMarkSeen}
      onMarkAllAsRead={handleMarkAllAsRead}
      onToggleFavourite={handleToggleFavourite}
      onDelete={handleDelete}
      onRefresh={handleRefresh}
    />
  );
};

export default NotificationPage;
