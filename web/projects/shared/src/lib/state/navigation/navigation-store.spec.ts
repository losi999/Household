import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { navigationEvents, createDispatcherSpy, NavigationStore, authEvents } from '@household/shared-ui';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { Mock } from 'vitest';

describe('Navigation store', () => {
  let store: InstanceType<typeof NavigationStore>;
  let dispatcher: Dispatcher;
  let mockRouter: MockService<Router>;
  let mockActivatedRoute: MockService<ActivatedRoute>;
  let dispatchSpy: Mock;

  beforeEach(() => {
    mockRouter = createMockService('navigate');
    mockActivatedRoute = createMockService();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: mockRouter.service,
        },
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute.service,
        },
      ],
    });

    store = TestBed.inject(NavigationStore);
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize', () => {
    expect(store).toBeDefined();
  });

  describe('dispatching changeCalendarWeek', () => {
    it('should navigate', () => {
      const year = 2026;
      const week = 23;
      dispatcher.dispatch(navigationEvents.changeCalendarWeek({
        year,
        week,
      }));

      validateFunctionCall(mockRouter.functions.navigate, [], {
        relativeTo: mockActivatedRoute.service,
        queryParams: {
          year,
          week,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('dispatching loggedInHomepage', () => {
    it('should navigate', () => {
      dispatcher.dispatch(navigationEvents.loggedInHomepage());

      validateFunctionCall(mockRouter.functions.navigate, ['/'], {
        replaceUrl: true,
      });
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('dispatching logInCompleted', () => {
    it('should navigate', () => {
      dispatcher.dispatch(authEvents.logInCompleted(undefined));

      validateFunctionCall(mockRouter.functions.navigate, ['/'], {
        replaceUrl: true,
      });
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('dispatching logOut', () => {
    it('should navigate', () => {
      dispatcher.dispatch(authEvents.logOut());

      validateFunctionCall(mockRouter.functions.navigate, [
        '/',
        'login',
      ], {
        replaceUrl: true,
      });
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('dispatching loggedOutHomepage', () => {
    it('should navigate', () => {
      dispatcher.dispatch(navigationEvents.loggedOutHomepage());

      validateFunctionCall(mockRouter.functions.navigate, [
        '/',
        'login',
      ], {
        replaceUrl: true,
      });
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });
  });
});
