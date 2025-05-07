import { User } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { userApiActions } from '@household/web/state/user/user.actions';

export const userReducer = createReducer<User.Response[]>([],
  on(userApiActions.listUsersCompleted, (_state, { users }) => {
    return users;
  }),
  on(userApiActions.createUserCompleted, (_state, { email }) => {

    return _state.concat({
      email,
      status: 'FORCE_CHANGE_PASSWORD',
    })
      .toSorted((a, b) => a.email.localeCompare(b.email, 'hu', {
        sensitivity: 'base',
      }));
  }),

  on(userApiActions.deleteUserCompleted, (_state, { email }) => {
    return _state.filter(u => u.email !== email);
  }),
);
