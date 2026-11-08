---
name: angular-service-tests
description: How to write and review unit tests for Angular HTTP services (classes using HttpClient and the API_URL token, e.g. CategoryService, ProjectService, RecipientService) in the web/ projects with a single `setup` function and HttpTestingController. Use whenever creating, extending, reviewing or fixing a `*-service.spec.ts` under web/projects, or when a service spec is a skipped "should be created" placeholder. Component and directive specs use angular-render-tests instead.
---

# HTTP service tests: the `setup` function

Every spec for an HTTP service in `web/projects/*` (Vitest + Angular TestBed) owns exactly one `setup`
function. Test cases never touch `TestBed` directly: they call `setup()`, call one service method, and
verify the HTTP request that was sent and how the result is delivered. There is no template, so none of the
`render` steps apply (no fixture, no selector, no `whenStable`); the shape of the pattern is the same though:
one function creates a clean module, wires the test doubles, and exposes them through spec-scoped variables.

Signal stores that call these services are out of scope here (see `angular-store-tests`), and so are components
and directives (see `angular-render-tests`). A service that does something besides issuing HTTP requests (state, timers,
other injected services) still uses `setup`, with the extra collaborators mocked via `createMockService`.

## The contract

`setup` is synchronous and performs these steps, **in this order**:

1. **Reset the testing module** - `TestBed.resetTestingModule()` is the first statement.
2. **Configure the testing module** with `TestBed.configureTestingModule({ providers: [...] })`:
   - `provideHttpClient()` and `provideHttpClientTesting()` - never mock `HttpClient` itself, the request
     is what is under test.
   - `{ provide: API_URL, useValue: apiUrl }` if the service reads the API base URL.
   - A mock for every other collaborator the service injects:
     `{ provide: Other, useValue: mockOther.service }` with `mockOther = createMockService(...)`.
     Create those mocks after the reset, so every call gets fresh spies.
   - There is no `compileComponents()`; there is nothing to compile.
3. **Inject into spec-scoped variables** - `service = TestBed.inject(XService)` and
   `httpMock = TestBed.inject(HttpTestingController)`.

Plus, once per spec:

```ts
afterEach(() => {
  httpMock.verify();
});
```

so a request the service sent but the test did not account for fails the test.

## Parameter rules

- `setup` has **at most one parameter**, and only when a value injected into the module varies between test
  cases (an initial token value, a feature flag, ...). Same shape rules as `render`: a bare optional value for
  one input, one optional object for two or more, every input with a default.
- Values that are identical in every test case (the `apiUrl`, the `baseUrl` derived from it, shared
  `testDataFactory` fixtures) are `const`s at `describe` scope, not parameters.

## Writing the test cases

Group by service method: `describe('<methodName>')`. Per method write:

1. **A request test** - the success path. In this order:
   1. call `setup()`;
   2. subscribe with a spy: `const next = vi.fn(); service.method(args).subscribe(next);`
   3. `const req = httpMock.expectOne(url)` with the **exact full URL** (built from `baseUrl`, never a matcher
      function or a partial match);
   4. assert `req.request.method`, and `req.request.body` with `toEqual` when the method sends one;
   5. `req.flush(response)` - use `null` for a `void` endpoint;
   6. assert `next` was called exactly once (`toHaveBeenCalledTimes(1)`) and, when the endpoint returns
      data, with that data (`toHaveBeenCalledWith(response)`).
2. **An error test** - `subscribe({ error })` with a spy, `req.flush('error', { status, statusText })`, assert the
   spy was called once and `error.mock.calls[0][0].status` equals the status. Services pass `HttpClient`
   errors through unchanged; error handling belongs to the stores.

Additional rules:

- Test only the public methods of the service; one `describe` per method, even when two methods look identical
  (a copy-paste URL mistake is exactly the bug these tests exist to catch).
- Build request bodies, ids and responses with `testDataFactory`; do not hand-write them.
- Do not assert on `HttpClient` internals or headers unless the service sets them itself (interceptors have
  their own specs, e.g. `auth-interceptor.spec.ts`).
- Keep the tests synchronous. `HttpTestingController` flushes synchronously, so no `async`, no fake timers
  and no `await` are needed unless the service uses RxJS timing operators.
- No `describe.skip`, no `it.only`, and no "should be created" placeholder.

## Canonical shape

```ts
describe('CategoryService', () => {
  const apiUrl = 'http://api.url';
  const baseUrl = `${apiUrl}/category/v1/categories`;

  let service: CategoryService;
  let httpMock: HttpTestingController;

  const categoryId = testDataFactory.category.id();
  const request = testDataFactory.category.request();

  const setup = () => {
    TestBed.resetTestingModule();                                                    // 1

    TestBed.configureTestingModule({                                                 // 2
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: apiUrl },
      ],
    });

    service = TestBed.inject(CategoryService);                                       // 3
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('updateCategory', () => {
    it('should send a PUT request with the body to the category url', () => {
      setup();

      const next = vi.fn();
      service.updateCategory(categoryId, request).subscribe(next);

      const req = httpMock.expectOne(`${baseUrl}/${categoryId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);

      req.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error', () => {
      setup();

      const error = vi.fn();
      service.updateCategory(categoryId, request).subscribe({ error });

      httpMock.expectOne(`${baseUrl}/${categoryId}`).flush('error', {
        status: 404,
        statusText: 'Not Found',
      });

      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0][0].status).toBe(404);
    });
  });
});
```

Reference specs: `category-service.spec.ts`, `project-service.spec.ts`, `recipient-service.spec.ts` in
`web/projects/household/src/services/`.

## Review checklist

- [ ] `TestBed.resetTestingModule()` is the first statement of `setup`; every test case calls `setup()` first.
- [ ] `HttpClient` is real (`provideHttpClient` + `provideHttpClientTesting`), not mocked.
- [ ] `afterEach` calls `httpMock.verify()`.
- [ ] Every public method has a request test and an error test.
- [ ] `expectOne` uses the exact full URL; method and body (when sent) are asserted; the result is asserted.
- [ ] Test data comes from `testDataFactory`; no hard-coded ids or bodies.
- [ ] Other collaborators are mocked with `createMockService`; nothing is `.skip`ped or `.only`.
