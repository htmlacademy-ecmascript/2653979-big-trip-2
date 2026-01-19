import AbstractView from '../framework/view/abstract-view';

function createNewPointButtonTemplate() {
  return '<button class="trip-main__event-add-btn  btn  btn--big  btn--yellow" type="button">New event</button>';
}

export default class NewPointButton extends AbstractView {
  #handleClick = null;
  #isDisabled = false;

  constructor(onClick) {
    super();
    this.#handleClick = onClick;
    this.element.addEventListener('click', this.#clickHandler);
  }

  #clickHandler = (evt) => {
    evt.preventDefault();
    if (!this.#isDisabled) {
      this.#handleClick();
    }
  };

  setDisabled(isDisabled) {
    this.#isDisabled = isDisabled;
    this.element.disabled = isDisabled;
    if (isDisabled) {
      this.element.classList.add('disabled');
    } else {
      this.element.classList.remove('disabled');
    }
  }

  get template() {
    return createNewPointButtonTemplate();
  }
}
