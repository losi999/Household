---
name: angular-store-tests
description: How to write and review unit tests for NgRx signal stores built from separate features (withReducer, withEventHandlers for UI events, withEventHandlers for API events) in the web/ projects, e.g. CategoryStore, ProjectStore, RecipientStore. Covers the four-spec layout per store, the isolated test store each feature spec builds, `setup` and `validateState`, dispatch spying, and the circular import trap. Use whenever creating, extending, reviewing or splitting a spec under web/projects/*/src/state, or when adding a feature, event or reducer case to a store.
---

# Signal store tests: one spec per store feature

A store in `web/projects/*/src/state/<domain>/` is a composition of features, and **every feature has its own
spec with its own `setup`**. A spec never builds the whole store, except the small store spec that only checks
the composition. This keeps each `setup` tiny (only what that feature needs) and each test about one
responsibility, instead of one giant file where every test wires every collaborator and asserts the whole state.

| Source file | Responsibility | Spec file | What it asserts |
|---|---|---|---|
| `with-<domain>-reducer.ts` | state changes caused by events | `with-<domain>-reducer.spec.ts` | resulting state only |
| `with-<domain>-events.ts` | UI event handlers: dialogs, bottom sheets, confirmations | `with-<domain>-events.spec.ts` | collaborator calls and dispatched events only |
| `with-<domain>-api-events.ts` | API event handlers: HTTP service calls | `with-<domain>-api-events.spec.ts` | service calls and dispatched events only |
| `<domain>-store.ts` | composition and initial state | `<domain>-store.spec.ts` | initial state and wiring only |

Components that read the store are tested with `angular-render-tests` (mock store), HTTP services with
`angular-service-tests`. Neither uses these specs.

## Building the store under test

Each feature spec composes **only its own feature** into a throw-away store. Do not use the real store class
in these three specs.

```ts
// events and api-events specs: handlers need no state
TestBed.inject(signalStore({ providedIn: 'root' }, withCategoryEvents()));

