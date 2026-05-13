import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';
import { ProgressState } from './progress-store';
import { progressEvents } from './progress-events';

export const withProgressReducer = () => {
  return signalStoreFeature(
    withReducer<ProgressState>(
      on(progressEvents.processStarted, () => {
        return (state) => {
          return {
            count: state.count + 1,
          };
        };
      }), 
      on(progressEvents.processFinished, () => {
        return (state) => {
          return {
            count: Math.max(state.count - 1, 0),
          };
        };
      }),
    ),
  );
};
