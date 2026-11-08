import { TestBed } from '@angular/core/testing';
import { signalStore, withState } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';
import { selectionEvents } from './selection-events';
import { SelectionState } from './selection-store';
import { withSelectionReducer } from './with-selection-reducer';

const createTestStore = (state: SelectionState) => {
  return signalStore({
    providedIn: 'root',
  }, withState<SelectionState>(state), withSelectionReducer());
};

describe('withSelectionReducer', () => {
  let initialState: SelectionState;
  let store: InstanceType<ReturnType<typeof createTestStore>>;
  let dispatcher: Dispatcher;

  const validateState = (currentValue?: Partial<SelectionState>) => {
    expect(store.selectedItems(), 'selectedItems').toEqual(Object.hasOwn(currentValue ?? {}, 'selectedItems') ? currentValue.selectedItems : initialState.selectedItems);
  };

  const setup = (initial?: Partial<SelectionState>) => {
    TestBed.resetTestingModule();

    initialState = {
      selectedItems: {},
      ...initial,
    };

    store = TestBed.inject(createTestStore(initialState));
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('itemSelected', () => {
    it('should store the item under the selection id', () => {
      const item = {
        name: 'selected',
      };

      dispatcher.dispatch(selectionEvents.itemSelected({
        selectionId: 'account',
        item,
      }));

      validateState({
        selectedItems: {
          account: item,
        },
      });
    });

    it('should replace the item of the same selection and keep the other selections', () => {
      const otherItem = {
        name: 'other',
      };
      setup({
        selectedItems: {
          account: {
            name: 'previous',
          },
          transferAccount: otherItem,
        },
      });
      const item = {
        name: 'selected',
      };

      dispatcher.dispatch(selectionEvents.itemSelected({
        selectionId: 'account',
        item,
      }));

      validateState({
        selectedItems: {
          account: item,
          transferAccount: otherItem,
        },
      });
    });
  });
});
