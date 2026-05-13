import { priceApiEvents } from '@hairdressing/state/price/price-events';
import { PriceState } from '@hairdressing/state/price/price-store';
import { toSearchTerms } from '@household/shared/common/utils';
import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';

export const withPriceReducer = () => {
  return signalStoreFeature(
    withReducer<PriceState>(
      on(priceApiEvents.listPricesCompleted, ({ payload }) => {
        return {
          priceList: payload.map(p => {
            return {
              ...p,
              searchTerms: toSearchTerms(p.name),
            };
          }),
        };
      }),
      on(priceApiEvents.updatePriceInitiated, priceApiEvents.deletePriceInitiated, ({ payload: { priceId } }) => {
        return (state) => {
          return {
            isInProgress: [
              ...state.isInProgress,
              priceId,
            ],
          };
        };
      }),
      on(priceApiEvents.updatePriceCompleted, priceApiEvents.deletePriceCompleted, priceApiEvents.updatePriceFailed, priceApiEvents.deletePriceFailed, ({ payload: { priceId } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => id !== priceId),
          };
        };
      }),
      on(priceApiEvents.createPriceCompleted, priceApiEvents.updatePriceCompleted, ({ payload: { priceId, name, amount, unitOfMeasurement } }) => {
        return (state) => {
          return {
            priceList: state.priceList.filter(p => p.priceId !== priceId)
              .concat({
                priceId,
                name,
                amount,
                unitOfMeasurement,
              })
              .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
                sensitivity: 'base',
              })),
          };
        };
      }),
      on(priceApiEvents.deletePriceCompleted, ({ payload: { priceId } }) => {
        return (state) => {
          return {
            priceList: state.priceList.filter(p => p.priceId !== priceId),
          };
        };
      }),
    ),
  );
};
