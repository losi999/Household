
import { Price } from '@household/shared/types/types';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const priceEvents = eventGroup({
  source: 'Price',
  events: {
    createPrice: type<void>(),
    updatePrice: type<Price.PriceId& Price.Response>(),
    deletePrice: type<Price.Response>(),
    openPriceListItemSubmenu: type<Price.Response>(),
  },
});

export const priceApiEvents = eventGroup({
  source: 'Price API',
  events: {
    listPricesInitiated: type<void>(),
    listPricesCompleted: type<Price.Response[]>(),
    createPriceInitiated: type<Price.Request>(),
    createPriceCompleted: type<Price.PriceId & Price.Request>(),
    updatePriceInitiated: type<Price.PriceId & Price.Request>(),
    updatePriceCompleted: type<Price.PriceId & Price.Request>(),
    updatePriceFailed: type<Price.PriceId>(),
    deletePriceInitiated: type<Price.PriceId>(),
    deletePriceCompleted: type<Price.PriceId>(),
    deletePriceFailed: type<Price.PriceId>(),
  },
});

