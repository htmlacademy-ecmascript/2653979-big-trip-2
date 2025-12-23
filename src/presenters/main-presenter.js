import ListFiltersView from '../view/list-filters-view.js';
import ListSortView from '../view/list-sort-view.js';
import ListEventsView from '../view/list-events-view.js';
import PointPresenter from '../presenters/point-rpesenter.js';
import TripInfoView from '../view/trip-info-view.js';

import { render, replace } from '../framework/render.js';
import { generateFilter, filter } from '../utils.js';
import { FILTER_TYPES } from '../const.js';

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
  #tripFilterElement = null;
  #tripInfoComponent = null;

  constructor({ headerContainer, mainContainer, pointModel }) {
    this.#headerContainer = headerContainer;
    this.#mainContainer = mainContainer;
    this.#points = [...pointModel.getPoints()];
    this.#destinations = [...pointModel.getDestinations()];
    this.#offers = [...pointModel.getOffers()];
    this.#filters = generateFilter(this.#points);
    this.#tripFilterElement = this.#headerContainer.querySelector('.trip-controls__filters');
  }

  #handleFilterChange = (currentFilter) => {
    this.#currentFilterType = currentFilter;
    const filterPoints = filter[currentFilter](this.#points);
    this.#eventsComponents.clearElement();
    this.#updateTripInfo(filterPoints);
    const tripList = this.#eventsComponents.element;
    filterPoints.forEach((point) => {
      this.#renderPoint(point, tripList);
    });
  };

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
    });

    this.#pointPresenters.set(point.id, pointPresenter);
    pointPresenter.init();
  }

  #renderPoints(tripList) {
    this.#points.forEach((point) => {
      this.#renderPoint(point, tripList);
    });
  }

  init() {
    render(new ListSortView(), this.#mainContainer);
    this.#eventsComponents = new ListEventsView();
    render(this.#eventsComponents, this.#mainContainer);
    this.#renderPoints(this.#eventsComponents.element);
    this.#updateTripInfo(this.#points);

    render(new ListFiltersView(this.#filters, this.#currentFilterType, this.#handleFilterChange), this.#tripFilterElement);
  }
}