// reducer spec: state plus the reducer, nothing else
const createTestStore = (state: CategoryState) => {
  return signalStore({ providedIn: 'root' }, withState<CategoryState>(state), withCategoryReducer());
};
store = TestBed.inject(createTestStore(initialState));
```

Because each `setup` call builds a new store class, nothing leaks between tests, and the store's own
initial-state injection token (which is not exported) is never needed.

## Handler specs (`with-*-events.spec.ts`, `with-*-api-events.spec.ts`)

`setup` is synchronous and runs in `beforeEach`. In this order:

1. `TestBed.resetTestingModule()`.
2. Create the mocks this feature uses, after the reset, with `createMockService(...)`:
   - UI events: `MatDialog` (`'open'`), `DialogService` (`'openConfirmationDialog'`), `BottomSheetService`
     (`'openBottomSubmenu'`) - provide only those the feature injects.
   - API events: the domain's HTTP service with all its methods (`'listCategories'`, `'createCategory'`, ...).
3. `TestBed.configureTestingModule({ providers: [{ provide: X, useValue: mockX.service }, ...] })`.
4. Instantiate the feature store: `TestBed.inject(signalStore({ providedIn: 'root' }, withXxx()))`. The
   handlers only start listening once the store exists.
5. `dispatcher = TestBed.inject(Dispatcher)` and `dispatchSpy = createDispatcherSpy(dispatcher)`.

`createDispatcherSpy` lets the test's own dispatch run for real and **swallows every dispatch after it**. So
events emitted by the handlers are recorded on the spy but never reach any reducer or handler, and a handler
spec can never be affected by another feature.

### Test cases

- One `describe('dispatching <eventName>')` per handled event, one `it` per outcome (submitted, cancelled,
  confirmed, API success, duplicate name, generic error, each bottom-sheet choice, ...).
- Arrange the collaborator, dispatch, then assert:
  - `validateFunctionCall(mock.functions.x, ...args)` - called with exactly these arguments; with no
    arguments it asserts the function was **not** called.
  - `validateDispatcher(dispatchSpy, ...expectedEvents)` - the events the handler emitted, in order. With no
    events it asserts the handler emitted nothing (only the test's own dispatch happened).
- **No state assertions.** State belongs to the reducer spec.
- Mock return shapes:
  - dialogs: `mockMatDialog.functions.open.mockReturnValue({ afterClosed: () => of(result) } as MatDialogRef<any>)`;
    cancelled is `of(undefined)`;
  - bottom sheet: `{ afterDismissed: () => of('edit') } as MatBottomSheetRef`;
  - confirmation: `mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true | false))`;
  - API success: `mockService.functions.x.mockReturnValue(of(response))` (`of(undefined)` for void);
  - API failure: `mockService.functions.x.mockReturnValue(throwError(() => ({ error: { message: '...' } })))`.
- Cover every branch of the handler: each error message it distinguishes, and the "nothing dispatched" path.
- Build test data with `testDataFactory`; constants shared by the cases of a `describe` live in that `describe`.

## Reducer spec (`with-*-reducer.spec.ts`)

`setup(initial?: Partial<State>)` (the one optional parameter, the initial state to override):

1. `TestBed.resetTestingModule()`.
2. `initialState = { ...defaultState, ...initial }`.
3. `store = TestBed.inject(createTestStore(initialState))` and `dispatcher = TestBed.inject(Dispatcher)`.

No mocks, no dispatch spy: nothing but the reducer is listening. `beforeEach(() => setup())` gives the default
state; a test that needs another starting state calls `setup({...})` again before dispatching.

`validateState` takes a `Partial<State>` of the keys the event is expected to change and checks **every** key of
the state: expected keys against the given value, all others against `initialState`. This is what proves a
reducer case changed only what it should.

```ts
const validateState = (currentValue?: Partial<CategoryState>) => {
  expect(store.isInProgress(), 'isInProgress').toEqual(Object.hasOwn(currentValue ?? {}, 'isInProgress') ? currentValue.isInProgress : initialState.isInProgress);
  // ... one line per state key
};
```

Use `Object.hasOwn`, not `??`, so an expected value of `undefined` or `[]` is checked instead of being
mistaken for "not specified".

### Test cases

- One `describe('<eventName>')` per event the reducer handles, named after the event, `it('should <state change>')`.
  Every `on(...)` case of the reducer has at least one test; an `on(a, b, c)` case is tested through each event
  whose behavior differs.
- Arrange the starting state with `setup({...})`, dispatch the event, `validateState({...changed keys})`.
- Use `expect.arrayContaining([...])` only where order is not part of the contract (search terms, ids marked in
  progress alongside descendants); otherwise assert the exact value.
- Cover derived data (full names, ancestors, search terms, sorting) with precise expected objects.

## Store spec (`<domain>-store.spec.ts`)

Builds the **real** store with every collaborator mocked and `provide<Domain>StoreInitialState(initialState)`.
`setup(initial?: Partial<State>)` resets the module, creates all mocks, and injects `store` and `dispatcher`.
It does not use `createDispatcherSpy`: events must flow through the whole store. Keep it to:

- initializes with the provided state, and with the default state;
- the reducer is wired in (dispatch an event only the reducer handles, check the state);
- the UI event handlers are wired in (dispatch one, assert the dialog mock was called, with
  `expect.anything()` for the options);
- the API event handlers and the reducer work together (dispatch an `...Initiated` event, assert the service
  mock was called and the resulting state).

Behavior details do not belong here; they are covered by the feature specs. Start the spec with a comment
saying so.

## The circular import trap

The UI event handlers pass dialog classes to `MatDialog.open` (`open(CategoryDialog, ...)`), so the handler file,
and the spec that asserts the call, import those classes. Some dialogs import the store, and the store imports
the event handlers, which closes a loop at **module load time** (no dialog is opened in the tests). If the spec
loads the handlers before the store, the store runs while the handlers are still unevaluated and fails with
`withXxxEvents is not a function`.

Fix it in the events spec only, by importing the store first as a side effect and explaining why:

```ts
// The dialog classes the event handlers reference import the store, which imports the event handlers back.
// Loading the store first resolves that cycle in the same order as the application does.
import '@household/state/category/category-store';
```

Reducer, API-event and store specs do not need it. Do not change the application imports to fix a spec.

## Adding to an existing store

- **New event with a UI handler:** a `describe` in the events spec; plus a reducer case and test if the reducer
  handles it.
- **New API call:** a `describe` in the api-events spec (success and every error branch); the service gets its
  own method tests (`angular-service-tests`); each resulting `...Completed`/`...Failed` event the reducer
  handles gets a reducer test.
- **New state key:** add it to `setup`'s defaults and to `validateState` in the reducer spec, and to the
  initial-state tests in the store spec.
- **New domain with the same shape:** copy the four specs of the nearest sibling (`project`/`recipient` are
  identical apart from names and messages), rename, and delete the cases the domain does not have.

## Review checklist

- [ ] Four specs per store; a spec never exercises more than its own feature (except the store spec's wiring tests).
- [ ] `TestBed.resetTestingModule()` is the first statement of every `setup`; mocks are created after it.
- [ ] Handler specs have no state assertions; the reducer spec has no mocks and no dispatch spy.
- [ ] Handler specs use `createDispatcherSpy` and assert emitted events with `validateDispatcher`.
- [ ] `validateState` checks every state key and uses `Object.hasOwn`.
- [ ] Every `on(...)` case of the reducer, every handler, and every error branch has a test.
- [ ] The events spec imports the store first (with the comment) if a handled dialog imports the store.
- [ ] Store spec limited to initialization and wiring; no `.only`, no `.skip`.

## Reference specs

`web/projects/household/src/state/category/` is the full example (UI handlers with dialogs, bottom sheet and
confirmation; API handlers with duplicate-name branches; a reducer with derived data). `project/` and
`recipient/` show the simpler flat shape.

Helpers: `createDispatcherSpy`, `validateDispatcher` in `@household/shared-ui`;
`createMockService`, `validateFunctionCall` in `@household/shared/common/unit-testing`.
