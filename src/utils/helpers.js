export const getDisplayName = (user) => {
  if (!user) return "";
  return (
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  );
};

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
