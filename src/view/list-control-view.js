import AbstractView from '../framework/view/abstract-view';

function createListFiltersTemplate(filters, currentFilterType) {
  if (filters.lenght === 0) {
    return '';
  }
  return `
  <form class="trip-filters" action="#" method="get">
${filters.map((filter) => `
    <div class="trip-filters__filter">
      <input
        id="filter-${filter.type}"
        class="trip-filters__filter-input  visually-hidden"
        type="radio"
        name="trip-filter"
        value="${filter.type}"
        ${filter.type === currentFilterType ? 'checked' : ''}
        ${filter.count === 0 ? 'disabled' : ''}>
      <label class="trip-filters__filter-label" for="filter-${filter.type}">${filter.type}</label>
    </div>`).join('')}
    <button class="visually-hidden" type="submit">Accept filter</button>
  </form>
  `;
}

export default class ListControlView extends AbstractView {
  #handleFilterChange = null;
  #filters = [];
  #currentFilter = null;

  #filterChangeHandler = (evt) => {
    evt.preventDefault();
    this.#handleFilterChange(evt.target.value);
  };

  constructor(data) {
    super();
    this.#filters = data.filters;
    this.#currentFilter = data.currentFilterType;
    this.#handleFilterChange = data.events;

    this.element.addEventListener('change', this.#filterChangeHandler);
  }

  get template() {
    return createListFiltersTemplate(this.#filters, this.#currentFilter);
  }

}
