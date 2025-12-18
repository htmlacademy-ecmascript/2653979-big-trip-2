import AbstractView from '../framework/view/abstract-view';
import dayjs from 'dayjs';
import { convertDate, rewriteCamelCase } from '../utils.js';

function createEventTemplate(point) {
  const { offer, basePrice, dateFrom, dateTo, type, offers: selectedOfferIds, allDestinations } = point;
  const destination = allDestinations.find((dest) => dest.id === point.destination);

  const allOffers = offer.offers || [];
  const selectedOffers = selectedOfferIds || [];
  return `
            <li class="trip-events__item">
              <div class="event">
                <time class="event__date" datetime="2019-03-18">MAR 18</time>
                <div class="event__type">
                  <img class="event__type-icon" width="42" height="42" src="img/icons/${rewriteCamelCase(type)}.png" alt="Event ${type} icon">
                </div>
                <h3 class="event__title">${type } ${ destination.name}</h3>
                <div class="event__schedule">
                  <p class="event__time">
                    <time class="event__start-time" datetime="${dayjs(dateFrom).format('YYYY-MM-DDTHH:mm:ss')}">${dayjs(dateFrom).format('HH:mm')}</time>
                    &mdash;
                    <time class="event__end-time" datetime="${dayjs(dateTo).format('YYYY-MM-DDTHH:mm:ss')}">${dayjs(dateTo).format('HH:mm')}</time>
                  </p>
                  <p class="event__duration">${convertDate(dateFrom, dateTo)}</p>
                </div>
                <p class="event__price">
                  &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
                </p>
                <h4 class="visually-hidden">Offers:</h4>
                ${addOffers(allOffers, selectedOffers)}
                <button class="event__favorite-btn" type="button">
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

function addOffers(allOffers, selectedOffers) {
  if (selectedOffers && selectedOffers.length >= 1){
    let tmp = '<ul class="event__selected-offers">';
    tmp += allOffers.map((offer) => {
      const isChecked = selectedOffers.includes(offer.id);
      if (isChecked) {
        return `
        <li class="event__offer"><span class="event__offer-title">${offer.title}&plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span></li>
        `;
      } else {
        return '';
      }
    }).join('');
    tmp += '</ul>';
    return tmp;
  }else{
    return '';
  }
}

export default class EventItemView extends AbstractView {
  #handleClick = null;
  #point = [];

  #clickHandler = (evt) => {
    evt.preventDefault();
    this.#handleClick();
  };

  constructor(pointData) {
    super();
    this.#point = pointData;
    this.#handleClick = pointData.onClick;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#clickHandler);
  }

  get template() {
    return createEventTemplate(this.#point);
  }
}
