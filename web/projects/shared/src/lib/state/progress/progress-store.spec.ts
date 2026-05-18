import { TestBed } from '@angular/core/testing';
import { ProgressStore, progressEvents } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';

describe('Progress store', () => {
  let store: InstanceType<typeof ProgressStore>;
  let dispatcher: Dispatcher;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    store = TestBed.inject(ProgressStore);
    dispatcher = TestBed.inject(Dispatcher);
  });

  it('should initialize', () => {
    expect(store.count()).toBe(0);
    expect(store.isInProgress()).toBe(false);
  });

  describe('dispatching processStarted', () => {
    it('should increase the count', () => {
      dispatcher.dispatch(progressEvents.processStarted());

      expect(store.count()).toBe(1);
      expect(store.isInProgress()).toBe(true);
    });
  });

  describe('dispatching processFinished', () => {
    it('should decrease the count', () => {
      dispatcher.dispatch(progressEvents.processStarted());
      dispatcher.dispatch(progressEvents.processStarted());
      dispatcher.dispatch(progressEvents.processFinished());

      expect(store.count()).toBe(1);
      expect(store.isInProgress()).toBe(true);
    });

    it('should never deerease count below 0', () => {
      dispatcher.dispatch(progressEvents.processFinished());

      expect(store.count()).toBe(0);
      expect(store.isInProgress()).toBe(false);
    });
  });
});
