---
name: angular-guard-tests
description: How to write and review unit tests for Angular functional route guards (CanMatchFn, CanActivateFn, e.g. authenticatedGuard, unauthenticatedGuard) in the web/ projects with a single `setup`, a mocked store and a mocked dispatcher. Use whenever creating, extending, reviewing or fixing a `*-guard.spec.ts` under web/projects, or when adding a branch to a guard.
---

# Route guard tests: the `setup` function

A guard is a function that reads a store and either returns `true` or dispatches a navigation event and returns
`false`. Its spec has one `setup`, runs the guard inside the injection context, and asserts two things per case:
the **result** and the **dispatched event**. Guards never navigate directly, so no `Router` is involved.

Components use `angular-render-tests`, HTTP services `angular-service-tests`, stores `angular-store-tests`,
HTTP interceptors `angular-interceptor-tests`.

## The shape

```ts
describe('authenticatedGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authenticatedGuard(...guardParameters));

  let mockAuthStore: MockSignalStore<typeof AuthStore>;
  let mockDispatcher: Dispatcher;

  const setup = () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        provideMockSignalStore(AuthStore, 'isLoggedIn', 'userTypes'),
        provideMockDispatcher(),
      ],
    });

    mockDispatcher = TestBed.inject(Dispatcher);
    mockAuthStore = TestBed.inject<MockSignalStore<typeof AuthStore>>(AuthStore);
  };

  beforeEach(() => {
    setup();
  });

  it('should deny if not logged in', () => {
    mockAuthStore.isLoggedIn.set(false);

    const result = executeGuard({ data: { requiredUserType } }, undefined, undefined);

    expect(result).toBe(false);
    validateFunctionCall(mockDispatcher.dispatch, navigationEvents.loggedOutHomepage(), { scope: 'self' });
  });
});
```

## Rules

- `setup` is synchronous, starts with `TestBed.resetTestingModule()`, and runs in `beforeEach`.
- `provideMockSignalStore(Store, ...)` lists only the store properties the guard reads; `provideMockDispatcher()`
  is always present (every guard that denies dispatches).
- The mock signals start as `undefined`: every property the guard reads **on the path under test** is set in the
  case. Set the others only when the case is about them.
- `executeGuard` wraps the guard in `TestBed.runInInjectionContext` and is typed with the guard's own function
  type (`CanMatchFn`, `CanActivateFn`). Pass only the arguments the guard reads (`route.data`); the rest are
  `undefined`.
- Every case asserts both the return value and the dispatch:
  - allowed: `expect(result).toBe(true)` and `validateFunctionCall(mockDispatcher.dispatch)` (not called);
  - denied: `expect(result).toBe(false)` and
    `validateFunctionCall(mockDispatcher.dispatch, someEvents.theEvent(), { scope: 'self' })`.
- Cover **every branch**: each denial reason (not logged in, missing user type, ...), the allowed path, and the
  "optional" branches - a route whose `data` is empty or missing must be tested when the guard reads `route.data`.
- No `Router` mocks, no real stores, no `.only`, no `.skip`.

## Review checklist

- [ ] `TestBed.resetTestingModule()` is the first statement of `setup`; `setup` runs in `beforeEach`.
- [ ] Only the store properties the guard reads are mocked; the dispatcher is mocked.
- [ ] Each case checks the result **and** the dispatch (or its absence).
- [ ] Every branch of the guard has a case, including missing `route.data` / missing `requiredUserType`.
- [ ] The guard is executed through `TestBed.runInInjectionContext`.

## Reference specs

`web/projects/shared/src/lib/guards/authenticated-guard.spec.ts` (route data and several denial reasons) and
`unauthenticated-guard.spec.ts` (the minimal shape).
Helpers: `provideMockSignalStore`, `provideMockDispatcher`, `MockSignalStore` in `@household/shared-ui`;
`validateFunctionCall` in `@household/shared/common/unit-testing`.
