import EventFormView from '../view/event-form-view.js';
import EventItemView from '../view/event-item-view.js';
import { render, replace } from '../framework/render.js';

export default class PointPresenter {
  #points = [];
  #destinations = [];
  #container = null;
  #eventItemComponent = null;
  #eventFormComponent = null;

  constructor({ point, destinations, container }) {
    this.#points = point;
    this.#destinations = destinations;
    this.#container = container;
  }

  #replaceItemToForm() {
    replace(this.#eventFormComponent, this.#eventItemComponent);
    window.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #replaceFormToItem() {
    replace(this.#eventItemComponent, this.#eventFormComponent);
    window.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #handleOpenFormClick = () => {
    this.#replaceItemToForm();
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

  init() {
    this.#eventItemComponent = new EventItemView({
      ...this.#points,
      allDestinations: this.#destinations,
    },
    {
      onClick: this.#handleOpenFormClick,
    }
    );

    this.#eventFormComponent = new EventFormView({
      ...this.#points,
      allDestinations: this.#destinations,
    },
    {
      onClick: this.#handleCloseFormClick,
    }
    );

    render(this.#eventItemComponent, this.#container);
  }
}
