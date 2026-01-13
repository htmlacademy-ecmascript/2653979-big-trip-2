import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { ALL_TYPES } from '../const.js';
import { formatDate } from '../utils.js';

function createEventFormTemplate(point, allDestinations, allOffers) {
  const { basePrice, dateFrom, dateTo, type, offers: selectedOfferIds, destination, isOffers, isDescription, isPictures, EventChange } = point;
  const currentOffer = allOffers.find((offer) => offer.type === type) || { offers: [] };
  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${EventChange}.png" alt="Event ${EventChange} icon">
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
            ${createOffersListTemplate(currentOffer.offers, selectedOfferIds, isOffers)}
            ${createDestinationInfoTemplate(destination, isDescription, isPictures)}
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
  return destinations.map((dest) => `<option value="${dest.name}"></option>`).join('') || '';
}

function createOffersListTemplate(allOffers, selectedOfferIds, isOffers) {
  if (!isOffers) {
    return '';
  }

  return `
            <section class="event__section event__section--offers">
              <h3 class="event__section-title event__section-title--offers">Offers</h3>
              <div class="event__available-offers">
              ${allOffers.map((offer) => {
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
  }).join('')}
  </div>
  </section>
  `;
}

function createDestinationInfoTemplate(destination, isDescription, isPictures) {
  if (!isDescription && !isPictures) {
    return '';
  }
  return `<section class="event__section event__section--destination">
              <h3 class="event__section-title event__section-title--destination">Destination</h3>
${isDescription ? `
                <p class="event__destination-description">${destination.description}</p>
              ` : ''}
${isPictures ? `
                <div class="event__photos-container">
                  <div class="event__photos-tape">
                    ${destination.pictures.map((picture) =>
    `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`
  ).join('')}
                  </div>
                </div>
              ` : ''}
              </section>`;
}

export default class EventFormView extends AbstractStatefulView {
  #allDestinations = [];
  #handleCloseClick = null;
  #allOffers = [];
  #handleFormSubmit = null;

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#saveForm();
  };

  #saveForm = () => {
    const formData = this.#getFormData();
    const updatedPoint = EventFormView.parseStateToPoint(this.#convertFormDataToPoint(formData));
    this.#handleFormSubmit(updatedPoint);
  };

  #convertFormDataToPoint = (formData) => {
    const currentOffer = this.#allOffers.find((offer) => offer.type === formData.type) || { offers: [] };
    return {
      ...this._state,
      ...formData,
      offer: currentOffer,
      isDescription: formData.destination.description !== null,
      isPictures: formData.destination.pictures !== null,
      isOffers: currentOffer.offers && currentOffer.offers.length > 0,
      EventChange: formData.type
    };
  };

  #getFormData = () => {
    const form = this.element.querySelector('.event--edit');
    const formData = new FormData(form);
    const selectedOffers = [];
    const offerCheckboxes = this.element.querySelectorAll('.event__offer-checkbox:checked');
    offerCheckboxes.forEach((checkbox) => {
      selectedOffers.push(checkbox.value);
    });

    return {
      type: formData.get('event-type'),
      destination: this._state.destination.id,
      dateFrom: this._state.dateFrom,
      dateTo: this._state.dateTo,
      basePrice: parseInt(formData.get('event-price'), 10) || this._state.basePrice,
      offers: selectedOffers,
      isFavorite: this._state.isFavorite,
      id: this._state.id
    };
  };

  #closeFormHandler = (evt) => {
    evt.preventDefault();
    this.#handleCloseClick();
  };

  #changeEventHandler = (evt) => {
    if (evt.target.tagName !== 'LABEL' || !evt.target.closest('.event__type-item')) {
      return;
    }

    evt.preventDefault();
    const newType = evt.target.previousElementSibling.value;
    const newOffer = this.#allOffers.find((offer) => offer.type === newType) || { offers: [] };
    this.updateElement({
      type: newType,
      EventChange: newType,
      offers: [],
      isOffers: newOffer.offers && newOffer.offers.length > 0
    });
  };

  #changeDestinationPointHandler = (evt) => {
    evt.preventDefault();
    const destinationName = evt.target.value;

    const foundDestination = this.#allDestinations.find(
      (dest) => dest.name.toLowerCase() === destinationName.toLowerCase()
    );

    if (foundDestination) {
      this.updateElement({
        destination: foundDestination,
        isDescription: foundDestination.description !== null && foundDestination.description !== undefined,
        isPictures: foundDestination.pictures !== null && foundDestination.pictures !== undefined
      });
    }
  };

  #changePriceHandler = (evt) => {
    evt.preventDefault();
    this._setState({
      price: evt.target.value,
    });
  };

  static parsePointToState(point) {
    return {
      ...point,
      isDescription: point.destination && point.destination.description !== null,
      isPictures: point.destination && point.destination.pictures !== null,
      isOffers: point.offer ? point.offer.offers.length > 0 : '',
      EventChange: point.type,
    };
  }

  reset(point) {
    this.updateElement(
      EventFormView.parsePointToState(point)
    );
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    if (point.destination) {

      if (!point.isDescription) {
        point.destination.description = null;
      }

      if (!point.isPictures) {
        point.destination.pictures = null;
      }
    }

    if (!point.isOffers) {
      point.offers = { ...point.offer.id };
    }

    delete point.isDescription;
    delete point.isPictures;
    delete point.isOffers;

    return point;
  }

  constructor(point, allDestinations = [], allOffers = [], handlers) {
    super();
    this._setState(EventFormView.parsePointToState(point));
    this.#allDestinations = allDestinations;
    this.#allOffers = allOffers;
    this.#handleCloseClick = handlers.onCloseClick;
    this.#handleFormSubmit = handlers.onFormSubmit;
    this._restoreHandlers();
  }

  _restoreHandlers() {
    this.element.querySelector('.event__save-btn').addEventListener('click', this.#formSubmitHandler);
    this.element.querySelector('.event__save-btn').addEventListener('click', this.#closeFormHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeFormHandler);
    this.element.querySelector('.event__type-group').addEventListener('click', this.#changeEventHandler);
    this.element.querySelector('.event__input--destination').addEventListener('input', this.#changeDestinationPointHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#changePriceHandler);
  }

  get template() {
    return createEventFormTemplate(this._state, this.#allDestinations, this.#allOffers);
  }
}
