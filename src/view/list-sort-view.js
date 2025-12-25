import AbstractView from '../framework/view/abstract-view';
import { SortType } from '../const';
function createListControlsTemplate() {
  return `
<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
            <div class="trip-sort__item  trip-sort__item--${SortType.DAY}">
              <input id="sort-${SortType.DAY}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-${SortType.DAY}">
              <label class="trip-sort__btn" for="sort-${SortType.DAY}">${SortType.DAY}</label>
            </div>

            <div class="trip-sort__item  trip-sort__item--event">
              <input id="sort-event" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-event" disabled="">
              <label class="trip-sort__btn" for="sort-event">Event</label>
            </div>

            <div class="trip-sort__item  trip-sort__item--${SortType.TIME}">
              <input id="sort-${SortType.TIME}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-${SortType.TIME}">
              <label class="trip-sort__btn" for="sort-${SortType.TIME}">${SortType.TIME}</label>
            </div>

            <div class="trip-sort__item  trip-sort__item--${SortType.PRICE}">
              <input id="sort-${SortType.PRICE}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-${SortType.PRICE}" checked="">
              <label class="trip-sort__btn" for="sort-${SortType.PRICE}">${SortType.PRICE}</label>
            </div>

            <div class="trip-sort__item  trip-sort__item--offer">
              <input id="sort-offer" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-offer" disabled="">
              <label class="trip-sort__btn" for="sort-offer">Offers</label>
            </div>
          </form>
              `;
}

export default class ListSortView extends AbstractView {
  #handleSortTypeChange = null;
  #sortTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'LABEL') {
      return;
    }
    evt.preventDefault();
    this.#handleSortTypeChange(evt.target.textContent);
  };

  constructor({ onSortTypeChange }) {
    super();
    this.#handleSortTypeChange = onSortTypeChange;

    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  get template() {
    return createListControlsTemplate();
  }
}
