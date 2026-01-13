import EventFormView from '../view/event-form-view.js';
import EventItemView from '../view/event-item-view.js';
import { render, replace } from '../framework/render.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #point = null;
  #allDestinations = [];
  #allOffers = [];
  #container = null;
  #eventItemComponent = null;
  #eventFormComponent = null;
  #handleDataChange = null;
  #handleModeChange = null;
  #mode = Mode.DEFAULT;

  constructor({ point, container, allDestinations, allOffers, handlers }) {
    this.#point = point;
    this.#allDestinations = allDestinations;
    this.#allOffers = allOffers;
    this.#container = container;
    this.#handleDataChange = handlers.onDataChange;
    this.#handleModeChange = handlers.onModeChange;
  }

  destroy() {
    if (this.#eventItemComponent) {
      this.#eventItemComponent.element.remove();
    }
    if (this.#eventFormComponent) {
      this.#eventFormComponent.element.remove();
    }
    this.#eventItemComponent = null;
    this.#eventFormComponent = null;
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#eventFormComponent.reset(this.#point);
      this.#replaceFormToItem();
    }
  }

  #replaceItemToForm() {
    replace(this.#eventFormComponent, this.#eventItemComponent);
    window.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #replaceFormToItem() {
    replace(this.#eventItemComponent, this.#eventFormComponent);
    window.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #handleOpenFormClick = () => {
    this.#replaceItemToForm();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange({
      ...this.#point,
      destination: this.#point.destination.id,
      isFavorite: !this.#point.isFavorite
    });
  };

  #handleCloseFormClick = () => {
    this.#replaceFormToItem();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#replaceFormToItem();
      window.removeEventListener('keydown', this.#escKeyDownHandler);
    }
  };

  #handleFormSubmit = (updatedPoint) => {
    this.#handleDataChange(updatedPoint);
  };

  init() {
    let prevEventItemComponent = this.#eventItemComponent;
    let prevEventFormComponent = this.#eventFormComponent;

    this.#eventItemComponent = new EventItemView(
      this.#point,
      {
        onOpenClick: this.#handleOpenFormClick,
        onFavoriteClick: this.#handleFavoriteClick,
      }
    );

    this.#eventFormComponent = new EventFormView(
      this.#point,
      this.#allDestinations,
      this.#allOffers,
      {
        onCloseClick: this.#handleCloseFormClick,
        onFormSubmit: this.#handleFormSubmit,
      }
    );

    if (prevEventItemComponent === null || prevEventFormComponent === null) {
      render(this.#eventItemComponent, this.#container);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#eventItemComponent, prevEventItemComponent);
    }
    if (this.#mode === Mode.EDITING) {
      replace(this.#eventFormComponent, prevEventFormComponent);
    }

    prevEventItemComponent = null;
    prevEventFormComponent = null;
  }
}
