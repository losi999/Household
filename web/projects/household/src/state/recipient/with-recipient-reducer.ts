import { recipientApiEvents } from '@household/state/recipient/recipient-events';
import { RecipientState } from '@household/state/recipient/recipient-store';
import { toSearchTerms } from '@household/shared/common/utils';
import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';

export const withRecipientReducer = () => {
  return signalStoreFeature(
    withReducer<RecipientState>(
      on(recipientApiEvents.listRecipientsCompleted, ({ payload }) => {
        return {
          recipientList: payload.map(p => {
            return {
              ...p,
              searchTerms: toSearchTerms(p.name),
            };
          }),
        };
      }),
      on(recipientApiEvents.updateRecipientInitiated, recipientApiEvents.deleteRecipientInitiated, ({ payload: { recipientId } }) => {
        return (state) => {
          return {
            isInProgress: [
              ...state.isInProgress,
              recipientId,
            ],
          };
        };
      }),
      on(recipientApiEvents.updateRecipientCompleted, recipientApiEvents.deleteRecipientCompleted, recipientApiEvents.updateRecipientFailed, recipientApiEvents.deleteRecipientFailed, ({ payload: { recipientId } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => id !== recipientId),
          };
        };
      }),
      on(recipientApiEvents.createRecipientCompleted, recipientApiEvents.updateRecipientCompleted, ({ payload: { recipientId, name } }) => {
        return (state) => {
          return {
            recipientList: state.recipientList.filter(p => p.recipientId !== recipientId)
              .concat({
                recipientId,
                name,
                searchTerms: toSearchTerms(name),
              })
              .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
                sensitivity: 'base',
              })),
          };
        };
      }),
      on(recipientApiEvents.deleteRecipientCompleted, ({ payload: { recipientId } }) => {
        return (state) => {
          return {
            recipientList: state.recipientList.filter(p => p.recipientId !== recipientId),
          };
        };
      }),
      on(recipientApiEvents.mergeRecipientsInitiated, ({ payload: { sourceRecipientIds } }) => {
        return (state) => {
          return {
            ...state,
            isInProgress: sourceRecipientIds,
          };
        };
      }),
      on(recipientApiEvents.mergeRecipientsCompleted, recipientApiEvents.mergeRecipientsFailed, ({ payload: { sourceRecipientIds } }) => {
        return (state) => {
          return {
            ...state,
            isInProgress: state.isInProgress.filter(p => !sourceRecipientIds.includes(p)),
          };
        };
      }),
      on(recipientApiEvents.mergeRecipientsCompleted, ({ payload: { sourceRecipientIds } }) => {
        return (state) => {
          return {
            ...state,
            recipientList: state.recipientList.filter(p => !sourceRecipientIds.includes(p.recipientId)),
          };
        };
      }),
    ),
  );
};
