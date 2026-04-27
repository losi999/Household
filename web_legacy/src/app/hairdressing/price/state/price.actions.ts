import { Price } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const priceActions = createActionGroup({
  source: 'Price',
  events: {
    'Create price': emptyProps(),
    'Update price': props<Price.PriceId & Price.Response>(),
    'Delete price': props<Price.Response>(),
    'Open price list item submenu': props<Price.Response>(),
  },
});

export const priceApiActions = createActionGroup({
  source: 'Price API',
  events: {
    'List prices initiated': emptyProps(),
    'List prices completed': props<{prices: Price.Response[]}>(),
    'Create price initiated': props<Price.Request>(),
    'Create price completed': props<Price.PriceId & Price.Request>(),
    'Update price initiated': props<Price.PriceId & Price.Request>(),
    'Update price completed': props<Price.PriceId & Price.Request>(),
    'Delete price initiated': props<Price.PriceId>(),
    'Delete price completed': props<Price.PriceId>(),
    'Delete price failed': props<Price.PriceId>(),
  },
});
