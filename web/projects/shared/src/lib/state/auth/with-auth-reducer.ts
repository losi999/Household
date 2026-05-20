import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';
import { AuthState } from './auth-store';
import { authEvents } from './auth-events';

export const withAuthReducer = () => {
  return signalStoreFeature(
    withReducer<AuthState>(
      on(authEvents.logInCompleted, ({ payload }) => {
        return {
          idToken: payload.idToken,
          refreshToken: payload.refreshToken,
          userTypes: payload.userTypes,
        };        
      }), 
      on(authEvents.logOut, () => {
        return {
          idToken: undefined,
          refreshToken: undefined,
          userTypes: undefined,
        };
      }),
    ),
  );
};
