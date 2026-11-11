import { Bell, Clock, UserCheck, Star } from "lucide-react";

/**
 * Format timestamp into human-readable relative or formatted date
 */
export const formatTime = (data) => {
  const date = data ? new Date(data) : new Date();
  if (isNaN(date.getTime())) return "Just now";

  const now = new Date();
  const diffTime = now - date;
  const diffMin = Math.floor(diffTime / 1000 / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  }
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleString([], {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Resolve display styles, icon, and colors by notification category
 */
export const getCategoryMeta = (item) => {
  const isReminder =
    item.type === "Reminder" || item.rawType === "reminder";
  const isApplicant =
    item.type === "Applicant" || item.rawType === "applicant";

  if (isReminder) {
    return {
      label: "Reminder",
      Icon: Clock,
      bg: "bg-amber-500/10 border-amber-200/80 text-amber-600",
      pill: "bg-amber-50 text-amber-700 border border-amber-200/60",
      color: "text-amber-600",
    };
  }

  if (isApplicant) {
    return {
      label: "Applicant",
      Icon: UserCheck,
      bg: "bg-sky-500/10 border-sky-200/80 text-sky-600",
      pill: "bg-sky-50 text-sky-700 border border-sky-200/60",
      color: "text-sky-600",
    };
  }

  if (item.isFavourite) {
    return {
      label: "Favourite",
      Icon: Star,
      bg: "bg-amber-500/10 border-amber-200/80 text-amber-500",
      pill: "bg-amber-50 text-amber-700 border border-amber-200/60",
      color: "text-amber-500",
    };
  }

  return {
    label: "Notification",
    Icon: Bell,
    bg: "bg-indigo-500/10 border-indigo-200/80 text-indigo-600",
    pill: "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
    color: "text-indigo-600",
  };
};

/**
 * Standardize notification payload for UI display
 */
export const mapNotification = (f, typeLabel) => {
  const rawTime = f.dateTime || f.updatedAt || f.createdAt;
  return {
    id: f._id,
    isFavourite: f.isFavourite ?? false,
    isSeen: f.isSeen ?? false,
    message: f.message || "Notification alert",
    rawTime,
    time: formatTime(rawTime),
    type: typeLabel,
    rawType: f.type,
  };
};
