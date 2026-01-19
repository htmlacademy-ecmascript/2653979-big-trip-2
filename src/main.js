import MainPresenter from './presenters/main-presenter';
import PointModel from './model/point-model.js';
import FilterModel from './model/filter-model.js';
import PointApiService from './point-api-service.js';

const AUTHORIZATION = 'Basic kgred35EFscb3j';
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

const pointModel = new PointModel(
  new PointApiService(END_POINT, AUTHORIZATION)
);
const filterModel = new FilterModel();

const headerElement = document.querySelector('.page-header');
const mainElement = document.querySelector('.page-main');
const tripMainElement = headerElement.querySelector('.trip-main');
const eventsElement = mainElement.querySelector('.trip-events');

const mainPresenter = new MainPresenter({
  headerContainer: tripMainElement,
  mainContainer: eventsElement,
  pointModel,
  filterModel,
});

pointModel.init();
mainPresenter.init();
