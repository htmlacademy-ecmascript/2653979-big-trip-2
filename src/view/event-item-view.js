import AbstractView from '../framework/view/abstract-view';
import dayjs from 'dayjs';
import { convertDate } from '../utils.js';

function createEventTemplate(point, AllDestinations, AllOffers) {
  const { basePrice, dateFrom, dateTo, type, offers: selectedOfferIds, destination, isFavorite } = point;
  const currentOffer = AllOffers.find((offer) => offer.type === type) || { offers: [] };
  const currentDestination = AllDestinations.find((dest) => dest.id === destination);

  const formatYersMounthDay = (date) => dayjs(date).format('YYYY-MM-DD');
  const formatHourMinute = (date) => dayjs(date).format('HH:mm');
  const formatYMDTHM = (date) => dayjs(date).format('YYYY-MM-DDTHH:mm');
  return `
    <li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${formatYersMounthDay(dateFrom)}">${dayjs(dateFrom).format('MMM DD')}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event ${type} icon">
        </div>
        <h3 class="event__title">${type} ${currentDestination.name}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${formatYMDTHM(dateFrom)}">${formatHourMinute(dateFrom)}</time>
            &mdash;
            <time class="event__end-time" datetime="${formatYMDTHM(dateTo)}">${formatHourMinute(dateTo)}</time>
          </p>
          <p class="event__duration">${convertDate(dateFrom, dateTo)}</p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
        </p>
        <h4 class="visually-hidden">Offers:</h4>
        ${ currentOffer ?
    createOffersTemplate(currentOffer, selectedOfferIds) : ''
}
        <button class="event__favorite-btn ${isFavorite ? 'event__favorite-btn--active' : ''} " type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>
  `;
}

function createOffersTemplate(allOffers, selectedOfferIds) {
  if (selectedOfferIds.length === 0) {
    return '';
  }
  const selectedOffers = allOffers.offers.filter((offer) => selectedOfferIds.includes(offer.id));

  if (selectedOffers.length === 0) {
    return '';
  }

  return `
    <ul class="event__selected-offers">
      ${selectedOffers.map((offer) => `
        <li class="event__offer">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </li>
      `).join('')}
    </ul>
  `;
}

export default class EventItemView extends AbstractView {
  #openClick = null;
  #favoriteClick = null;
  #point = null;
  #AllOffers = null;
  #AllDestinations = null;

  #openFormHandler = (evt) => {
    evt.preventDefault();
    this.#openClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#favoriteClick();
  };

  constructor(point, AllDestinations, AllOffers, events) {
    super();
    this.#point = point;
    this.#AllOffers = AllOffers;
    this.#AllDestinations = AllDestinations;
    this.#openClick = events.onOpenClick;
    this.#favoriteClick = events.onFavoriteClick;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#openFormHandler);
    this.element.querySelector('.event__favorite-btn').addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createEventTemplate(this.#point, this.#AllDestinations, this.#AllOffers);
  }
}
