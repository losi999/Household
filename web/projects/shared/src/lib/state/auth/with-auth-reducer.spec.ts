import { TestBed } from '@angular/core/testing';
import { UserType } from '@household/shared/enums';
import { signalStore, withState } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';
import { authEvents } from './auth-events';
import { AuthState } from './auth-store';
import { withAuthReducer } from './with-auth-reducer';

const createTestStore = (state: AuthState) => {
  return signalStore({
    providedIn: 'root',
  }, withState<AuthState>(state), withAuthReducer());
};

describe('withAuthReducer', () => {
  let initialState: AuthState;
  let store: InstanceType<ReturnType<typeof createTestStore>>;
  let dispatcher: Dispatcher;

  const validateState = (currentValue?: Partial<AuthState>) => {
    expect(store.idToken(), 'idToken').toEqual(Object.hasOwn(currentValue ?? {}, 'idToken') ? currentValue.idToken : initialState.idToken);
    expect(store.refreshToken(), 'refreshToken').toEqual(Object.hasOwn(currentValue ?? {}, 'refreshToken') ? currentValue.refreshToken : initialState.refreshToken);
    expect(store.userTypes(), 'userTypes').toEqual(Object.hasOwn(currentValue ?? {}, 'userTypes') ? currentValue.userTypes : initialState.userTypes);
  };

  const setup = (initial?: Partial<AuthState>) => {
    TestBed.resetTestingModule();

    initialState = {
      idToken: 'initial.id.token',
      refreshToken: 'initial.refresh.token',
      userTypes: [UserType.Hairdresser],
      ...initial,
    };

    store = TestBed.inject(createTestStore(initialState));
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('logInCompleted', () => {
    it('should store the tokens and the user types', () => {
      const idToken = 'new.id.token';
      const refreshToken = 'new.refresh.token';

      dispatcher.dispatch(authEvents.logInCompleted({
        idToken,
        refreshToken,
        userTypes: [UserType.Editor],
      }));

      validateState({
        idToken,
        refreshToken,
        userTypes: [UserType.Editor],
      });
    });
  });

  describe('logOut', () => {
    it('should clear the tokens and the user types', () => {
      dispatcher.dispatch(authEvents.logOut());

      validateState({
        idToken: undefined,
        refreshToken: undefined,
        userTypes: undefined,
      });
    });
  });
});
