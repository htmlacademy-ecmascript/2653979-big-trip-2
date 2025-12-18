
import EventFormView from '../view/event-form-view.js';
import EventItemView from '../view/event-item-view.js';
import { render, replace } from '../framework/render.js';

export default class PointPresenter {
  #point = null;
  #destinations = null;
  #container = null;
  #eventItemComponent = null;
  #eventFormComponent = null;

  constructor({ point, destinations, container }) {
    this.#point = point;
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

  #handleItemClick = () => {
    this.#replaceItemToForm();
  };

  #handleFormClick = () => {
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
      ...this.#point,
      allDestinations: this.#destinations,
      onClick: this.#handleItemClick,
    });

    this.#eventFormComponent = new EventFormView({
      ...this.#point,
      allDestinations: this.#destinations,
      onClick: this.#handleFormClick,
    });

    render(this.#eventItemComponent, this.#container);
  }
}
