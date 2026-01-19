import { remove, render, RenderPosition } from '../framework/render.js';
import EventFormView from '../view/event-form-view';
import { UserAction, UpdateType } from '../const';

export default class NewPointPresenter {
  #pointListContainer = null;
  #handleViewAction = null;
  #handleDestroy = null;
  #allOffers = [];
  #allDestinations = [];

  #pointEditComponent = null;

  constructor({ pointListContainer, offers, destinations, onViewAction, onDestroy }) {
    this.#pointListContainer = pointListContainer;
    this.#handleViewAction = onViewAction;
    this.#handleDestroy = onDestroy;
    this.#allOffers = offers;
    this.#allDestinations = destinations;
  }

  destroy() {
    if (this.#pointEditComponent === null) {
      return;
    }

    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#handleDestroy();
  }

  #handleFormSubmit = (point) => {
    this.#handleViewAction(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point
    );
    this.destroy();
  };

  #handleDeleteClick = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };

  init() {
    if (this.#pointEditComponent !== null) {
      return;
    }

    const emptyPoint = this.#createEmptyPoint();

    this.#pointEditComponent = new EventFormView(
      emptyPoint,
      this.#allDestinations,
      this.#allOffers,
      {
        onCloseClick: this.#handleDeleteClick,
        onFormSubmit: this.#handleFormSubmit,
        onDeletePoint: this.#handleDeleteClick,
      }
    );

    render(this.#pointEditComponent, this.#pointListContainer, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #createEmptyPoint() {
    const defaultType = 'flight';

    const defaultDestination = this.#allDestinations[0] || {
      id: '',
      name: '',
      description: '',
      pictures: []
    };

    return {
      id: crypto.randomUUID(),
      type: defaultType,
      destination: defaultDestination,
      dateFrom: new Date(),
      dateTo: new Date(Date.now() + 3600000),
      basePrice: 0,
      offers: [],
      isFavorite: false
    };
  }
}
