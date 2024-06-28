import dayjs from "dayjs";

export const formatDateTime = (date: string | Date | null | undefined): string | null => {
  if (!date) {
    return null;
  }

  return dayjs(date).format("YYYY-MM-DD HH:mm:ss.SSS");
}