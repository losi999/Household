import { TestBed } from '@angular/core/testing';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore, withState } from '@ngrx/signals';
import { recipientApiEvents } from '@household/state/recipient/recipient-events';
import { RecipientState } from '@household/state/recipient/recipient-store';
import { withRecipientReducer } from '@household/state/recipient/with-recipient-reducer';
import { testDataFactory } from '@household/shared/common/test-data-factory';

const createTestStore = (state: RecipientState) => {
  return signalStore({
    providedIn: 'root',
  }, withState<RecipientState>(state), withRecipientReducer());
};

describe('withRecipientReducer', () => {
  let initialState: RecipientState;
  let store: InstanceType<ReturnType<typeof createTestStore>>;
  let dispatcher: Dispatcher;

  const validateState = (currentValue?: Partial<RecipientState>) => {
    expect(store.isInProgress(), 'isInProgress').toEqual(Object.hasOwn(currentValue ?? {}, 'isInProgress') ? currentValue.isInProgress : initialState.isInProgress);
    expect(store.recipientList(), 'recipientList').toEqual(Object.hasOwn(currentValue ?? {}, 'recipientList') ? currentValue.recipientList : initialState.recipientList);
  };

  const setup = (initial?: Partial<RecipientState>) => {
    TestBed.resetTestingModule();

    initialState = {
      isInProgress: [],
      recipientList: [],
      ...initial,
    };

    store = TestBed.inject(createTestStore(initialState));
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('listRecipientsCompleted', () => {
    it('should store the recipients with their search terms', () => {
      const name = 'ékezetes név';
      const recipientResponse = testDataFactory.recipient.response({
        name,
      });

      dispatcher.dispatch(recipientApiEvents.listRecipientsCompleted([recipientResponse]));

      validateState({
        recipientList: [
          {
            ...recipientResponse,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('createRecipientCompleted', () => {
    it('should add the recipient with its search terms', () => {
      const name = 'ékezetes név';
      const recipientId = testDataFactory.recipient.id();
      const recipientRequest = testDataFactory.recipient.request({
        name,
      });

      dispatcher.dispatch(recipientApiEvents.createRecipientCompleted({
        recipientId,
        ...recipientRequest,
      }));

      validateState({
        recipientList: [
          {
            recipientId,
            ...recipientRequest,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('updateRecipientInitiated', () => {
    it('should mark the recipient as in progress', () => {
      const originalRecipient = testDataFactory.recipient.response();
      const recipientRequest = testDataFactory.recipient.request();

      setup({
        recipientList: [originalRecipient],
      });

      dispatcher.dispatch(recipientApiEvents.updateRecipientInitiated({
        recipientId: originalRecipient.recipientId,
        ...recipientRequest,
      }));

      validateState({
        isInProgress: [originalRecipient.recipientId],
      });
    });
  });

  describe('updateRecipientCompleted', () => {
    it('should replace the recipient and clear its in progress flag', () => {
      const originalRecipient = testDataFactory.recipient.response();
      setup({
        isInProgress: [originalRecipient.recipientId],
        recipientList: [originalRecipient],
      });

      const name = 'ékezetes név';
      const recipientRequest = testDataFactory.recipient.request({
        name,
      });

      dispatcher.dispatch(recipientApiEvents.updateRecipientCompleted({
        recipientId: originalRecipient.recipientId,
        ...recipientRequest,
      }));

      validateState({
        isInProgress: [],
        recipientList: [
          {
            recipientId: originalRecipient.recipientId,
            ...recipientRequest,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('updateRecipientFailed', () => {
    it('should clear the in progress flag of the recipient', () => {
      const originalRecipient = testDataFactory.recipient.response();
      setup({
        isInProgress: [originalRecipient.recipientId],
        recipientList: [originalRecipient],
      });

      dispatcher.dispatch(recipientApiEvents.updateRecipientFailed({
        recipientId: originalRecipient.recipientId,
      }));

      validateState({
        isInProgress: [],
      });
    });
  });

  describe('deleteRecipientInitiated', () => {
    it('should mark the recipient as in progress', () => {
      const originalRecipient = testDataFactory.recipient.response();

      setup({
        recipientList: [originalRecipient],
      });

      dispatcher.dispatch(recipientApiEvents.deleteRecipientInitiated({
        recipientId: originalRecipient.recipientId,
      }));

      validateState({
        isInProgress: [originalRecipient.recipientId],
      });
    });
  });

  describe('deleteRecipientCompleted', () => {
    it('should remove the recipient and clear its in progress flag', () => {
      const originalRecipient = testDataFactory.recipient.response();
      setup({
        isInProgress: [originalRecipient.recipientId],
        recipientList: [originalRecipient],
      });

      dispatcher.dispatch(recipientApiEvents.deleteRecipientCompleted({
        recipientId: originalRecipient.recipientId,
      }));

      validateState({
        isInProgress: [],
        recipientList: [],
      });
    });
  });

  describe('deleteRecipientFailed', () => {
    it('should clear the in progress flag of the recipient', () => {
      const originalRecipient = testDataFactory.recipient.response();
      setup({
        isInProgress: [originalRecipient.recipientId],
        recipientList: [originalRecipient],
      });

      dispatcher.dispatch(recipientApiEvents.deleteRecipientFailed({
        recipientId: originalRecipient.recipientId,
      }));

      validateState({
        isInProgress: [],
      });
    });
  });

  describe('mergeRecipientsInitiated', () => {
    it('should mark the source recipients as in progress', () => {
      const targetRecipient = testDataFactory.recipient.response();
      const sourceRecipient = testDataFactory.recipient.response();

      setup({
        recipientList: [
          targetRecipient,
          sourceRecipient,
        ],
      });

      dispatcher.dispatch(recipientApiEvents.mergeRecipientsInitiated({
        sourceRecipientIds: [sourceRecipient.recipientId],
        targetRecipientId: targetRecipient.recipientId,
      }));

      validateState({
        isInProgress: [sourceRecipient.recipientId],
      });
    });
  });

  describe('mergeRecipientsCompleted', () => {
    it('should remove the source recipients and clear their in progress flags', () => {
      const sourceRecipient = testDataFactory.recipient.response();
      setup({
        isInProgress: [sourceRecipient.recipientId],
        recipientList: [sourceRecipient],
      });

      dispatcher.dispatch(recipientApiEvents.mergeRecipientsCompleted({
        sourceRecipientIds: [sourceRecipient.recipientId],
      }));

      validateState({
        isInProgress: [],
        recipientList: [],
      });
    });
  });

  describe('mergeRecipientsFailed', () => {
    it('should clear the in progress flags of the source recipients', () => {
      const sourceRecipient = testDataFactory.recipient.response();
      setup({
        isInProgress: [sourceRecipient.recipientId],
        recipientList: [sourceRecipient],
      });

      dispatcher.dispatch(recipientApiEvents.mergeRecipientsFailed({
        sourceRecipientIds: [sourceRecipient.recipientId],
      }));

      validateState({
        isInProgress: [],
      });
    });
  });
});
