import AbstractView from '../framework/view/abstract-view';
import { FILTER_TYPES, LAOD_STATUS } from '../const';

const noPointsTextType = {
  [FILTER_TYPES.EVERYTHING]: 'Click New Event to create your first point',
  [FILTER_TYPES.FUTURE]: 'There are no future events now',
  [FILTER_TYPES.PAST]: 'There are no past events now',
  [FILTER_TYPES.PRESENT]: 'There are no present events now',
  [LAOD_STATUS.LOAD_FAILED]: 'Failed to load latest route information',
  [LAOD_STATUS.LOAD]: 'Loading...',
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
