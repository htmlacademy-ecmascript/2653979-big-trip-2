import {getRandomArrayElement} from '../utils';
import {TYPES} from './const';
import {ALL_TYPES} from '../const';

export function createOffer(){
  const randomType = getRandomArrayElement(ALL_TYPES);

  const offersForType = TYPES[randomType];

  return {
    type: randomType,
    offers: offersForType
  };
}
