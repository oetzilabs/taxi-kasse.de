import dayjs from "dayjs";

export * as CalendarUtils from "./calendar";

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

export const getDaysInMonth = (date: dayjs.Dayjs) => {
  const days = [];
  const firstDay = date.startOf("month");
  const lastDay = date.endOf("month");
  const diff = lastDay.diff(firstDay, "days");
  for (let i = 0; i < diff; i++) {
    days.push(firstDay.add(i, "day"));
  }
  days.push(lastDay);
  return days;
};

export const getFillDaysForFirstWeek = (date: dayjs.Dayjs) => {
  const days = [];
  const firstDay = date.startOf("month").startOf("week");
  const lastDay = date.startOf("month");
  const diff = lastDay.diff(firstDay, "days");
  for (let i = 0; i < diff; i++) {
    days.push(firstDay.add(i, "day"));
  }
  return days;
};

export const getFillDaysForLastWeek = (date: dayjs.Dayjs) => {
  // this fills the last week of the month with days from the next month
  const days: Array<dayjs.Dayjs> = [];
  const firstDay = date.endOf("month");
  const lastDay = date.endOf("month").endOf("week");
  // days.push(firstDay);
  // check the day number of the last day of the month (0-6)
  const dayNumber = firstDay.day();
  // if the last day of the month is a saturday, we don't need to fill the week
  if (dayNumber === 6) {
    return days;
  }
  const diff = 6 - dayNumber;
  for (let i = 0; i < diff; i++) {
    days.push(firstDay.add(i + 1, "day"));
  }

  return days;
};

export const getMonthFromRange = (range: { from: dayjs.Dayjs; to: dayjs.Dayjs }) => {
  const monthDays: Record<number, number> = {};
  const amountOfDays = range.to.diff(range.from, "days");
  for (let i = 0; i <= amountOfDays; i++) {
    const day = range.from.add(i, "day");
    const month = day.month();
    if (!monthDays[month]) {
      monthDays[month] = 0;
    }
    monthDays[month] += 1;
  }
  let biggestMonth;
  for (const month in monthDays) {
    if (!biggestMonth) {
      biggestMonth = Number(month);
    }
    if (monthDays[month] > monthDays[biggestMonth]) {
      biggestMonth = Number(month);
    }
  }
  return range.from.startOf("month").set("month", biggestMonth!);
};

export const createRangeFromMonth = (date: dayjs.Dayjs) => {
  const fillerDaysFirstWeek = getFillDaysForFirstWeek(date.startOf("month"));
  const fillterDaysLastWeek = getFillDaysForLastWeek(date.endOf("month"));
  const daysInMonth = getDaysInMonth(date.startOf("month"));
  const days = [...fillerDaysFirstWeek, ...daysInMonth, ...fillterDaysLastWeek];
  const range = {
    from: days[0].toDate(),
    to: days[days.length - 1].toDate(),
  };
  return { range, days };
};

export const createCalendarMonth = ({ from, to }: { from: dayjs.Dayjs; to: dayjs.Dayjs }) => {
  // date here is the first day of the last months, last week.
  const days = [];
  const diff = to.diff(from, "days");
  for (let i = 0; i < diff; i++) {
    days.push(from.add(i, "day"));
  }
  days.push(to);
  return days;
};
