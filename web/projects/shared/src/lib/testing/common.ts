import { signal, Signal, ValueProvider, WritableSignal } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';
import { vi } from 'vitest';

export type MockSignalStore<S extends ReturnType<typeof signalStore>> = {
  [prop in keyof InstanceType<S>]?: InstanceType<S>[prop] extends Signal<infer U> ? WritableSignal<U> : never
};

export const provideMockDispatcher = (): ValueProvider => {
  return {
    provide: Dispatcher,
    useValue: {
      dispatch: vi.fn(),
    },
  };
};

export const provideMockSignalStore = <S extends ReturnType<typeof signalStore>>(store: S, ...propertiesToMock: (keyof InstanceType<S>)[]): ValueProvider => {
  const mockStore = propertiesToMock.reduce((accumulator, currentValue) => {
    return {
      ...accumulator,
      [currentValue]: signal(undefined),
    };
  }, {}) as S;

  return {
    provide: store,
    useValue: mockStore,
  } ;
};
