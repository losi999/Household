import { signalStore, withState } from '@ngrx/signals';
import { withSelectionReducer } from './with-selection-reducer';

export type SelectionState = {
  // The key is the id of the selection, the value is the item selected for it. A state key that is not in the
  // initial state cannot be added later, so the selections are kept in one property instead of at the root.
  selectedItems: Record<string, object>;
};

export const SelectionStore = signalStore({
  providedIn: 'root',
},
withState<SelectionState>({
  selectedItems: {},
}),
withSelectionReducer(),
);
