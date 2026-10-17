---
name: angular-render-tests
description: How to write and review unit tests for Angular components and directives in the web/ projects using the shared `render` function pattern (reset TestBed, stub repo-defined child components, mock stores and dispatcher, single parameter, whenStable). Use whenever creating, extending, reviewing or fixing a `*.spec.ts` for a component, dialog or directive under web/projects, or when a spec's `render` function looks inconsistent with its siblings.
---

# Component and directive tests: the `render` function

Every component or directive spec in `web/projects/*` (Vitest + Angular TestBed, zoneless) owns exactly one
`render` function. Test cases never touch `TestBed` directly: they call `await render(...)`, then interact
with the DOM and assert. This keeps every spec structurally identical, so state set-up is never repeated
and never drifts between test cases.

HTTP services use the `angular-service-tests` skill and signal stores use the `angular-store-tests` skill instead.

## The contract

`render` is `async` and performs these steps, **in this order**:

1. **Reset the testing module** - `TestBed.resetTestingModule()` is the first statement. Each call must start
   from a clean module, so nothing leaks between test cases.
2. **Create per-call mocks that are not store-related** - e.g. `mockDialogRef = createMockService('close')`.
   Create them after the reset so every render gets fresh spies.
3. **Configure the testing module** with `await TestBed.configureTestingModule({...})` ... `.compileComponents()`:
   - `imports`: the component or directive under test (for a directive: a host component, see below).
   - `providers`:
     - `provideMockSignalStore(Store, ...properties)` for every store the component reads. List only the
       properties the template or class reads.
     - `provideMockDispatcher()` if the component dispatches any event.
     - Any other injected value as a plain provider: `MAT_DIALOG_DATA`, `MatDialogRef` (the mock from step 2),
       `provideRouter([])`, and so on.
   - `.overrideComponent(Component, { remove: { imports: [...] }, add: { imports: [...Stubs] } })`
     if the component imports stubbed children. Every removed component has exactly one stub added.
4. **Inject the mocks into spec-scoped variables** - `mockXStore = TestBed.inject<MockSignalStore<typeof XStore>>(XStore)`
   and `mockDispatcher = TestBed.inject(Dispatcher)`, so test cases can set further state and assert on
   dispatched events.
5. **Set the store state** from the render parameter (with a default). Mock signals start as `undefined`, so
   every mocked property the component reads must be set here.
6. **Create the fixture** - `fixture = TestBed.createComponent(Component)`. Signal inputs are set right after
   with `fixture.componentRef.setInput('name', params?.value ?? default)`.
7. **Create the selector** - `selector = elementSelectorFactory(fixture.debugElement)`.
8. **`await fixture.whenStable()`** - always the last statement. The app is zoneless, so `whenStable`
   flushes change detection and effects. Do not use `fixture.detectChanges()`.

## Parameter rules

- **`render` has exactly one parameter.**
- **Everything injected into the module that influences a test case is a field of that parameter:** store
  state, `MAT_DIALOG_DATA`, component inputs, router data, and so on. Nothing the tests need to vary may be
  hard-coded inside `render` or captured from the surrounding scope.
- **One input:** a bare optional value with a default, e.g. `render(userTypes: UserType[] = [])`.
- **Two or more inputs:** a single optional object, e.g. `render(params?: { dialogData?: X; categoryList?: Y[] })`.
  When a second input appears, convert the bare parameter to this object form and update the call sites.
- Every input has a default (usually a fixture declared once at `describe` scope with `testDataFactory`), so
  `await render()` produces the common case and each test passes only what it is about.
  Use `params?.field ?? default`, not `params.field`, so `render()` works without arguments.
- A test case needing a different state **after** render sets the mock signal again
  (`mockXStore.prop.set(...)`) and awaits `fixture.whenStable()`. Call `render` at most once per test case.

## Stubbing

- Stub only **components defined in this repository**, including those from `@household/shared-ui`
  (`ClearableInput`, `IconText`, `Toolbar`, `MainMenu`, `CategoryListItem`, ...).
- Do **not** stub Angular Material or other third-party components; the real ones are rendered.
- Do **not** stub repo-defined directives and pipes (e.g. `IsEditor`); keep them real and drive them through
  the mocked store.
- Create each stub once at `describe` scope, outside `render`: `const ToolbarStub = createStubComponent(Toolbar);`.
  Stubs keep the inputs, outputs and content slots of the real component, so a stub's inputs can be read and
  its outputs emitted from a test.

## Canonical shape

