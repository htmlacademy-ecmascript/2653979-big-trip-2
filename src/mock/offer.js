import {getRandomArrayElement} from '../utils';
import {TYPES} from './const';
import {ALL_TYPES} from '../const';

export function createOffer(){
  const typeKeys = ALL_TYPES;
  const randomType = getRandomArrayElement(typeKeys);

  const offersForType = TYPES[randomType];

  return {
    type: randomType,
    offers: offersForType
  };
}
