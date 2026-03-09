/**
 * Returns a display-friendly name from a user object.
 * Handles both { name } and { firstName, lastName } shapes.
 */
export const getDisplayName = (user) => {
  if (!user) return "";
  return (
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  );
};

/**
 * Formats a date value to a readable string like "Jun 15, 2025".
 * Returns "—" for invalid/null dates.
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