```ts
describe('CategoryHome', () => {
  const ToolbarStub = createStubComponent(Toolbar);
  const CategoryListStub = createStubComponent(CategoryList);

  let fixture: ComponentFixture<CategoryHome>;
  let selector: IElementSelector;
  let mockCategoryStore: MockSignalStore<typeof CategoryStore>;
  let mockDispatcher: Dispatcher;

  const categories = [testDataFactory.category.response(), testDataFactory.category.response()];

  // element getters are declared next to render and use the spec-scoped selector
  const getList = () => selector.getComponent(CategoryListStub);

  const render = async (categoryList: Responses.Category[] = categories) => {
    TestBed.resetTestingModule();                                                    // 1

    await TestBed.configureTestingModule({                                           // 3
      imports: [CategoryHome],
      providers: [
        provideMockSignalStore(CategoryStore, 'categoryList'),
        provideMockDispatcher(),
      ],
    })
      .overrideComponent(CategoryHome, {
        remove: { imports: [Toolbar, CategoryList] },
        add: { imports: [ToolbarStub, CategoryListStub] },
      })
      .compileComponents();

    mockCategoryStore = TestBed.inject<MockSignalStore<typeof CategoryStore>>(CategoryStore); // 4
    mockDispatcher = TestBed.inject(Dispatcher);

    mockCategoryStore.categoryList.set(categoryList);                                // 5

    fixture = TestBed.createComponent(CategoryHome);                                 // 6
    selector = elementSelectorFactory(fixture.debugElement);                         // 7

    await fixture.whenStable();                                                      // 8
  };
});
```

Dialog with several inputs (object parameter, per-call mock for `MatDialogRef`):

```ts
const render = async (params?: {
  dialogData?: CategorySelectDialogData;
  categoryList?: Responses.Category[];
}) => {
  TestBed.resetTestingModule();

  mockDialogRef = createMockService('close');

  await TestBed.configureTestingModule({
    imports: [CategorySelectDialog],
    providers: [
      provideMockSignalStore(CategoryStore, 'categoryList'),
      { provide: MAT_DIALOG_DATA, useValue: params?.dialogData },
      { provide: MatDialogRef, useValue: mockDialogRef.service },
    ],
  })
    .overrideComponent(CategorySelectDialog, {
      remove: { imports: [ClearableInput] },
      add: { imports: [ClearableInputStub] },
    })
    .compileComponents();

  mockCategoryStore = TestBed.inject<MockSignalStore<typeof CategoryStore>>(CategoryStore);
  mockCategoryStore.categoryList.set(params?.categoryList ?? [category1, category2]);

  fixture = TestBed.createComponent(CategorySelectDialog);
  selector = elementSelectorFactory(fixture.debugElement);

  await fixture.whenStable();
};
```

Component with a signal input: set it between creating the fixture and `whenStable`
(`fixture.componentRef.setInput('category', params?.category ?? category)`).

### Directives

A directive needs a template to act on, so the spec declares a small host component and renders that:

```ts
@Component({
  imports: [IsEditor],
  template: '<span *householdIsEditor data-testId="editor-content">editor only</span>',
})
class TestHost {}
```

`render` imports `TestHost`, mocks the stores the directive injects, and follows the same eight steps with
`TestBed.createComponent(TestHost)`. Give elements under test a `data-testId` and look them up through the selector.

## Writing the test cases

- Group with `describe('<element or behaviour>')` and write `it('should ...')` names in plain behavioural terms.
- `await render(...)` is the first line of the case. Then interact, then `await fixture.whenStable()` after any
  click or state change, then assert.
- Look elements up only through the `selector` (`getComponent`, `getComponentByTestId`, `getElementByTestId`,
  `listComponents`, ...), wrapped in small getters declared above `render`. Use `data-testId` attributes in templates
  for anything not reachable by component type.
- Assert dispatched events with `validateFunctionCall(mockDispatcher.dispatch, someEvents.theEvent(payload), { scope: 'self' })`,
  and "nothing dispatched" with `validateFunctionCall(mockDispatcher.dispatch)`.
- Assert dialog closing and similar with the mock created by `createMockService` (`mockDialogRef.service.close`).
- Build test data with `testDataFactory`; declare shared fixtures once at `describe` scope.

## Review checklist

- [ ] `TestBed.resetTestingModule()` is the first statement of `render`.
- [ ] `render` has one parameter; every varying injected value is part of it; `render()` works with no arguments.
- [ ] Every repo-defined child component is stubbed (remove and add in `overrideComponent`); nothing else is.
- [ ] Mock stores list only the properties the component reads, and each of them is set in `render`.
- [ ] `provideMockDispatcher()` is present if and only if the component dispatches.
- [ ] Mocks (stores, dispatcher, dialog ref) are assigned to spec-scoped variables inside `render`.
- [ ] `selector` is created from `fixture.debugElement`; `render` ends with `await fixture.whenStable()`.
- [ ] No `fixture.detectChanges()`, no `it.only`, no `.skip` committed, no `TestBed` calls in test cases.

## Where the helpers live

- `createStubComponent`, `elementSelectorFactory`, `provideMockSignalStore`, `provideMockDispatcher`, `MockSignalStore`:
  `web/projects/shared/src/lib/testing/` (import from `@household/shared-ui`).
- `createMockService`, `validateFunctionCall`, `MockService`: `shared/src/common/unit-testing.ts`
  (import from `@household/shared/common/unit-testing`).
- Reference specs: `category-select-dialog.spec.ts` (object parameter and dialog providers),
  `category-home.spec.ts` (stubs, store, dispatcher), `category-list-item.spec.ts` (signal input),
  `is-editor.spec.ts` (directive with host component).
