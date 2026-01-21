import AbstractView from '../framework/view/abstract-view';
import { calculateTripInfo } from '../utils';

function createTripInfoTemplate(points, allDestinations, allOffers) {
  const tripInfo = calculateTripInfo(points, allDestinations, allOffers);
  return `
  <section class="trip-main__trip-info  trip-info">
            <div class="trip-info__main">
              <h1 class="trip-info__title">${tripInfo.route}</h1>
              <p class="trip-info__dates">${tripInfo.dates}</p>
            </div>
            <p class="trip-info__cost">
              Total: €&nbsp;<span class="trip-info__cost-value">${tripInfo.totalPrice}</span>
            </p>
          </section>
              `;
}

export default class TripInfoView extends AbstractView {
  #points = [];
  #destinations = [];
  #offers = [];
  constructor(points, allDestinations, allOffers) {
    super();
    this.#points = points;
    this.#destinations = allDestinations;
    this.#offers = allOffers;
  }

  get template() {
    return createTripInfoTemplate(this.#points, this.#destinations, this.#offers);
  }
}
