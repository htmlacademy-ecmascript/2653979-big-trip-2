import AbstractView from '../framework/view/abstract-view';
import { ALL_TYPES } from '../const.js';
import { formatDate } from '../utils.js';

function createEventFormTemplate(point, allDestinations) {
  const { offer, basePrice, dateFrom, dateTo, type, offers: selectedOfferIds, destination } = point;
  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event ${type} icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createEventTypesListTemplate(type)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destination.name}" list="destination-list-1">
            <datalist id="destination-list-1">
              ${createDestinationsListTemplate(allDestinations)}
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formatDate(dateFrom)}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formatDate(dateTo)}">
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          ${offer.offers && offer.offers.length > 0 ? `
            <section class="event__section event__section--offers">
              <h3 class="event__section-title event__section-title--offers">Offers</h3>
              <div class="event__available-offers">
                ${createOffersListTemplate(offer.offers, selectedOfferIds)}
              </div>
            </section>
          ` : ''}

          ${destination ? `
            <section class="event__section event__section--destination">
              <h3 class="event__section-title event__section-title--destination">Destination</h3>
              ${destination.description ? `
                <p class="event__destination-description">${destination.description}</p>
              ` : ''}
              ${destination.pictures && destination.pictures.length > 0 ? `
                <div class="event__photos-container">
                  <div class="event__photos-tape">
                    ${destination.pictures.map((picture) =>
    `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`
  ).join('')}
                  </div>
                </div>
              ` : ''}
            </section>
          ` : ''}
        </section>
      </form>
    </li>
  `;
}

function createEventTypesListTemplate(currentType) {
  return ALL_TYPES.map((type) => `
    <div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${type}" ${type === currentType ? 'checked' : ''}>
      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-1">${type.charAt(0).toUpperCase() + type.slice(1)}</label>
    </div>
  `).join('');
}

function createDestinationsListTemplate(destinations) {
  const uniqueNames = [...new Set(destinations.map((dest) => dest.name))];

  return uniqueNames.map((name) => `<option value="${name}"></option>`).join('') || '';
}

function createOffersListTemplate(allOffers, selectedOfferIds) {
  return allOffers.map((offer) => {
    const isChecked = selectedOfferIds && selectedOfferIds.includes(offer.id);
    return `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden"
               id="event-offer-${offer.id}"
               type="checkbox"
               name="event-offer"
               value="${offer.id}"
               ${isChecked ? 'checked' : ''}>
        <label class="event__offer-label" for="event-offer-${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>
    `;
  }).join('');
}

export default class EventFormView extends AbstractView {
  #point = null;
  #allDestinations = [];
  #handleClick = null;

  #closeFormHandler = (evt) => {
    evt.preventDefault();
    this.#handleClick();
  };

  constructor(pointData, events, allDestinations = []) {
    super();
    this.#point = pointData;
    this.#allDestinations = allDestinations;
    this.#handleClick = events.onCloseClick;
    this.element.querySelector('.event__save-btn').addEventListener('click', this.#closeFormHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeFormHandler);
  }

  get template() {
    return createEventFormTemplate(this.#point, this.#allDestinations);
  }
}
