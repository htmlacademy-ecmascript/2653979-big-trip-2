import { CITIES, DESCRIPTION, IMG_DESCRIPTION } from './const';
import { getRandomArrayElement, getRandomNumber } from '../utils';

export function createDestination() {
  const picturesCount = getRandomNumber(0, 5);
  const pictures = [];
  for (let i = 0; i < picturesCount; i++) {
    pictures.push({
      src: `https://loremflickr.com/248/152?random=${getRandomNumber(0, 100)}`,
      description: getRandomArrayElement(IMG_DESCRIPTION),
    });
  }

  return {
    id: crypto.randomUUID(),
    description: getRandomArrayElement(DESCRIPTION),
    name: getRandomArrayElement(CITIES),
    pictures,
  };
}
