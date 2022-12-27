export function formatToString(date: Date) {
  const formattedDate = `${date.getFullYear()}.${date.getMonth().toString().padStart(2, "0")}.${date
    .getDay()
    .toString()
    .padStart(2, "0")}`;
  return formattedDate;
}
