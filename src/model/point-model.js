import { createPoint } from '../mock/point';
import { POINT_COUNT } from '../mock/const';
import { createOffer } from '../mock/offer';
import { createDestination } from '../mock/destination';
import Observable from '../framework/observable';

export default class PointModel extends Observable {
  #points = [];
  #destinations = [];
  #offers = [];

  constructor() {
    super();
    this.#destinations = Array.from({ length: POINT_COUNT }, () => createDestination());
    this.#offers = Array.from({ length: POINT_COUNT }, () => createOffer());
    this.#points = this.#destinations.map((destination, index) =>
      createPoint(destination.id, this.#offers[index])
    );
  }

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }


  updatePoint(updateType, updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      updatedPoint,
      ...this.#points.slice(index + 1)
    ];
    this._notify(updateType, updatedPoint);
  }

  addPoint(updateType, updatedPoint) {
    this.#points = [
      updatedPoint,
      ...this.#points
    ];
    this._notify(updateType, updatedPoint);
  }

  deletePoint(updateType, updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1)
    ];
    this._notify(updateType);
  }
}
