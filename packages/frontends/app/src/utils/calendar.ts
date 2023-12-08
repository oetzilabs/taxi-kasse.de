import dayjs from "dayjs";

export const monthWeeks = (date: dayjs.Dayjs) => {
  const weeks = [];
  const firstDay = date.startOf("month").startOf("week");
  const lastDay = date.endOf("month").endOf("week");
  const diff = lastDay.diff(firstDay, "weeks");
  for (let i = 0; i < diff; i++) {
    weeks.push(firstDay.add(i, "week"));
  }
  // add also first week of next month
  weeks.push(firstDay.add(diff, "week"));
  return weeks;
};

export const daysInWeek = (date: dayjs.Dayjs) => {
  const days = [];
  const firstDay = date.startOf("week");
  for (let i = 0; i < 7; i++) {
    days.push(firstDay.add(i, "day"));
  }
  return days;
};

export const getMonthsInYear = (date: dayjs.Dayjs) => {
  const months = [];
  const firstMonth = date.startOf("year");
  for (let i = 0; i < 12; i++) {
    months.push(firstMonth.add(i, "month"));
  }
  return months;
};
