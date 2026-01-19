import Observable from '../framework/observable';
import { FILTER_TYPES } from '../const';

export default class FilterModel extends Observable {
  #filter = FILTER_TYPES.EVERYTHING;

  get filter() {
    return this.#filter;
  }

  setFilter(updateType, filter) {
    this.#filter = filter;
    this._notify(updateType, filter);
  }
}
