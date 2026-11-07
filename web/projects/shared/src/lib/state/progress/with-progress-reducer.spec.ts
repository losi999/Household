import { TestBed } from '@angular/core/testing';
import { signalStore, withState } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';
import { progressEvents } from './progress-events';
import { ProgressState } from './progress-store';
import { withProgressReducer } from './with-progress-reducer';

const createTestStore = (state: ProgressState) => {
  return signalStore({
    providedIn: 'root',
  }, withState<ProgressState>(state), withProgressReducer());
};

describe('withProgressReducer', () => {
  let initialState: ProgressState;
  let store: InstanceType<ReturnType<typeof createTestStore>>;
  let dispatcher: Dispatcher;

  const validateState = (currentValue?: Partial<ProgressState>) => {
    expect(store.count(), 'count').toEqual(Object.hasOwn(currentValue ?? {}, 'count') ? currentValue.count : initialState.count);
  };

  const setup = (initial?: Partial<ProgressState>) => {
    TestBed.resetTestingModule();

    initialState = {
      count: 0,
      ...initial,
    };

    store = TestBed.inject(createTestStore(initialState));
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('processStarted', () => {
    it('should increase the count', () => {
      setup({
        count: 1,
      });

      dispatcher.dispatch(progressEvents.processStarted());

      validateState({
        count: 2,
      });
    });
  });

  describe('processFinished', () => {
    it('should decrease the count', () => {
      setup({
        count: 2,
      });

      dispatcher.dispatch(progressEvents.processFinished());

      validateState({
        count: 1,
      });
    });

    it('should never decrease the count below 0', () => {
      dispatcher.dispatch(progressEvents.processFinished());

      validateState({
        count: 0,
      });
    });
  });
});
