import { getRandomNumber, getRandomArrayElement } from '../utils';
import { PRICE } from './const';

export function createPoint(destinationId, offer) {
  const timestamp1 = Date.now() + getRandomNumber(-365, 365) * 24 * 60 * 60 * 1000;
  const timestamp2 = Date.now() + getRandomNumber(-365, 365) * 24 * 60 * 60 * 1000;
  const dateFrom = new Date(Math.min(timestamp1, timestamp2));
  const dateTo = new Date(Math.max(timestamp1, timestamp2));
  const selectedOffer = getRandomArrayElement(offer.offers);

  return {
    id: crypto.randomUUID(),
    basePrice: getRandomNumber(PRICE.MIN, PRICE.MAX),
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
    destination: destinationId,
    isFavorite: !getRandomNumber(0, 1),
    offers: selectedOffer ? [selectedOffer.id] : [],
    type: offer.type
  };
}
