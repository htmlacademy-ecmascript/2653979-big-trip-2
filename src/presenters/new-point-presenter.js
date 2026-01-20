import { remove, render, RenderPosition } from '../framework/render.js';
import EventFormView from '../view/event-form-view';
import { UserAction, UpdateType } from '../const';
import { createEmptyPoint } from '../utils.js';

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

  setSaving() {
    this.#pointEditComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    const resetFormState = () => {
      this.#pointEditComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#pointEditComponent.shake(resetFormState);
  }

  init() {
    if (this.#pointEditComponent !== null) {
      return;
    }

    const emptyPoint = createEmptyPoint(this.#allDestinations);
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
}
