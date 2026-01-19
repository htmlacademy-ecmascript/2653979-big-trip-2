import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { ALL_TYPES } from '../const.js';
import { formatDate } from '../utils.js';
import flatpickr from 'flatpickr';
import { UpdateType, UserAction } from '../const.js';
import he from 'he';

import 'flatpickr/dist/flatpickr.min.css';

function createEventFormTemplate(point, allDestinations, allOffers) {
  const { basePrice, dateFrom, dateTo, type, offers: selectedOfferIds, destination } = point;
  const currentOffer = allOffers.find((offer) => offer.type === type) || { offers: [] };
  const currentDestination = allDestinations.find((dest) => dest.id === destination);
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
            <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${he.encode((currentDestination ? currentDestination.name : destination.name) || '')}" list="destination-list-1" autocomplete="off" placeholder="Type to see destinations...">
            <datalist id="destination-list-1">
              ${createDestinationsListTemplate(allDestinations)}
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formatDate(dateFrom)}" readonly>
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formatDate(dateTo)}" readonly>
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}" pattern="[0-9]*" inputmode="numeric" placeholder="Enter price">
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
            ${createOffersListTemplate(currentOffer.offers, selectedOfferIds)}
            ${createDestinationInfoTemplate(currentDestination)}
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

function createOffersListTemplate(allOffers, selectedOfferIds) {
  if (!allOffers) {
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

function createDestinationInfoTemplate(destination) {
  if (destination.description.length === 0 && destination.pictures.length === 0) {
    return '';
  }
  return `<section class="event__section event__section--destination">
              <h3 class="event__section-title event__section-title--destination">Destination</h3>
${destination.description ? `
                <p class="event__destination-description">${destination.description}</p>
              ` : ''}
${destination.pictures ? `
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
  #handleDeleteClick = null;
  #allOffers = [];
  #handleFormSubmit = null;
  #datepickerFrom = null;
  #datepickerTo = null;

  removeElement() {
    super.removeElement();

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }
    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  #setDatePickerFrom() {
    this.#datepickerFrom = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom,
        enableTime: true,
        onChange: ([userDate]) => {
          this._state.dateFrom = userDate;
        },
      }
    );
  }

  #setDateToPicker() {
    this.#datepickerTo = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        enableTime: true,
        onChange: ([userDate]) => {
          this._state.dateTo = userDate;
        },
      }
    );
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    const destinationInput = this.element.querySelector('.event__input--destination');
    const destinationName = destinationInput.value.trim();
    const datalist = this.element.querySelector('#destination-list-1');
    const options = Array.from(datalist.options);
    const isValidDestination = options.some((option) =>
      option.value.toLowerCase() === destinationName.toLowerCase()
    );

    if (!isValidDestination && destinationName !== '') {
      destinationInput.setCustomValidity('Please select a valid destination from the list');
      destinationInput.reportValidity();
      return;
    }
    destinationInput.setCustomValidity('');
    this.#saveForm();
  };

  #saveForm = () => {
    const formData = this.#getFormData();
    const updatedPoint = EventFormView.parseStateToPoint(formData);
    this.#handleFormSubmit(updatedPoint, UserAction.UPDATE_POINT, UpdateType.MINOR);
  };

  #getFormData = () => {
    const selectedOffers = [];
    const offerCheckboxes = this.element.querySelectorAll('.event__offer-checkbox:checked');
    offerCheckboxes.forEach((checkbox) => {
      selectedOffers.push(checkbox.value);
    });

    return {
      type: this._state.type,
      destination: this._state.destination,
      dateFrom: this._state.dateFrom instanceof Object ? this._state.dateFrom.toISOString() : this._state.dateFrom,
      dateTo: this._state.dateTo instanceof Object ? this._state.dateTo.toISOString() : this._state.dateTo,
      basePrice: this._state.basePrice,
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
      offers: [],
      isOffers: newOffer.offers && newOffer.offers.length > 0
    });
  };

  #validateDestinationInput = (evt) => {
    const input = evt.target;
    const value = input.value.trim();

    if (value === '') {
      input.setCustomValidity('');
      return;
    }

    const datalist = this.element.querySelector('#destination-list-1');
    const options = Array.from(datalist.options);

    const isValid = options.some((option) =>
      option.value.toLowerCase() === value.toLowerCase()
    );

    if (!isValid) {
      input.setCustomValidity('Please select a destination from the list');
    } else {
      input.setCustomValidity('');
    }
  };

  #changeDestinationHandler = (evt) => {
    evt.preventDefault();
    const destinationName = evt.target.value;

    if (destinationName === '') {
      this.updateElement({
        destination: { name: '', description: '', pictures: [] },
      });
      return;
    }

    this.#validateDestinationInput(evt);

    if (!evt.target.checkValidity()) {
      return;
    }

    const destinationItem = this.#allDestinations.find(
      (dest) => dest.name.toLowerCase() === destinationName.toLowerCase()
    );

    if (!destinationItem) {
      return '';
    }

    this.updateElement({
      destination: destinationItem.id,
    });
  };

  #changePriceHandler = (evt) => {
    evt.preventDefault();
    const value = evt.target.value.replace(/[^\d]/g, '');
    this._setState({
      basePrice: value,
    });
  };

  #preventManualTimeInput = (evt) => {
    if (evt.key === 'Tab' || evt.key === 'Escape') {
      return;
    }

    evt.preventDefault();

    if (evt.target.id === 'event-start-time-1' && this.#datepickerFrom) {
      this.#datepickerFrom.open();
    } else if (evt.target.id === 'event-end-time-1' && this.#datepickerTo) {
      this.#datepickerTo.open();
    }
  };

  #validatePriceInput = (evt) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    if (allowedKeys.includes(evt.key)) {
      return;
    }

    if (!/^\d$/.test(evt.key)) {
      evt.preventDefault();
    }
  };

  static parsePointToState(point) {
    return {
      ...point,
    };
  }

  reset(point) {
    this.updateElement(
      EventFormView.parsePointToState(point)
    );
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    return point;
  }

  constructor(point = {}, allDestinations = [], allOffers = [], handlers) {
    super();
    this._setState(EventFormView.parsePointToState(point));
    this.#allDestinations = allDestinations;
    this.#allOffers = allOffers;
    this.#handleCloseClick = handlers.onCloseClick;
    this.#handleFormSubmit = handlers.onFormSubmit;
    this.#handleDeleteClick = handlers.onDeletePoint;
    this._restoreHandlers();
  }

  _restoreHandlers() {
    this.element.querySelector('.event__save-btn').addEventListener('click', this.#formSubmitHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter' || evt.key === ' ') {
        this.#closeFormHandler(evt);
      }
    });
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeFormHandler);
    this.element.querySelector('.event__type-group').addEventListener('click', this.#changeEventHandler);

    const destinationInput = this.element.querySelector('.event__input--destination');
    destinationInput.addEventListener('input', (evt) => {
      evt.target.setCustomValidity('');
    });
    destinationInput.addEventListener('change', this.#changeDestinationHandler);
    destinationInput.addEventListener('blur', this.#validateDestinationInput);

    const priceInput = this.element.querySelector('.event__input--price');
    priceInput.addEventListener('keydown', this.#validatePriceInput);
    priceInput.addEventListener('input', this.#changePriceHandler);

    const startTimeInput = this.element.querySelector('#event-start-time-1');
    const endTimeInput = this.element.querySelector('#event-end-time-1');

    startTimeInput.addEventListener('keydown', this.#preventManualTimeInput);
    startTimeInput.addEventListener('click', (evt) => {
      evt.preventDefault();
      if (this.#datepickerFrom) {
        this.#datepickerFrom.open();
      }
    });

    endTimeInput.addEventListener('keydown', this.#preventManualTimeInput);
    endTimeInput.addEventListener('click', (evt) => {
      evt.preventDefault();
      if (this.#datepickerTo) {
        this.#datepickerTo.open();
      }
    });

    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deletePointHandler);

    this.#setDatePickerFrom();
    this.#setDateToPicker();
  }

  #deletePointHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(EventFormView.parseStateToPoint(this._state));
  };

  get template() {
    return createEventFormTemplate(this._state, this.#allDestinations, this.#allOffers);
  }
}
