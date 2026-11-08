---
name: angular-interceptor-tests
description: How to write and review unit tests for Angular functional HTTP interceptors (HttpInterceptorFn, e.g. authInterceptor, progressInterceptor) in the web/ projects with a single `setup`, HttpClient plus HttpTestingController, a mocked dispatcher and a `get` helper that records the outcome. Use whenever creating, extending, reviewing or fixing a `*-interceptor.spec.ts` under web/projects, or when adding a branch to an interceptor.
---

# HTTP interceptor tests: `setup` plus a recording `get`

An interceptor is tested through a real `HttpClient` configured with only that interceptor and the
`HttpTestingController` backend, so the test sees exactly what a caller and the server would see. The
collaborators (stores, services, dispatcher) are mocked.

Components use `angular-render-tests`, HTTP services `angular-service-tests`, stores `angular-store-tests`,
route guards `angular-guard-tests`.

## `setup`

Synchronous, in `beforeEach`, in this order:

1. `TestBed.resetTestingModule()`.
2. Create the mocks the interceptor uses, after the reset (`createMockService('refreshToken')`).
3. `TestBed.configureTestingModule` with `provideHttpClient(withInterceptors([theInterceptor]))`,
   `provideHttpClientTesting()`, `provideMockDispatcher()` if it dispatches, `provideMockSignalStore(Store, ...)`
   for the properties it reads, the mocked services, and `API_URL` if it reads it.
4. Inject `HttpClient`, `HttpTestingController`, the dispatcher and the mock store into spec-scoped variables.
5. Set state that every case shares (e.g. the refresh token).

`afterEach` calls `vi.useRealTimers()` and `httpMock.verify()`.

## The recording `get` helper

Declare one helper that sends a request and records how it ended. Assertions then follow the flushes in plain
sequence - no assertions inside `subscribe` callbacks and no `expect.assertions(n)`:

```ts
const get = (url: string) => {
  const outcome: { response?: any; error?: HttpErrorResponse; completed: boolean } = { completed: false };

  http.get(url).subscribe({
    next: (response) => { outcome.response = response; },
    error: (error) => { outcome.error = error; },
    complete: () => { outcome.completed = true; },
  });

  return outcome;
};
```

A case then reads: `const outcome = get(url)`, `httpMock.expectOne(url)` (or `match` when the request is repeated),
inspect `req.request.headers`, `req.flush(...)`, assert `outcome`, the mocked service calls and the dispatch.
Keep error bodies shared by many cases (e.g. the expired-token 401) as one constant at `describe` scope.

## Rules

- Cover every branch of the interceptor: each early `next(request)` pass-through, the success path, **every**
  error status it distinguishes, errors it must pass through untouched (e.g. 500), failures of its own helper
  calls (e.g. a failed token refresh) and the failure of a repeated request.
- Pass-through cases assert the request was **not** modified (e.g. no `Authorization` header) and that nothing
  was called or dispatched: `validateFunctionCall(mock)` / `validateFunctionCall(mockDispatcher.dispatch)`.
- Dispatches are asserted with `validateFunctionCall(mockDispatcher.dispatch, someEvents.theEvent(), { scope: 'self' })`
  and several in a row with `validateNthFunctionCall`.
- Use `httpMock.match(url)` when a request is sent again after the first flush; `expectOne` otherwise.
- Include a case for the request being cancelled (`subscription.unsubscribe()`, then `req.cancelled`) when the
  interceptor keeps per-request state such as an in-progress marker.
- Mock asynchronous collaborators synchronously by default. `delay(0)` is **still asynchronous**: only add a
  delay when the case is about timing, enable `vi.useFakeTimers()` inside that case only, and advance with
  `vi.advanceTimersByTime`. `delay` does not postpone errors - to fail later use
  `timer(ms).pipe(mergeMap(() => throwError(() => error)))`.
- Calls that share work (e.g. a single token refresh for several 401s) need a case with two or more concurrent
  requests: assert the shared collaborator was called once, and that **every** request ends - successfully and
  when the shared work fails.
- Interceptors must not keep module-level state. If one does, every case has to finish its flow so nothing leaks
  into the next; prefer fixing the interceptor.
- No `.only`, no `.skip`.

## Review checklist

- [ ] `TestBed.resetTestingModule()` is the first statement of `setup`; mocks are created after it.
- [ ] Only the interceptor under test is registered with `withInterceptors`.
- [ ] A `get`-style helper records the outcome; no `expect.assertions(n)`, no assertions in `subscribe` callbacks.
- [ ] `afterEach` restores real timers and calls `httpMock.verify()`.
- [ ] Every branch, every distinguished status, pass-through errors, helper failures, concurrency and
      cancellation (where state is kept) have a case.
- [ ] Fake timers are enabled only in the cases that need them.

## Reference specs

`web/projects/shared/src/lib/interceptors/auth-interceptor.spec.ts` (branches, shared refresh, timers, failures)
and `progress-interceptor.spec.ts` (dispatch order, error, cancellation).
Helpers: `provideMockDispatcher`, `provideMockSignalStore`, `MockSignalStore` in `@household/shared-ui`;
`createMockService`, `validateFunctionCall`, `validateNthFunctionCall` in `@household/shared/common/unit-testing`.
