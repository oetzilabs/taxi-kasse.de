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
  let kv = Object.entries(monthDays);
  for (const [month, days] of kv) {
    const m = Number(month);
    if (biggestMonth === undefined) {
      biggestMonth = m;
    }
    if (days > monthDays[biggestMonth]) {
      biggestMonth = m;
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

export const createCalendarMonth = ({ month, year }: { month: number; year: number }) => {
  const date = dayjs().set("month", month).set("year", year);
  const days = [];
  const startDay = date.startOf("month").startOf("week");
  const endDay = date.endOf("month").endOf("week");
  const diff = endDay.diff(startDay, "days");
  for (let i = 0; i < diff; i++) {
    days.push(startDay.add(i, "day"));
  }
  days.push(endDay);
  return days;
};

export const createCalendarWeek = ({ week, year }: { week: number; year: number }) => {
  const date = dayjs().set("year", year).startOf("year").add(week, "week");
  const days = [];
  const startDay = date.startOf("week");
  for (let i = 0; i < 7; i++) {
    days.push(startDay.add(i, "day"));
  }
  return days;
};

export const createCalendarYear = ({ year }: { year: number }) => {
  const date = dayjs().set("year", year);
  const months = [];
  const startMonth = date.startOf("year");
  for (let i = 0; i < 12; i++) {
    months.push(startMonth.add(i, "month"));
  }
  return months;
};
