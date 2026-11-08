import { TestBed } from '@angular/core/testing';
import { createDispatcherSpy, NotificationService, NotificationStore, notificationEvents, validateDispatcher } from '@household/shared-ui';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { Mock } from 'vitest';

// The event handlers are part of the store itself rather than a separate feature, so this spec covers them directly.
describe('Notification store', () => {
  let store: InstanceType<typeof NotificationStore>;
  let dispatcher: Dispatcher;
  let mockNotificationService: MockService<NotificationService>;
  let dispatchSpy: Mock;

  const setup = () => {
    TestBed.resetTestingModule();

    mockNotificationService = createMockService('showNotification');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService.service,
        },
      ],
    });

    store = TestBed.inject(NotificationStore);
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  it('should initialize', () => {
    expect(store).toBeDefined();
  });

  describe('dispatching showMessage', () => {
    it('should show notification', () => {
      const message = 'error message';
      dispatcher.dispatch(notificationEvents.showMessage(message));

      validateFunctionCall(mockNotificationService.functions.showNotification, message);
      validateDispatcher(dispatchSpy);
    });
  });
});
