import dayjs from 'dayjs';
import { FILTER_TYPES } from './const';

function getRandomArrayElement(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDuration(startDate, endDate) {
  if (!startDate || !endDate) {
    return '';
  }

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const days = end.diff(start, 'day');
  const hours = end.diff(start, 'hour') % 24;
  const minutes = end.diff(start, 'minute') % 60;

  if (days > 0) {
    return `${days.toString().padStart(2, '0')}D ${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;
  }
  if (hours > 0) {
    return minutes === 0
      ? `${hours.toString().padStart(2, '0')}H 00M`
      : `${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;
  }
  return `${minutes}M`;
}

function convertDate(startDate, endDate) {
  if (!startDate || !endDate) {
    return '';
  }

  const duration = formatDuration(startDate, endDate);
  return `${duration}`;
}
function formatDate(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function CamelCaseToKebabCase(string) {
  return string.replace(/([A-Z])/g, '-$1').toLowerCase();
}
const filter = {
  [FILTER_TYPES.EVERYTHING]: (points) => points,

  [FILTER_TYPES.FUTURE]: (points) => points.filter((point) => {
    const pointDateFrom = dayjs(point.dateFrom);
    const now = dayjs();

    return pointDateFrom.isAfter(now);
  }),

  [FILTER_TYPES.PAST]: (points) => points.filter((point) => {
    const pointDateTo = dayjs(point.dateTo);
    const now = dayjs();

    return pointDateTo.isBefore(now);
  }),

  [FILTER_TYPES.PRESENT]: (points) => points.filter((point) => {
    const pointDateFrom = dayjs(point.dateFrom);
    const pointDateTo = dayjs(point.dateTo);
    const now = dayjs();

    return (pointDateFrom.isSame(now) || pointDateFrom.isBefore(now)) &&
      (pointDateTo.isSame(now) || pointDateTo.isAfter(now));
  }),
};

function generateFilter(points) {
  return Object.entries(filter).map(
    ([filterType, filterPoints]) => ({
      type: filterType,
      count: filterPoints(points).length,
    }),
  );
}

function updateItem(items, update){
  return items.map((item) => item.id === update.id ? update : item);
}

export { getRandomArrayElement, getRandomNumber, convertDate, formatDate, CamelCaseToKebabCase, filter, generateFilter, updateItem };
