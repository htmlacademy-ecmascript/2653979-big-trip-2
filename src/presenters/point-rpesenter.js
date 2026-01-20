import EventFormView from '../view/event-form-view.js';
import EventItemView from '../view/event-item-view.js';
import { render, replace } from '../framework/render.js';
import { UpdateType, UserAction } from '../const.js';

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
    window.removeEventListener('keydown', this.#escKeyDownHandler);
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
    window.addEventListener('keydown', this.#escKeyDownHandler);
    replace(this.#eventFormComponent, this.#eventItemComponent);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #replaceFormToItem() {
    window.removeEventListener('keydown', this.#escKeyDownHandler);
    replace(this.#eventItemComponent, this.#eventFormComponent);
    this.#mode = Mode.DEFAULT;
  }

  #handleOpenFormClick = () => {
    this.#replaceItemToForm();
  };

  #handleFavoriteClick = () => {
    this.#point.isFavorite = !this.#point.isFavorite;
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      this.#point);
  };

  #handleCloseFormClick = () => {
    this.#replaceFormToItem();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      window.removeEventListener('keydown', this.#escKeyDownHandler);
      this.#replaceFormToItem();
    }
  };

  #handleDeleteClick = (point) =>{
    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point,
    );
  };

  #handleSaveClick = (point) =>{
    window.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#point = point;
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      this.#point,
    );
  };

  setSaving() {
    if (this.#mode === Mode.EDITING) {
      this.#eventFormComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING) {
      this.#eventFormComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    if (this.#mode === Mode.DEFAULT) {
      this.#eventItemComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#eventFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#eventFormComponent.shake(resetFormState);
  }

  init() {
    let prevEventItemComponent = this.#eventItemComponent;
    let prevEventFormComponent = this.#eventFormComponent;

    this.#eventItemComponent = new EventItemView(
      this.#point,
      this.#allDestinations,
      this.#allOffers,
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
        onFormSubmit: this.#handleSaveClick,
        onDeletePoint: this.#handleDeleteClick,
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
