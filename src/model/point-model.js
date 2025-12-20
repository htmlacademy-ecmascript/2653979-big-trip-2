import { createPoint } from '../mock/point';
import { POINT_COUNT } from '../mock/const';
import { createOffer } from '../mock/offer';
import { createDestination } from '../mock/destination';

export default class PointModel {
  #points = [];
  #destinations = [];
  #offers = [];

  constructor() {
    this.#destinations = Array.from({ length: POINT_COUNT }, () => createDestination());
    this.#offers = Array.from({ length: POINT_COUNT }, () => createOffer());
    this.#points = this.#destinations.map((destination, index) =>
      createPoint(destination.id, this.#offers[index])
    );
  }

  getPoints() {
    return this.#points;
  }

  getDestinations() {
    return this.#destinations;
  }

  getOffers() {
    return this.#offers;
  }
}
