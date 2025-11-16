
import MainPresenter from './presenters/main-presenter';

const siteHeader = document.querySelector('.page-header');
const siteMain = document.querySelector('.page-main');

const mainPresenter = new MainPresenter({
  headerContainer: siteHeader.querySelector('.trip-controls__filters'),
  mainContainer: siteMain.querySelector('.trip-events'),
  eventContainer: siteMain.querySelector('.trip-events')
});

mainPresenter.init();
