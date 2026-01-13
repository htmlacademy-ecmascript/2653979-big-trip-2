import AbstractView from '../framework/view/abstract-view';
import { SortType } from '../const';

function createListControlsTemplate(currentSortType) {
  return `
<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
    <div class="trip-sort__item  trip-sort__item--${SortType.DAY}">
      <input id="sort-${SortType.DAY}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="${SortType.DAY}" ${currentSortType === SortType.DAY ? 'checked' : ''}>
      <label class="trip-sort__btn" for="sort-${SortType.DAY}" data-sort-type="${SortType.DAY}">${SortType.DAY}</label>
    </div>

    <div class="trip-sort__item  trip-sort__item--event">
      <input id="sort-event" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="event" disabled>
      <label class="trip-sort__btn" for="sort-event">Event</label>
    </div>

    <div class="trip-sort__item  trip-sort__item--${SortType.TIME}">
      <input id="sort-${SortType.TIME}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="${SortType.TIME}" ${currentSortType === SortType.TIME ? 'checked' : ''}>
      <label class="trip-sort__btn" for="sort-${SortType.TIME}" data-sort-type="${SortType.TIME}">${SortType.TIME}</label>
    </div>

    <div class="trip-sort__item  trip-sort__item--${SortType.PRICE}">
      <input id="sort-${SortType.PRICE}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="${SortType.PRICE}" ${currentSortType === SortType.PRICE ? 'checked' : ''}>
      <label class="trip-sort__btn" for="sort-${SortType.PRICE}" data-sort-type="${SortType.PRICE}">${SortType.PRICE}</label>
    </div>

    <div class="trip-sort__item  trip-sort__item--offer">
      <input id="sort-offer" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="offer" disabled>
      <label class="trip-sort__btn" for="sort-offer">Offers</label>
    </div>
  </form>`;
}

export default class ListSortView extends AbstractView {
  #handleSortTypeChange = null;
  #currentSortType = null;

  #sortTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'LABEL' || !evt.target.dataset.sortType) {
      return;
    }
    evt.preventDefault();

    const sortType = evt.target.dataset.sortType;

    if (Object.values(SortType).includes(sortType)) {
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
    return createListControlsTemplate(this.#currentSortType);
  }
}
