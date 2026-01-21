import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { ALL_TYPES } from '../const.js';
import { formatDate } from '../utils.js';
import flatpickr from 'flatpickr';
import { UpdateType, UserAction } from '../const.js';
import he from 'he';

import 'flatpickr/dist/flatpickr.min.css';

function createEventFormTemplate(point, allDestinations, allOffers, isDisabled, isSaving, isDeleting) {
  const { basePrice, dateFrom, dateTo, type, offers: selectedOfferIds, destination } = point;
  const currentOffer = allOffers.find((offer) => offer.type === type) || { offers: [] };
  const currentDestination = allDestinations.find((dest) => dest.id === destination);
  const newPoint = destination.length === 0;
  return `
    <li class="trip-events__item" ${isDisabled ? 'tabindex="-1"' : ''}>
      <form class="event event--edit" action="#" method="post"  ${isDisabled ? 'tabindex="-1"' : ''}>
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
            <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${he.encode(currentDestination ? currentDestination.name : '')}" list="destination-list-1" autocomplete="off" ${isDisabled ? 'disabled' : ''}  ${isDisabled ? 'tabindex="-1"' : ''} placeholder="Type to see destinations..." required>
            <datalist id="destination-list-1">
              ${createDestinationsListTemplate(allDestinations)}
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formatDate(dateFrom)}" readonly ${isDisabled ? 'disabled' : ''}  ${isDisabled ? 'tabindex="-1"' : ''}>
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formatDate(dateTo)}" readonly ${isDisabled ? 'disabled' : ''}  ${isDisabled ? 'tabindex="-1"' : ''}>
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice}" min="1" step="1" placeholder="Enter price" ${isDisabled ? 'disabled' : ''}  ${isDisabled ? 'tabindex="-1"' : ''} required>
          </div>

          <button class="event__save-btn btn btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}  ${isDisabled ? 'tabindex="-1"' : ''}>${isSaving ? 'Saving...' : 'Save'}</button>
          ${createResetButtonTemplate(newPoint, isDeleting, isDisabled)}
          <button class="event__rollup-btn" type="button" ${isDisabled ? 'disabled' : ''}  ${isDisabled ? 'tabindex="-1"' : ''}>
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
            ${createOffersListTemplate(currentOffer.offers, selectedOfferIds, isDisabled)}
            ${createDestinationInfoTemplate(currentDestination)}
        </section>
      </form>
    </li>
  `;
}

function createResetButtonTemplate(newPoint, isDeleting, isDisabled) {
  if (newPoint){
    return `<button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''}  ${isDisabled ? 'tabindex="-1"' : ''}>Cancel</button>`;
  }
  return `<button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''}  ${isDisabled ? 'tabindex="-1"' : ''}>${isDeleting ? 'Deleting...' : 'Delete'}</button>`;
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

function createOffersListTemplate(allOffers, selectedOfferIds, isDisabled) {
  if (!allOffers || allOffers.length === 0) {
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
                     ${isChecked ? 'checked' : ''}
                     ${isDisabled ? 'disabled' : ''}
                      ${isDisabled ? 'tabindex="-1"' : ''}>
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
  if (!destination || (!destination.description && (!destination.pictures || destination.pictures.length === 0))) {
    return '';
  }

  return `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      ${destination.description ? `<p class="event__destination-description">${destination.description}</p>` : ''}
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
  `;
}

export default class EventFormView extends AbstractStatefulView {
  #allDestinations = [];
  #handleCloseClick = null;
  #handleDeleteClick = null;
  #allOffers = [];
  #handleFormSubmit = null;
  #datepickerFrom = null;
  #datepickerTo = null;
  #originalPoint = null;

  constructor(point = {}, allDestinations = [], allOffers = [], handlers) {
    super();
    this.#originalPoint = point;
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
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeFormHandler);
    this.element.querySelector('.event__type-group').addEventListener('click', this.#changeEventHandler);

    const destinationInput = this.element.querySelector('.event__input--destination');
    destinationInput.addEventListener('change', this.#changeDestinationHandler);

    const priceInput = this.element.querySelector('.event__input--price');
    priceInput.addEventListener('input', this.#changePriceHandler);

    const startTimeInput = this.element.querySelector('#event-start-time-1');
    const endTimeInput = this.element.querySelector('#event-end-time-1');

    startTimeInput.addEventListener('keydown', this.#preventManualTimeInput);
    endTimeInput.addEventListener('keydown', this.#preventManualTimeInput);

    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deletePointHandler);

    this.#setDatePickerFrom();
    this.#setDateToPicker();
  }

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
    this._state.isDisabled = true;
    evt.preventDefault();

    const form = this.element.querySelector('form');
    if (!form.checkValidity()) {
      form.reportValidity();
      this._state.isDisabled = false;
      return;
    }
    const destinationInput = this.element.querySelector('.event__input--destination');
    if (!this.#isValidDestination(destinationInput.value)) {
      destinationInput.setCustomValidity('Please select a destination from the list');
      destinationInput.reportValidity();
      this._state.isDisabled = false;
      return;
    }

    this.#saveForm();
  };

  #isValidDestination = (destinationName) => {
    const trimmedName = destinationName.trim();
    if (!trimmedName) {
      return false;
    }

    return this.#allDestinations.some((dest) =>
      dest.name.toLowerCase() === trimmedName.toLowerCase()
    );
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
    this.reset(this.#originalPoint);
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

  #changeDestinationHandler = (evt) => {
    evt.preventDefault();
    const destinationInput = evt.target;
    const destinationName = destinationInput.value.trim();
    destinationInput.setCustomValidity('');

    if (destinationName === '') {
      this.updateElement({
        destination: null,
      });
      return;
    }

    const destinationItem = this.#allDestinations.find(
      (dest) => dest.name.toLowerCase() === destinationName.toLowerCase()
    );

    if (destinationItem) {
      this.updateElement({
        destination: destinationItem.id,
      });
    }
  };

  #changePriceHandler = (evt) => {
    evt.preventDefault();
    const value = evt.target.value;
    const numericValue = value.replace(/[^\d]/g, '');

    this._setState({
      basePrice: numericValue === '' ? '' : Number(numericValue),
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

  static parsePointToState(point) {
    return {
      ...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  reset(point) {
    this.updateElement(
      EventFormView.parsePointToState(point)
    );
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;
    return point;
  }

  #deletePointHandler = (evt) => {
    evt.preventDefault();

    if (this._state.isDisabled) {
      return;
    }

    this.#handleDeleteClick(EventFormView.parseStateToPoint(this._state));
  };

  get template() {
    return createEventFormTemplate(this._state, this.#allDestinations, this.#allOffers, this._state.isDisabled, this._state.isSaving, this._state.isDeleting);
  }
}
