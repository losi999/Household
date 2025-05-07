import { User } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {} from '@ngrx/effects';

export const userApiActions = createActionGroup({
  source: 'User API',
  events: {
    'List users initiated': emptyProps(),
    'List users completed': props<{users: User.Response[]}>(),
    'Create user initiated': props<User.Request>(),
    'Create user completed': props<User.Request>(),
    'Delete user initiated': props<User.Request>(),
    'Delete user completed': props<User.Request>(),
  },
});
