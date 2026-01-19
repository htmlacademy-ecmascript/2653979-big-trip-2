// import ListFiltersView from '../view/list-filters-view.js';
import FilterPresenter from './filter-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import ListSortView from '../view/list-sort-view.js';
import ListEventsView from '../view/list-events-view.js';
import PointPresenter from '../presenters/point-rpesenter.js';
import TripInfoView from '../view/trip-info-view.js';
import NoPointsView from '../view/no-point-view.js';
import NewPointButton from '../view/new-point-button.js';

import { render, replace } from '../framework/render.js';
import { filter, sortPointDay, sortPointTime, sortPointPrice } from '../utils.js';
import { FILTER_TYPES, SortType, UpdateType, UserAction } from '../const.js';

export default class MainPresenter {
  #headerContainer = null;
  #mainContainer = null;

  #eventsComponents = [];
  #points = [];
  #destinations = [];
  #offers = [];
  #pointPresenters = new Map();
  #currentFilterType = FILTER_TYPES.EVERYTHING;
  #currentSortType = SortType.DAY;
  #tripFilterElement = null;
  #tripInfoComponent = null;
  #sortComponent = null;
  #noPointsComponent = null;
  #pointModel = null;
  #filterModel = null;
  #filterType = null;
  #newPointPresenter = null;
  #addNewButtonComponent = null;

  constructor({ headerContainer, mainContainer, pointModel, filterModel }) {
    this.#headerContainer = headerContainer;
    this.#mainContainer = mainContainer;
    this.#pointModel = pointModel;
    this.#filterModel = filterModel;

    this.#points = this.#pointModel.points;
    this.#destinations = this.#pointModel.destinations;
    this.#offers = this.#pointModel.offers;
    this.#currentFilterType = this.#filterModel.filter;

    this.#tripFilterElement = this.#headerContainer.querySelector('.trip-controls__filters');

    this.#pointModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }


  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointModel.points;
    const filteredPoints = filter[this.#filterType](points);

    switch (this.#currentSortType) {
      case SortType.DAY:
        filteredPoints.sort(sortPointDay);
        break;
      case SortType.TIME:
        filteredPoints.sort(sortPointTime);
        break;
      case SortType.PRICE:
        filteredPoints.sort(sortPointPrice);
        break;
      default:
        break;
    }

    return filteredPoints;
  }

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.#pointModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#rerenderPoints();
        break;
      case UpdateType.MAJOR:
        this.#rerenderPoints({ resetSortType: true });
        break;
      default:
        if (updateType === UpdateType.MAJOR) {
          this.#currentFilterType = this.#filterModel.filter;
          this.#rerenderPoints({ resetSortType: true });
        }
        break;
    }
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #renderNoPoints() {
    if (this.#eventsComponents && this.#eventsComponents.element) {
      this.#eventsComponents.element.remove();
      this.#eventsComponents = null;
    }

    if (this.#sortComponent) {
      this.#sortComponent.element.remove();
      this.#sortComponent = null;
    }

    this.#noPointsComponent = new NoPointsView({
      filterType: this.#currentFilterType,
    });

    render(this.#noPointsComponent, this.#mainContainer);
  }

  #rerenderPoints({ resetSortType = false } = {}) {
    this.#currentFilterType = this.#filterModel.filter;
    const filteredPoints = filter[this.#currentFilterType](this.#pointModel.points);
    if (this.#noPointsComponent) {
      this.#noPointsComponent.element.remove();
      this.#noPointsComponent = null;
    }

    if (filteredPoints.length === 0) {
      if (this.#sortComponent) {
        this.#sortComponent.element.remove();
        this.#sortComponent = null;
      }
      this.#renderNoPoints();
      return;
    }

    const sortedPoints = this.#sortPoints(filteredPoints, this.#currentSortType);

    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    if (this.#eventsComponents && this.#eventsComponents.element) {
      this.#eventsComponents.element.remove();
      this.#eventsComponents = null;
    }

    if (!this.#sortComponent) {
      this.#renderSort();
    }

    this.#eventsComponents = new ListEventsView();
    render(this.#eventsComponents, this.#mainContainer);

    sortedPoints.forEach((point) => {
      this.#renderPoint(point, this.#eventsComponents.element);
    });

    this.#updateTripInfo(sortedPoints);

    if (resetSortType) {
      this.#updateSortComponent();
    }
  }

  #updateSortComponent() {
    const prevSortComponent = this.#sortComponent;
    this.#sortComponent = new ListSortView({
      onSortTypeChange: this.#handleSortTypeChange,
      currentSortType: this.#currentSortType
    });

    if (prevSortComponent) {
      replace(this.#sortComponent, prevSortComponent);
    } else {
      render(this.#sortComponent, this.#mainContainer);
    }
  }

  #updateTripInfo(points = this.#points) {
    const newTripInfoComponent = new TripInfoView(points, this.#destinations);

    if (this.#tripInfoComponent === null) {
      render(newTripInfoComponent, this.#headerContainer, 'afterbegin');
      this.#tripInfoComponent = newTripInfoComponent;
      return;
    }
    replace(newTripInfoComponent, this.#tripInfoComponent);
    this.#tripInfoComponent = newTripInfoComponent;
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
      allOffers: this.#offers,
      container: tripList,
      handlers: {
        onDataChange: this.#handleViewAction,
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
        break;
    }

    return sortedPoints;
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    if (SortType[sortType.toLowerCase()]) {
      return;
    }

    this.#currentSortType = sortType;
    this.#handleModelEvent(UpdateType.MAJOR);
  };

  #renderSort() {
    this.#sortComponent = new ListSortView({
      onSortTypeChange: this.#handleSortTypeChange,
      currentSortType: this.#currentSortType
    });
    render(this.#sortComponent, this.#mainContainer);
  }

  #createNewPointHandler = () => {
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FILTER_TYPES.EVERYTHING);
    if (this.#noPointsComponent) {
      this.#noPointsComponent = null;
    }

    if (!this.#eventsComponents) {
      this.#eventsComponents = new ListEventsView();
      render(this.#eventsComponents, this.#mainContainer);
    }

    if (!this.#sortComponent) {
      this.#renderSort();
    }

    if (this.#addNewButtonComponent) {
      this.#addNewButtonComponent.setDisabled(true);
    }
    if (this.#eventsComponents && this.#eventsComponents.element) {
      this.#newPointPresenter = new NewPointPresenter({
        pointListContainer: this.#eventsComponents.element,
        offers: this.#pointModel.offers,
        destinations: this.#pointModel.destinations,
        onViewAction: this.#handleViewAction,
        onDestroy: this.#handleDestroyForm,
      });
    } else {
      this.#eventsComponents = new ListEventsView();
      render(this.#eventsComponents, this.#mainContainer);
    }
    this.#newPointPresenter.init();

  };

  #handleDestroyForm = () => {
    if (this.#addNewButtonComponent) {
      this.#addNewButtonComponent.setDisabled(false);
    }
    this.#currentSortType = SortType.DAY;
    this.#rerenderPoints({ resetSortType: true });
  };

  init() {
    this.#renderSort();

    this.#eventsComponents = new ListEventsView();
    render(this.#eventsComponents, this.#mainContainer);

    this.#handleModelEvent(UpdateType.MAJOR);

    this.#addNewButtonComponent = new NewPointButton(this.#createNewPointHandler);
    render(this.#addNewButtonComponent, this.#headerContainer);
    const filterPresenter = new FilterPresenter({
      filterContainer: this.#tripFilterElement,
      filterModel: this.#filterModel,
      pointModel: this.#pointModel
    });
    filterPresenter.init();
  }

}
