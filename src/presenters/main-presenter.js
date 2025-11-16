import NewListControlView from '../view/trip-filters-view.js';
import NewListSortView from '../view/trip-list-sort-view.js';
import NewListEventsView from '../view/trip-events-list-view.js';
import NewEventView from '../view/trip-event-item-view.js';
import NewEventFormView from '../view/trip-event-form-view.js';

import { render } from '../render.js';

export default class MainPresenter {
  constructor({ headerContainer, mainContainer }) {
    this.headerContainer = headerContainer;
    this.mainContainer = mainContainer;
  }

  init() {
    render(new NewListControlView(), this.headerContainer);
    render(new NewListSortView(), this.mainContainer);

    const eventsContainer = new NewListEventsView();
    render(eventsContainer, this.mainContainer);

    render(new NewEventFormView(), eventsContainer.getElement());
    for (let i = 0; i < 3; i++) {
      render(new NewEventView(), eventsContainer.getElement());
    }
  }
}

