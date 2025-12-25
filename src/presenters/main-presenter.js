import ListFiltersView from '../view/list-filters-view.js';
import ListSortView from '../view/list-sort-view.js';
import ListEventsView from '../view/list-events-view.js';
import PointPresenter from '../presenters/point-rpesenter.js';
import TripInfoView from '../view/trip-info-view.js';

import { render, replace } from '../framework/render.js';
import { generateFilter, filter, updateItem, sortPointDay, sortPointTime, sortPointPrice } from '../utils.js';
import { FILTER_TYPES, SortType } from '../const.js';

export default class MainPresenter {
  #headerContainer = null;
  #mainContainer = null;

  #eventsComponents = [];
  #points = [];
  #destinations = [];
  #offers = [];
  #pointPresenters = new Map();
  #filters = [];
  #currentFilterType = FILTER_TYPES.EVERYTHING;
  #currentSortType = SortType.PRICE;
  #tripFilterElement = null;
  #tripInfoComponent = null;
  #sortComponent = null;

  constructor({ headerContainer, mainContainer, pointModel }) {
    this.#headerContainer = headerContainer;
    this.#mainContainer = mainContainer;
    this.#points = [...pointModel.getPoints()];
    this.#destinations = [...pointModel.getDestinations()];
    this.#offers = [...pointModel.getOffers()];
    this.#filters = generateFilter(this.#points);
    this.#tripFilterElement = this.#headerContainer.querySelector('.trip-controls__filters');
    this.#points.sort(sortPointDay);
  }

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleFilterChange = (currentFilter) => {
    this.#currentFilterType = currentFilter;
    this.#rerenderPoints();
  };

  #handlePointChange = (updatePoint) => {
    this.#points = updateItem(this.#points, updatePoint);
    this.#pointPresenters.get(updatePoint.id).init(updatePoint);
    this.#rerenderPoints();
  };


  #rerenderPoints() {
    const filteredPoints = filter[this.#currentFilterType](this.#points);
    const sortedPoints = this.#sortPoints(filteredPoints, this.#currentSortType);
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
    this.#eventsComponents.clearElement();
    const tripList = this.#eventsComponents.element;
    sortedPoints.forEach((point) => {
      this.#renderPoint(point, tripList);
    });
    this.#updateTripInfo(sortedPoints);
  }

  #updateTripInfo(points) {
    const newTripInfoComponent = new TripInfoView(points, this.#destinations);
    if (this.#tripInfoComponent === null) {
      render(newTripInfoComponent, this.#headerContainer, 'afterbegin');
      this.#tripInfoComponent = newTripInfoComponent;
    } else {
      replace(newTripInfoComponent, this.#tripInfoComponent);
      this.#tripInfoComponent = newTripInfoComponent;
    }
  }

  #renderPoint(point, tripList) {
    const offer = this.#offers.find((off) => off.type === point.type);
    const destination = this.#destinations.find((dest) => dest.id === point.destination);

    const pointPresenter = new PointPresenter({
      point: {
        ...point,
        offer,
        destination
      },
      allDestinations: this.#destinations,
      container: tripList,
      events: {
        onDataChange: this.#handlePointChange,
        onModeChange: this.#handleModeChange,
      }
    });

    this.#pointPresenters.set(point.id, pointPresenter);
    pointPresenter.init();
  }

  #sortPoints(pointsToSort, sortType) {
    const sortedPoints = [...pointsToSort];

    switch (sortType) {
      case SortType.DAY:
        sortedPoints.sort(sortPointDay);
        break;
      case SortType.TIME:
        sortedPoints.sort(sortPointTime);
        break;
      case SortType.PRICE:
        sortedPoints.sort(sortPointPrice);
        break;
      default:
    }

    return sortedPoints;
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#sortPoint(sortType);
  };

  #sortPoint(sortType) {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#rerenderPoints();
  }


  #renderSort() {
    this.#sortComponent = new ListSortView({
      onSortTypeChange: this.#handleSortTypeChange,
    });
    render(this.#sortComponent, this.#mainContainer);
  }

  init() {
    this.#renderSort();
    this.#eventsComponents = new ListEventsView();
    render(this.#eventsComponents, this.#mainContainer);
    this.#rerenderPoints();

    render(new ListFiltersView(this.#filters, this.#currentFilterType, this.#handleFilterChange), this.#tripFilterElement);
  }

}
