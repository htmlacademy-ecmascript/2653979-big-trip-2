import ListControlView from '../view/list-control-view.js';
import { filter } from '../utils.js';
import { FILTER_TYPES, UpdateType } from '../const';
import { remove, render, replace } from '../framework/render.js';

export default class FilterPresenter {
  #filterContainer = null;
  #filterModel = null;
  #pointModel = null;

  #filterComponent = null;

  constructor({ filterContainer, filterModel, pointModel }) {
    this.#filterContainer = filterContainer;
    this.#filterModel = filterModel;
    this.#pointModel = pointModel;

    this.#pointModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get filters() {
    const points = this.#pointModel.points;

    return [
      {
        type: FILTER_TYPES.EVERYTHING,
        name: 'everything',
        count: filter[FILTER_TYPES.EVERYTHING](points).length,
      },
      {
        type: FILTER_TYPES.FUTURE,
        name: 'future',
        count: filter[FILTER_TYPES.FUTURE](points).length,
      },
      {
        type: FILTER_TYPES.PAST,
        name: 'past',
        count: filter[FILTER_TYPES.PAST](points).length,
      },
      {
        type: FILTER_TYPES.PRESENT,
        name: 'present',
        count: filter[FILTER_TYPES.PRESENT](points).length,
      },
    ];
  }

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }

    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };

  init() {
    const filters = this.filters;
    const prevFilterComponent = this.#filterComponent;

    this.#filterComponent = new ListControlView({
      filters: filters,
      currentFilterType: this.#filterModel.filter,
      events: this.#handleFilterTypeChange,
    });

    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#filterContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }
}
