---
name: generic-unit-tests
description: How to write and review the non-Angular unit tests in this repo - pure helper functions (utils, e.g. product-utils.spec.ts, shared/src/common/utils.spec.ts), AJV schema specs (shared/src/schemas/*.spec.ts with schemaTesterFactory), document converter specs (shared/src/converters), API business-service specs and Lambda handler specs (api/src/functions/*/*.service.spec.ts and *.handler.spec.ts), and AWS-client wrapper services (shared/src/services). Vitest, node environment, mocks built with createMockService. Use whenever creating, extending, reviewing or fixing such a `*.spec.ts` under api/, shared/ or a pure function spec in web/. Angular specs use the angular-* skills; the Playwright suite in test/ is not covered.
---

# Generic (non-Angular) unit tests

Vitest with `globals: true`, run from the repo root (`yarn test:api` = `vitest run --silent --coverage` over
`api/src/**/*.spec.ts` and `shared/src/**/*.spec.ts`; one file: `npx vitest run <path> --no-coverage`). Web pure
functions run with the web project's own runner (`cd web && npx ng test <project> --watch=false --include='**/x.spec.ts'`).

Angular specs: `angular-render-tests` (components/directives), `angular-store-tests`, `angular-service-tests`,
`angular-guard-tests`, `angular-interceptor-tests`, `angular-pipe-tests`.

## Principles shared by every kind

1. **Build all test data with `testDataFactory`** (`@household/shared/common/test-data-factory`):
   `testDataFactory.<domain>.id() / .request() / .document() / .response() / .report()`, each taking the fields to
   override. Never hand-roll a fixture the factory can build. Declare shared fixtures once at `describe` scope.
2. **Mock with `createMockService<Interface>('method', ...)`** (`@household/shared/common/unit-testing`) - it returns
   `{ service, functions }`; list only the methods the unit calls. Business services / handlers (single function
   interfaces) use `vi.fn()` typed as `MockBusinessService<I>`. Create mocks in `beforeEach` (fresh spies per test).
3. **Assert calls with `validateFunctionCall(fn, ...args)`**: called with exactly these args; **with no args it
   asserts the function was not called** - use it to prove a path stopped early.
4. **Names are behavioral**: `describe('<Unit under test>')`, `it('should ...')`; error cases grouped in
   `describe('should throw error', ...)` with `it('if <cause>', ...)`.
5. **Deterministic**: freeze time with `vi.useFakeTimers().setSystemTime(new Date())` in `beforeEach` and
   `vi.useRealTimers()` in `afterEach` when the unit calls `new Date()` / `addSeconds`.
6. Object / array literals are multi-line (eslint). No `.only`, no `.skip`, no "should be defined" placeholders.

## Pure functions (utils)

No mocks and no `beforeEach`. One `describe('<function>')` per exported function, `it('should ...')` per behavior,
`it.each` tables for input -> output. Cover each branch and the boundaries (empty, first/last, the "undefined"
case, ordering and tie-breaking for sorters). Domain inputs from `testDataFactory`.
Examples: `shared/src/common/utils.spec.ts`, `web/projects/household/src/app/product/product-utils.spec.ts`.

## Schema specs (`shared/src/schemas/<domain>-<kind>.spec.ts`)

One spec per exported schema (`-id`, `-request`, `-list`, ...). Use `schemaTesterFactory<T>(schema)` from
`@household/shared/common/schema-utils`; it registers the `it` blocks for you:

```ts
describe('Account schema', () => {
  const tester = schemaTesterFactory<Requests.Account>(schema);

  tester.validateSuccess(testDataFactory.account.request());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({ ...testDataFactory.account.request(), extra: 1 } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(testDataFactory.account.request({ name: undefined }), 'name');
      tester.type(testDataFactory.account.request({ name: 1 as any }), 'name', 'string');
      tester.minLength(testDataFactory.account.request({ name: '' }), 'name', 1);
    });
  });
});
```

- Always: `validateSuccess` with a valid body, then `should deny` -> `if data` (`additionalProperties`) and one
  `if data.<field>` group **per property**.
- Per property, test **every constraint the schema declares** with the matching tester method: `required`, `type`,
  `pattern`, `format`, `enum`, `minLength` / `maxLength`, `minimum` / `maximum` / `exclusiveMinimum` /
  `exclusiveMaximum`, `minItems` / `maxItems`, `dependentRequired`, `formatExclusiveMinimum`... (see `schemaTesterFactory`).
  A constraint in the schema without a tester call is an untested constraint.
- The invalid value is the **one** field overridden on an otherwise valid factory object (`as any` for wrong types).
- Id schemas: `tester.pattern({ accountId: testDataFactory.account.id('not-valid') }, 'accountId')`.
- When a schema changes (new field, tighter constraint), the spec changes in the same commit.

## Converter specs (`shared/src/converters/<domain>-document-converter.spec.ts`)

Real converter from its factory (`let converter: I<Domain>DocumentConverter; converter = <domain>DocumentConverterFactory()`
in `beforeEach`), **frozen time** (rule 5). One `describe` per method (`create`, `update`, `toResponse`, `toReport`,
`toResponseList`, ...), each building the input with `testDataFactory` and comparing the **whole result** with
`toEqual(testDataFactory.<domain>.<shape>({ ...explicit expected fields }))`:

