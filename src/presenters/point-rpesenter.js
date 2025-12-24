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
  #container = null;
  #eventItemComponent = null;
  #eventFormComponent = null;
  #handleDataChange = null;
  #handleModeChange = null;
  #mode = Mode.DEFAULT;

  constructor({ point, container, allDestinations, events }) {
    this.#point = point;
    this.#allDestinations = allDestinations;
    this.#container = container;
    this.#handleDataChange = events.onDataChange;
    this.#handleModeChange = events.onModeChange;
  }

  destroy() {
    this.#eventItemComponent = null;
    this.#eventFormComponent = null;
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
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
    const destinationId = this.#point.destination.id || this.#point.destination;

    this.#handleDataChange({
      ...this.#point,
      destination: destinationId,
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

  init(point) {
    if (point) {
      this.#point = point;
    }

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
      {
        onCloseClick: this.#handleCloseFormClick,
      },
      this.#allDestinations
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
