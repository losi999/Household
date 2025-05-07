import { Auth, User } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const authActions = createActionGroup({
  source: 'Auth',
  events: {
    'Log in initiated': props<Auth.Login.Request>(),
    'Tokens retrieved': props<Auth.Login.Response>(),
    'Log in completed': emptyProps(),
    'Confirm user initiated': props<Auth.ConfirmUser.Request & User.Email>(),
    'Confirm user completed': emptyProps(),
    'Log out': emptyProps(),
  },
});
