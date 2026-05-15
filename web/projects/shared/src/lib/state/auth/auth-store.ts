import { patchState, signalStore, withComputed, withHooks, withState } from '@ngrx/signals';
import { withAuthEvents } from './with-auth-events';
import { withAuthReducer } from './with-auth-reducer';
import { computed } from '@angular/core';
import { UserType } from '@household/shared/enums';

export type AuthState = {
  idToken: string;
  refreshToken: string;
  userTypes: UserType[]
};

export const AuthStore = signalStore({
  providedIn: 'root',
},
withState<AuthState>({
  idToken: undefined,
  refreshToken: undefined,
  userTypes: [],
}),
withHooks({
  onInit(store) {
    patchState(store, {
      idToken: localStorage.getItem('idToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      userTypes: (localStorage.getItem('userTypes')?.split(',') ?? []) as UserType[],
    });
  },
}),
withAuthEvents(),
withAuthReducer(),
withComputed((store) => {
  return {
    isLoggedIn: computed(() => {
      return !!store.idToken();
    }),
  };
}),
);
