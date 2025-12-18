import ListFiltersView from '../view/filters-view.js';
import ListSortView from '../view/list-sort-view.js';
import ListEventsView from '../view/events-list-view.js';
import PointPresenter from '../presenters/point-rpesenter.js';

import { render } from '../framework/render.js';

export default class MainPresenter {
  #headerContainer = null;
  #mainContainer = null;
  #pointModel = null;
  #eventsComponents;

  #points = [];
  #destinations = [];
  #offers = [];
  #pointPresenters = new Map();

  constructor({ headerContainer, mainContainer, pointModel }) {
    this.#headerContainer = headerContainer;
    this.#mainContainer = mainContainer;
    this.#pointModel = pointModel;
    this.#points = [...this.#pointModel.getPoints()];
    this.#destinations = [...this.#pointModel.getDestinations()];
    this.#offers = [...this.#pointModel.getOffers()];
  }

  #renderPoint(point, tripList) {
    const offer = this.#offers.find((off) => off.type === point.type);
    const pointPresenter = new PointPresenter({
      point: { ...point, offer },
      destinations: this.#destinations,
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
    render(new ListFiltersView(), this.#headerContainer);
    render(new ListSortView(), this.#mainContainer);

    this.#eventsComponents = new ListEventsView();
    render(this.#eventsComponents, this.#mainContainer);

    this.#renderPoints(this.#eventsComponents.element);
  }
}
