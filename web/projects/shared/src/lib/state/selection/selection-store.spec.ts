import { TestBed } from '@angular/core/testing';
import { selectionEvents, SelectionStore } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';

// The behavior of the reducer is covered in with-selection-reducer.spec.ts. This spec only verifies that the store
// provides its initial state and has the reducer wired in.
describe('Selection store', () => {
  let store: InstanceType<typeof SelectionStore>;
  let dispatcher: Dispatcher;

  const setup = () => {
    TestBed.resetTestingModule();

    store = TestBed.inject(SelectionStore);
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  it('should initialize with nothing selected', () => {
    expect(store.selectedItems()).toEqual({});
  });

  it('should have the reducer wired in', () => {
    const item = {
      name: 'selected',
    };

    dispatcher.dispatch(selectionEvents.itemSelected({
      selectionId: 'account',
      item,
    }));

    expect(store.selectedItems()).toEqual({
      account: item,
    });
  });
});
