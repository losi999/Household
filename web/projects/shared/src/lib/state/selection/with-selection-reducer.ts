import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';
import { selectionEvents } from './selection-events';
import { SelectionState } from './selection-store';

export const withSelectionReducer = () => {
  return signalStoreFeature(
    withReducer<SelectionState>(
      on(selectionEvents.itemSelected, ({ payload: { selectionId, item } }) => {
        return (state) => {
          return {
            selectedItems: {
              ...state.selectedItems,
              [selectionId]: item,
            },
          };
        };
      }),
    ),
  );
};
