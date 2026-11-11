import React, { useState, useMemo } from "react";
import { Layers, Clock, UserCheck, Star } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { mapNotification } from "./notificationUtils";
import NotificationHero from "./NotificationHero";
import NotificationToolbar from "./NotificationToolbar";
import NotificationItem from "./NotificationItem";
import NotificationSkeleton from "./NotificationSkeleton";
import NotificationEmptyState from "./NotificationEmptyState";

const Notification = ({
  allNotifications: propAll,
  reminders: propReminders,
  applicants: propApplicants,
  favourites: propFavourites,
  isLoading: propIsLoading,
  isRefreshing: propIsRefreshing,
  isMarkingAllAsRead: propIsMarkingAllAsRead,
  activeTab: propActiveTab,
  onSelectTab: propOnSelectTab,
  searchQuery: propSearchQuery,
  onSearchChange: propOnSearchChange,
  filterUnreadOnly: propFilterUnreadOnly,
  onToggleUnreadFilter: propOnToggleUnreadFilter,
  onMarkSeen: propOnMarkSeen,
  onMarkAllAsRead: propOnMarkAllAsRead,
  onToggleFavourite: propOnToggleFavourite,
  onDelete: propOnDelete,
  onRefresh: propOnRefresh,
}) => {
  // Local state for standalone usage fallback
  const [internalActiveTab, setInternalActiveTab] = useState("All");
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalFilterUnread, setInternalFilterUnread] = useState(false);

  // Hook fallback
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

  // Active state resolution
  const activeTab = propActiveTab !== undefined ? propActiveTab : internalActiveTab;
  const setActiveTab = propOnSelectTab || setInternalActiveTab;

  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : internalSearchQuery;
  const setSearchQuery = propOnSearchChange || setInternalSearchQuery;

  const filterUnreadOnly =
    propFilterUnreadOnly !== undefined ? propFilterUnreadOnly : internalFilterUnread;
  const setFilterUnreadOnly = propOnToggleUnreadFilter || setInternalFilterUnread;

  // Data resolution
  const allNotifications = useMemo(() => {
    if (propAll) return propAll;
    return (allRaw || []).map((n) => mapNotification(n, "All"));
  }, [propAll, allRaw]);

  const reminders = useMemo(() => {
    if (propReminders) return propReminders;
    return (remindersRaw || []).map((r) => mapNotification(r, "Reminder"));
  }, [propReminders, remindersRaw]);

  const applicants = useMemo(() => {
    if (propApplicants) return propApplicants;
    return (applicantsRaw || []).map((a) => mapNotification(a, "Applicant"));
  }, [propApplicants, applicantsRaw]);

  const favourites = useMemo(() => {
    if (propFavourites) return propFavourites;
    return (favouritesRaw || []).map((f) => mapNotification(f, "Favourite"));
  }, [propFavourites, favouritesRaw]);

  const isLoading =
    propIsLoading !== undefined ? propIsLoading : notificationsQuery?.isLoading || false;
  const isRefreshing =
    propIsRefreshing !== undefined ? propIsRefreshing : notificationsQuery?.isFetching || false;
  const isMarkingAllAsRead =
    propIsMarkingAllAsRead !== undefined
      ? propIsMarkingAllAsRead
      : markAllAsReadMutation?.isPending || false;

  const unreadCount = useMemo(
    () => allNotifications.filter((n) => !n.isSeen).length,
    [allNotifications]
  );

  // Action fallbacks
  const handleToggleFavouriteFallback = (item) => {
    toggleFavouriteMutation.mutate(item.id);
  };

  const handleMarkSeenFallback = (item) => {
    if (!item.isSeen) {
      markAsReadMutation.mutate(item.id);
    }
  };

  const handleMarkAllAsReadFallback = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteFallback = (item) => {
    if (item.type === "Reminder" || item.rawType === "reminder") {
      deleteReminderMutation.mutate(item.id);
    } else {
      deleteApplicantMutation.mutate(item.id);
    }
  };

  const handleRefreshFallback = () => {
    refetch();
  };

  const handleToggleFavourite = propOnToggleFavourite || handleToggleFavouriteFallback;
  const handleMarkSeen = propOnMarkSeen || handleMarkSeenFallback;
  const handleMarkAllAsRead = propOnMarkAllAsRead || handleMarkAllAsReadFallback;
  const handleDelete = propOnDelete || handleDeleteFallback;
  const handleRefresh = propOnRefresh || handleRefreshFallback;

  // Segmented Tabs Definition
  const tabs = [
    {
      label: "All",
      icon: Layers,
      data: allNotifications,
      count: allNotifications.length,
    },
    {
      label: "Reminder",
      icon: Clock,
      data: reminders,
      count: reminders.length,
    },
    {
      label: "Applicants",
      icon: UserCheck,
      data: applicants,
      count: applicants.length,
    },
    {
      label: "Favourite",
      icon: Star,
      data: favourites,
      count: favourites.length,
    },
  ];

  const currentTabObj =
    tabs.find((t) => t.label === (activeTab === "Applicants" ? "Applicants" : activeTab)) ||
    tabs[0];

  const filteredData = useMemo(() => {
    let list = currentTabObj.data;

    if (filterUnreadOnly) {
      list = list.filter((item) => !item.isSeen);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.message.toLowerCase().includes(q) ||
          item.time.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q)
      );
    }

    return list;
  }, [currentTabObj.data, filterUnreadOnly, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen bg-slate-50/40 font-['Plus_Jakarta_Sans']">
      {/* Hero Banner Hub */}
      <NotificationHero
        unreadCount={unreadCount}
        totalCount={allNotifications.length}
        remindersCount={reminders.length}
        favouritesCount={favourites.length}
        activeTab={activeTab}
        filterUnreadOnly={filterUnreadOnly}
        isMarkingAllAsRead={isMarkingAllAsRead}
        isRefreshing={isRefreshing}
        onMarkAllAsRead={handleMarkAllAsRead}
        onRefresh={handleRefresh}
        onSelectTab={setActiveTab}
        onToggleUnreadFilter={setFilterUnreadOnly}
      />

      {/* Toolbar */}
      <NotificationToolbar
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        filterUnreadOnly={filterUnreadOnly}
        onToggleUnreadFilter={setFilterUnreadOnly}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery("")}
      />

      {/* Notifications Feed */}
      {isLoading ? (
        <NotificationSkeleton />
      ) : filteredData.length > 0 ? (
        <div className="space-y-3">
          {filteredData.map((item) => (
            <NotificationItem
              key={item.id}
              item={item}
              onToggleFavourite={handleToggleFavourite}
              onDelete={handleDelete}
              onMarkSeen={handleMarkSeen}
            />
          ))}
        </div>
      ) : (
        <NotificationEmptyState
          filterUnreadOnly={filterUnreadOnly}
          searchQuery={searchQuery}
          activeTab={activeTab}
          onClearUnreadFilter={() => setFilterUnreadOnly(false)}
          onClearSearch={() => setSearchQuery("")}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default Notification;
