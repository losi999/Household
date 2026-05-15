import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';
import { AuthState } from './auth-store';
import { authEvents } from './auth-events';
import { jwtDecode } from 'jwt-decode';
import { UserType } from '@aws-sdk/client-cognito-identity-provider';

export const withAuthReducer = () => {
  return signalStoreFeature(
    withReducer<AuthState>(
      on(authEvents.tokensRetrieved, ({ payload }) => {
        console.log('tokens retrieved', payload.idToken);
        return {
          idToken: payload.idToken,
          refreshToken: payload.refreshToken,
          userTypes: jwtDecode<{ 'cognito:groups'?: string[] }>(payload.idToken)['cognito:groups'] as UserType[],
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
