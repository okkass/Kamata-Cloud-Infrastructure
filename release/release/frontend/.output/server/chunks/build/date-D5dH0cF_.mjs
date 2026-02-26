const formatDateTime = (dateString) => {
  if (!dateString) {
    return "—";
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.error("Invalid date string provided:", dateString);
    return "—";
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

export { formatDateTime as f };
//# sourceMappingURL=date-D5dH0cF_.mjs.map