- `create`: with and without `expiresIn` (`expiresAt: undefined` vs `addSeconds(expiresIn)`); fields the converter
  does not set are overridden to `undefined` (`_id: undefined`, computed fields).
- `update`: `testDataFactory.documentUpdate({ update: { $set: { ...body, expiresAt: addSeconds(expiresIn) } } })`
  (plus `$unset` when the converter produces one).
- `toResponse` / `toReport` / `toResponseList`: ids via `get<Domain>Id(doc)`; list = array of the single conversions.
- Cover every branch (optional field present/absent, each entity variant).

## API business-service specs (`api/src/functions/<verb>-<domain>/<verb>-<domain>.service.spec.ts`)

The service is a factory taking the domain service(s) and converter(s); mock **all** of them:

```ts
beforeEach(() => {
  mockAccountService = createMockService('findAccountById', 'updateAccount');
  mockAccountDocumentConverter = createMockService('update');
  service = updateAccountServiceFactory(mockAccountService.service, mockAccountDocumentConverter.service);
});
```

- Success case: stub each collaborator with `mockResolvedValue` / `mockReturnValue`, `await service({...})`, assert the
  result (`toEqual(convertedResponse)`) **and every collaborator call** with `validateFunctionCall(fn, exactArgs)`.
- `describe('should throw error')`: **one `it` per failure the service maps to an `httpErrors` entry** (unable to query,
  not found, unable to save/update/delete, duplicate, ...), stubbing the failing call with
  `mockRejectedValue('this is a mongo error')` / `mockResolvedValue(undefined)`:

  ```ts
  await service({ body, accountId, expiresIn: undefined }).catch(validateError('No account found', 404));
  validateFunctionCall(mockAccountService.functions.findAccountById, accountId);
  validateFunctionCall(mockAccountDocumentConverter.functions.update);   // never reached
  expect.assertions(5);
  ```
- Because the assertion lives in `.catch(validateError(message, status))`, **`expect.assertions(n)` is mandatory** -
  without it a service that does not throw would pass. Count = every `validateFunctionCall` (1 each) +
  `validateError` (1 for the message, +1 when a status code is given) + any other `expect`.
- In each error case, assert the calls made **up to** the failure with their arguments and the calls that must
  **not** have happened with no-arg `validateFunctionCall`.
- The messages/status codes must be the ones in `api/src/common/error-handlers.ts`.

## Lambda handler specs (`....handler.spec.ts`)

```ts
beforeEach(() => {
  mockUpdateAccountService = vi.fn();                 // MockBusinessService<IUpdateAccountService>
  handlerFunction = handler(mockUpdateAccountService);
});

const handlerEvent = {
  body: JSON.stringify(body),
  pathParameters: { accountId } as AWSLambda.APIGatewayProxyEventPathParameters,
  headers: { [headerExpiresIn]: `${expiresIn}` } as AWSLambda.APIGatewayProxyEventHeaders,
} as AWSLambda.APIGatewayProxyEvent;
```

Exactly two cases per handler (add more only if the handler has more branches):
1. `should handle business service error`: `mockService.mockRejectedValue({ statusCode: 418, message })`; assert the
   service was called with the parsed `{ ...pathParameters, body, expiresIn, ... }`, `response.statusCode` equals
   the error's and `JSON.parse(response.body).message` equals its message; `expect.assertions(3)`.
2. `should respond with success`: `mockResolvedValue(result)`; assert the call args and the status (`200` + parsed
   body `toEqual(result)`, `201` for create, `204` for no content); `expect.assertions(n)` = asserts made.

Call the handler as `await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult`.
Query string, path parameters, headers and body in the event must mirror what the handler reads.

## AWS-client wrapper services (`shared/src/services/*.spec.ts`)

Mock the SDK client with `createMockService<Client>('adminInitiateAuth', ...)`, build the service with its factory
(`identityServiceFactory(userPoolId, clientId, mockCognito.service)`), stub the call with
`mockReturnValue(awsResolvedValue(data))` (`awsResolvedValue` mimics `{ promise() }`) and assert the **exact request
parameters** with `toHaveBeenCalledWith`. One `describe` per service method, plus one `it` per branch / error mapping.

## Review checklist

- [ ] All data from `testDataFactory`; all collaborators mocked with `createMockService` / `vi.fn()` in `beforeEach`.
- [ ] Time frozen where the unit reads the clock.
- [ ] Schema spec: every property and every declared constraint has a tester call; `additionalProperties` present.
- [ ] Converter spec: every method, with and without `expiresIn`, whole-object `toEqual`.
- [ ] Service spec: success + one case per `httpErrors` failure; calls and no-calls asserted; `expect.assertions(n)` correct.
- [ ] Handler spec: business-error case and success case with exact status codes.
- [ ] No `.only` / `.skip`; tests pass with `npx vitest run <file> --no-coverage` and `yarn lint` is clean.

## Reference specs

`shared/src/schemas/account-request.spec.ts`, `account-id.spec.ts`; `shared/src/converters/account-document-converter.spec.ts`;
`api/src/functions/update-account/*.spec.ts` (mutation), `get-account/*.spec.ts` (query);
`shared/src/services/identity-service.spec.ts`; `shared/src/common/utils.spec.ts`;
`web/projects/household/src/app/product/product-utils.spec.ts`.
