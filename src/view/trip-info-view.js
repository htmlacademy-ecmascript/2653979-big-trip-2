import dayjs from 'dayjs';
import AbstractView from '../framework/view/abstract-view';
import { TYPES } from '../mock/const';

function createTripInfoTemplate(points, allDestinations) {
  let totalPrice = 0;
  let routeString = '';
  const destinationNames = [];
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const { type, offers: selectedOfferIds, basePrice, destination: destinationId } = point;

    const destination = allDestinations.find((dest) => dest.id === destinationId);
    if (destination.name){
      destinationNames.push(destination.name);
    }

    totalPrice += basePrice;
    if (selectedOfferIds && selectedOfferIds.length > 0) {
      const offersForType = TYPES[type];

      if (offersForType) {
        selectedOfferIds.forEach((offerId) => {
          const selectedOffer = offersForType.find((offer) => offer.id === offerId);
          if (selectedOffer) {
            totalPrice += selectedOffer.price;
          }
        });
      }
    }
  }

  const uniqueNames = [];
  for (let i = 0; i < destinationNames.length; i++) {
    if (i === 0 || destinationNames[i] !== destinationNames[i - 1]) {
      uniqueNames.push(destinationNames[i]);
    }
  }
  routeString = uniqueNames.length > 0 ? uniqueNames.join(' — ') : '';


  let datesString = '';
  if (points.length > 0) {
    const sortedPoints = [...points].sort((a, b) =>
      new Date(a.dateFrom) - new Date(b.dateFrom)
    );
    const firstDate = sortedPoints[0].dateFrom;
    const lastDate = sortedPoints[sortedPoints.length - 1].dateTo;
    const firstFormatted = dayjs(firstDate).format('D MMM YYYY');
    const lastFormatted = dayjs(lastDate).format('D MMM YYYY');

    datesString = `${firstFormatted}&nbsp;—&nbsp;${lastFormatted}`;
  }
  return `
  <section class="trip-main__trip-info  trip-info">
            <div class="trip-info__main">
              <h1 class="trip-info__title">${routeString}</h1>
              <p class="trip-info__dates">${datesString}</p>
            </div>
            <p class="trip-info__cost">
              Total: €&nbsp;<span class="trip-info__cost-value">${totalPrice}</span>
            </p>
          </section>
              `;
}

export default class TripInfoView extends AbstractView {
  #points = [];
  #destinations = [];
  constructor(points, allDestinations) {
    super();
    this.#points = points;
    this.#destinations = allDestinations;
  }

  get template() {
    return createTripInfoTemplate(this.#points, this.#destinations);
  }
}
