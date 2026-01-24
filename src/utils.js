import dayjs from 'dayjs';
import { FILTER_TYPES, ALL_TYPES } from './const';

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

function formatDate(unformatingDate) {
  if (unformatingDate.length === 0){
    return unformatingDate;
  }
  const date = new Date(unformatingDate);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
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

function getWeightForNullDate(dateA, dateB) {
  if (dateA === null && dateB === null) {
    return 0;
  }

  if (dateA === null) {
    return 1;
  }

  if (dateB === null) {
    return -1;
  }

  return null;
}

function sortPointTime(pointA, pointB) {
  const durationA = dayjs(pointA.dateTo).diff(dayjs(pointA.dateFrom));
  const durationB = dayjs(pointB.dateTo).diff(dayjs(pointB.dateFrom));

  return durationB - durationA;
}

function sortPointPrice(pointA, pointB) {
  const priceA = pointA.basePrice || 0;
  const priceB = pointB.basePrice || 0;

  return priceB - priceA;
}

function sortPointDay(pointA, pointB) {
  const weight = getWeightForNullDate(pointA.dateFrom, pointB.dateFrom);

  if (weight !== null) {
    return weight;
  }

  const dateDiff = dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));

  if (dateDiff === 0) {
    return pointA.type.localeCompare(pointB.type);
  }

  return dateDiff;
}

function calculateTripInfo(points, destinations, allOffers) {
  const offersByType = {};
  allOffers.forEach((offerGroup) => {
    offersByType[offerGroup.type] = offerGroup.offers;
  });

  const totalPrice = points.reduce((sum, point) => {
    const { type, offers: selectedOfferIds, basePrice } = point;
    let pointTotal = +basePrice;

    if (selectedOfferIds?.length) {
      const offersForType = offersByType[type];
      if (offersForType) {
        selectedOfferIds.forEach((offerId) => {
          const selectedOffer = offersForType.find((offer) => offer.id === offerId);
          if (selectedOffer) {
            pointTotal += selectedOffer.price;
          }
        });
      }
    }

    return sum + pointTotal;
  }, 0);

  const destinationNames = [];
  let lastDestinationName = '';

  points
    .sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom))
    .forEach((point) => {
      const destination = destinations.find((dest) => dest.id === point.destination);
      const currentDestinationName = destination?.name || '';

      if (currentDestinationName && currentDestinationName !== lastDestinationName) {
        destinationNames.push(currentDestinationName);
        lastDestinationName = currentDestinationName;
      }
    });

  let route = '';
  if (destinationNames.length === 0) {
    route = '';
  } else if (destinationNames.length <= 3) {
    route = destinationNames.join(' — ');
  } else {
    route = `${destinationNames[0]} — ... — ${destinationNames[destinationNames.length - 1]}`;
  }

  let dates = '';
  if (points.length > 0) {
    const sortedPoints = [...points].sort((a, b) =>
      new Date(a.dateFrom) - new Date(b.dateFrom)
    );
    const firstDate = sortedPoints[0].dateFrom;
    const lastDate = sortedPoints[sortedPoints.length - 1].dateTo;
    const firstFormatted = dayjs(firstDate).format('D MMM YYYY');
    const lastFormatted = dayjs(lastDate).format('D MMM YYYY');

    dates = `${firstFormatted}&nbsp;—&nbsp;${lastFormatted}`;
  }

  return {
    totalPrice,
    route,
    dates
  };
}

function createEmptyPoint() {
  return {
    type: ALL_TYPES[0],
    destination: '',
    dateFrom: '',
    dateTo: '',
    basePrice: 0,
    offers: [],
    isFavorite: false
  };
}

export { convertDate, formatDate, filter, sortPointDay, sortPointPrice, sortPointTime, calculateTripInfo, createEmptyPoint };
