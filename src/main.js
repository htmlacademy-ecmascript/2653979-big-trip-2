import MainPresenter from './presenters/main-presenter';
import PointModel from './model/point-model.js';

const pointModel = new PointModel();

const headerElement = document.querySelector('.page-header');
const mainElement = document.querySelector('.page-main');
const tripMainElement = headerElement.querySelector('.trip-main');
const eventsElement = mainElement.querySelector('.trip-events');

const mainPresenter = new MainPresenter({
  headerContainer: tripMainElement,
  mainContainer: eventsElement,
  pointModel,
});

mainPresenter.init();
