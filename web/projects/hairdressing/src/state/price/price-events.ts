
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const priceEvents = eventGroup({
  source: 'Price',
  events: {
    createPrice: type<void>(),
    updatePrice: type<Api.Price.PriceId& Responses.Price>(),
    deletePrice: type<Responses.Price>(),
    openPriceListItemSubmenu: type<Responses.Price>(),
  },
});

export const priceApiEvents = eventGroup({
  source: 'Price API',
  events: {
    listPricesInitiated: type<void>(),
    listPricesCompleted: type<Responses.Price[]>(),
    createPriceInitiated: type<Requests.Price>(),
    createPriceCompleted: type<Api.Price.PriceId & Requests.Price>(),
    updatePriceInitiated: type<Api.Price.PriceId & Requests.Price>(),
    updatePriceCompleted: type<Api.Price.PriceId & Requests.Price>(),
    updatePriceFailed: type<Api.Price.PriceId>(),
    deletePriceInitiated: type<Api.Price.PriceId>(),
    deletePriceCompleted: type<Api.Price.PriceId>(),
    deletePriceFailed: type<Api.Price.PriceId>(),
  },
});

