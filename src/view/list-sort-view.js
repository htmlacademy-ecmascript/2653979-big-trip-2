import AbstractView from '../framework/view/abstract-view';
import { SortType } from '../const';

function createListSortTemplate(currentSortType) {
  return `
<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
    ${createSortPart(SortType.DAY, currentSortType)}
    <div class="trip-sort__item  trip-sort__item--event">
      <input id="sort-event" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="event" disabled>
      <label class="trip-sort__btn" for="sort-event">Event</label>
    </div>
    ${createSortPart(SortType.TIME, currentSortType)}
    ${createSortPart(SortType.PRICE, currentSortType)}
    <div class="trip-sort__item  trip-sort__item--offer">
      <input id="sort-offer" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="offer" disabled>
      <label class="trip-sort__btn" for="sort-offer">Offers</label>
    </div>
  </form>`;
}

function createSortPart(sortType, currentSortType) {
  return `
  <div class="trip-sort__item  trip-sort__item--${sortType}">
      <input id="sort-${sortType}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="${sortType}" ${currentSortType === sortType ? 'checked' : ''}>
      <label class="trip-sort__btn" for="sort-${sortType}" data-sort-type="${sortType}">${sortType}</label>
    </div>
    `;
}

export default class ListSortView extends AbstractView {
  #handleSortTypeChange = null;
  #currentSortType = null;

  #sortTypeChangeHandler = (evt) => {
    const sortType = evt.target.dataset.sortType;
    if (evt.target.tagName !== 'LABEL' || !sortType) {
      return;
    }
    evt.preventDefault();

    if (SortType[sortType.toUpperCase()]) {
      this.#handleSortTypeChange(sortType);
    }
  };

  constructor({ onSortTypeChange, currentSortType }) {
    super();
    this.#handleSortTypeChange = onSortTypeChange;
    this.#currentSortType = currentSortType;

    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  get template() {
    return createListSortTemplate(this.#currentSortType);
  }
}
