import AbstractView from '../framework/view/abstract-view';
import { FILTER_TYPES } from '../const';

const noPointsTextType = {
  [FILTER_TYPES.EVERYTHING]: 'Click New Event to create your first point',
  [FILTER_TYPES.FUTURE]: 'There`s nothing to do for the future',
  [FILTER_TYPES.PAST]: 'There are no cases left in the past',
  [FILTER_TYPES.PRESENT]: 'There are no cases in the present',
};

function createNoPointsTemplate(filterType) {
  const noPointsTextValue = noPointsTextType[filterType];

  return (
    `<p class="trip-events__msg">${noPointsTextValue}</p>`
  );
}

export default class NoPointsView extends AbstractView {
  #filterType = null;

  constructor({filterType}) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createNoPointsTemplate(this.#filterType);
  }
}
