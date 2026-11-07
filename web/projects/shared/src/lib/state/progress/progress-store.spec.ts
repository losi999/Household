import { TestBed } from '@angular/core/testing';
import { ProgressStore, progressEvents } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';

// The behavior of the reducer is covered in with-progress-reducer.spec.ts. This spec only verifies that the store
// provides its initial state and has the reducer wired in.
describe('Progress store', () => {
  let store: InstanceType<typeof ProgressStore>;
  let dispatcher: Dispatcher;

  const setup = () => {
    TestBed.resetTestingModule();

    store = TestBed.inject(ProgressStore);
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  it('should initialize with the default state', () => {
    expect(store.count()).toBe(0);
    expect(store.isInProgress()).toBe(false);
  });

  it('should have the reducer wired in', () => {
    dispatcher.dispatch(progressEvents.processStarted());

    expect(store.count()).toBe(1);
    expect(store.isInProgress()).toBe(true);
  });
});
