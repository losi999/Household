import { UserType } from '@household/shared/enums';
import { Auth, User } from '@household/shared/types/types';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const authEvents = eventGroup({
  source: 'Auth',
  events: {
    logInInitiated: type<Auth.Login.Request & {
      requiredUserType?: UserType;
    }>(),
    tokensRetrieved: type<Auth.Login.Response>(),
    logInCompleted: type<void>(),
    confirmUserInitiated: type<Auth.ConfirmUser.Request & User.Email>(),
    confirmUserCompleted: type<void>(),
    logOut: type<void>(),
  },
});

export const authApiEvents = eventGroup({
  source: 'Auth API',
  events: {
    refreshTokenInitiated: type<void>(),
  },
});
