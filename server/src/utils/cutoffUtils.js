'use strict';

const { toZonedTime, fromZonedTime } = require('date-fns-tz');
const { addDays, isWeekend, isSameDay, format } = require('date-fns');

const TIMEZONE = 'Europe/London';
const CUTOFF_HOUR = 15;

const UK_BANK_HOLIDAYS = [
  '2026-01-01', '2026-04-03', '2026-04-06', '2026-05-04',
  '2026-05-25', '2026-08-31', '2026-12-25', '2026-12-28',
  '2027-01-01', '2027-03-26', '2027-03-29', '2027-05-03',
  '2027-05-31', '2027-08-30', '2027-12-27', '2027-12-28',
];

function isBankHoliday(date) {
  const dateStr = format(date, 'yyyy-MM-dd');
  return UK_BANK_HOLIDAYS.includes(dateStr);
}

function isWorkingDay(date) {
  return !isWeekend(date) && !isBankHoliday(date);
}

function getNextWorkingDay(fromDate) {
  let date = addDays(fromDate, 1);
  while (!isWorkingDay(date)) {
    date = addDays(date, 1);
  }
  return date;
}

function isPastCutoff() {
  const now = new Date();
  const ukNow = toZonedTime(now, TIMEZONE);
  return ukNow.getHours() >= CUTOFF_HOUR;
}

function getDeliveryDate(submittedAt) {
  const ukDate = toZonedTime(submittedAt || new Date(), TIMEZONE);
  const isPast = ukDate.getHours() >= CUTOFF_HOUR;
  const baseDate = isPast ? addDays(ukDate, 1) : ukDate;
  return getNextWorkingDay(baseDate);
}

function getCutoffToday() {
  const now = new Date();
  const ukNow = toZonedTime(now, TIMEZONE);
  const cutoff = new Date(ukNow);
  cutoff.setHours(CUTOFF_HOUR, 0, 0, 0);
  return fromZonedTime(cutoff, TIMEZONE);
}

module.exports = { isPastCutoff, getDeliveryDate, getCutoffToday, isWorkingDay };
