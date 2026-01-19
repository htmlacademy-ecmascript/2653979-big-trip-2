import AbstractView from '../framework/view/abstract-view';
import { ALL_TYPES } from '../const';
import { calculateTripInfo } from '../utils';

function createTripInfoTemplate(points, allDestinations) {
  const data = calculateTripInfo(points, allDestinations, ALL_TYPES);
  return `
  <section class="trip-main__trip-info  trip-info">
            <div class="trip-info__main">
              <h1 class="trip-info__title">${data.route}</h1>
              <p class="trip-info__dates">${data.dates}</p>
            </div>
            <p class="trip-info__cost">
              Total: €&nbsp;<span class="trip-info__cost-value">${data.totalPrice}</span>
            </p>
          </section>
              `;
}

export default class TripInfoView extends AbstractView {
  #points = [];
  #destinations = [];
  constructor(points, allDestinations) {
    super();
    this.#points = points;
    this.#destinations = allDestinations;
  }

  get template() {
    return createTripInfoTemplate(this.#points, this.#destinations);
  }
}
