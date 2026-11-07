import { signal, Signal, ValueProvider, WritableSignal } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { Dispatcher, EventInstance } from '@ngrx/signals/events';
import { Mock, vi, expect } from 'vitest';
import { validateNthFunctionCall } from '@household/shared/common/unit-testing';

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

export const createDispatcherSpy = (dispatcher: Dispatcher) => {
  vi.restoreAllMocks();
  const originalDispatch = dispatcher.dispatch.bind(dispatcher);
  const dispatchSpy = vi.spyOn(dispatcher, 'dispatch');

  dispatchSpy.mockImplementationOnce(originalDispatch)
    .mockImplementation(() => undefined);

  return dispatchSpy;
};

export const validateDispatcher = (dispatchSpy?: Mock, ...events: EventInstance<string, any>[]) => {
  if (!events?.length) {
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  } else {
    events.forEach((event, index) => {
      validateNthFunctionCall(dispatchSpy, index + 2, event, undefined);
    });
    expect(dispatchSpy).toHaveBeenCalledTimes(events.length + 1);
  }
};

// Node's own experimental localStorage hides the one of jsdom and is undefined without a storage file
export const stubLocalStorage = () => {
  const data = new Map<string, string>();

  vi.stubGlobal('localStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, `${value}`);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    clear: () => {
      data.clear();
    },
  } satisfies Partial<Storage>);
};
