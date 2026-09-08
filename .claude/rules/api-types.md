# api-types

Domain type/schema pattern that binds a domain's TypeScript types, its AJV request-validation
schemas, and its OpenAPI documentation to one source of truth. Unchecked domains below still use
the older, monolithic approach described under "Legacy pattern" — use `Account` as the reference
implementation, don't copy the legacy pattern for new work.

## Migration status

Keep this list current — check a domain off here in the same change that migrates it.

- [x] Account
- [ ] Calendar
- [ ] Category
- [ ] Customer
- [ ] File
- [ ] Price
- [ ] Product
- [x] Project
- [ ] Recipient
- [ ] Setting
- [ ] Transaction
- [ ] User

## Why this exists

Previously a domain's types, its AJV validation schema, and its hand-written OpenAPI YAML were
three independently hand-maintained artifacts that only stayed in sync by convention. The
`Account` pattern collapses this: one small hand-written schema object per field, composed with
a `combine()` helper, typed against a shared field-type namespace — and that same composed
object is reused directly as both the AJV runtime validator and the OpenAPI `SchemaObject`.
Change a field once, and validation, docs, and types all move together.

## The layers

Each layer lives in its own file/folder, named after the domain in lowercase-kebab-case for
files and PascalCase for the namespace. `Account` is used as the example domain throughout.

### 1. `shared/src/types/api.ts` — atomic field types

One `namespace Api.<Domain>` holding a type per *field*, plus a branded `Id` and a `Base`
composite of the writable/required fields:

```ts
export namespace Api {
  export namespace Account {
    export type Id = Branding<string, 'account'>;
    export type AccountId = { accountId: Id };
    export type IsOpen = { isOpen: boolean };
    export type Name = { name: string };
    export type Currency = { currency: string };
    export type AccountType = { accountType: Enum.AccountType };
    export type Owner = { owner: string };
    export type FullName = { fullName: string };
    export type Balance = { balance: number };

    export type Base = Name & Currency & AccountType & Owner;
  }
}
```

Every other layer is composed from these pieces with `&` — never re-declare a field's shape
anywhere else.

### 2. `shared/src/types/requests.ts` — request body shape

```ts
export namespace Requests {
  export type Account = Api.Account.Base;
}
```

Usually just `Api.<Domain>.Base`, narrower if some writable fields aren't part of the create/
update body.

### 3. `shared/src/types/responses.ts` — API response shape(s)

```ts
export namespace Responses {
  export type AccountLean = Api.Account.Base & Api.Account.IsOpen & Api.Account.AccountId & Api.Account.FullName;
  export type Account = AccountLean & Api.Account.Balance;
  export type AccountReport = Api.Account.AccountId & Api.Account.FullName & Api.Account.Currency;
}
```

Add a variant (`<Domain>Lean`, `<Domain>Report`, ...) per distinct shape some converter's
`toResponse`/`toReport` actually produces — it doesn't need a dedicated endpoint of its own.
`AccountReport` is a real example: nothing calls `GET /account/.../report` directly, but
`account-document-converter.ts`'s `toReport` returns it, and it's embedded inside `Transaction`'s
(still legacy-pattern) report response.

### 4. `shared/src/types/documents.ts` — MongoDB persisted shape

```ts
export namespace Documents {
  type Id = { _id: Types.ObjectId };
  type Timestamps = { expiresAt: Date; createdAt?: Date; updatedAt?: Date };

  export type Account = Id & Timestamps & Api.Account.Base & Partial<Api.Account.Balance> & Api.Account.IsOpen;
}
```

`Id`/`Timestamps` are local to this file (every document gets them); everything else composes
from `api.ts`. Fields that are computed/derived rather than stored (e.g. `balance`, which is
aggregated from transactions) are `Partial<...>` here even though they're required on the
response.

### 5. `shared/src/types/schema.ts` — the schema type

Generic, domain-agnostic. `StrictSchema<T>` is a **conditional type** that dispatches on `T`'s
actual shape — `T extends string ? StringSchema : T extends number ? NumberSchema : T extends
boolean ? BooleanSchema : T extends any[] ? ArraySchema<T[0]> : T extends object ?
ObjectSchema<T> : never`. `ObjectSchema<T>` is the branch used for whole-record schemas — its
`properties` are checked against `T`'s actual keys, so a typo or a missing/extra property fails
to compile. Nothing domain-specific belongs here; don't touch this file when adding a domain.

This used to be a flat union of all five branches instead of a conditional type, which made
every property's declared type a 5-way union even when the actual field was e.g. always a
string — that's what caused the cast requirement described in layer 13. Dispatching on `T`
means `StrictSchema<string>` resolves to exactly `StringSchema`, a concrete non-recursive type,
so `tsc` can prove assignability directly instead of needing to unwind a self-referential union.

### 6. `shared/src/common/schema-utils.ts` — `combine()`

```ts
export const combine = <T>(schemas: ObjectSchema<T>[], overrides?: { required?: (keyof T)[]; optional?: (keyof T)[] }): ObjectSchema<T> => { ... }
```

Merges several single-field `ObjectSchema`s into one: unions their `properties`, unions their
`required`, then applies `overrides`. This is the `allOf`-composition replacement — unlike
`allOf`, the same base schemas can be required in one composition and optional in another.

### 7. `shared/src/schemas/<domain>.ts` — the schemas themselves

One `ObjectSchema<Api.<Domain>.<Field>>` per field, then `combine()`d composites matching each
`requests.ts`/`responses.ts` shape:

```ts
export const accountId: ObjectSchema<Api.Account.AccountId> = { type: 'object', additionalProperties: false, required: ['accountId'], properties: { accountId: { type: 'string', pattern: '^[a-zA-Z0-9]{24}$' } } };
const name: ObjectSchema<Api.Account.Name> = { ... };
// ...one per field...

const base = combine<Api.Account.Base>([name, currency, accountType, owner]);
export const leanResponse = combine<Responses.AccountLean>([accountId, isOpen, base, fullName]);
export const response = combine<Responses.Account>([leanResponse, balance]);
export const report = combine<Responses.AccountReport>([accountId, fullName, currency]);
export const request = combine<Requests.Account>([base]);
```

These exports are consumed by **three** different things — this is the core of the pattern:

- **AJV request validation** — passed straight into `apiRequestValidator({ body, pathParameters })`
  in a function's `*.index.ts` (see layer 10).
- **OpenAPI documentation** — embedded directly into a `specs/paths/**/*.ts` `PathItemObject`
  (layer 12), no cast needed — see layer 13.
- **Compile-time safety** — mismatched keys against the `Api`/`Requests`/`Responses`/`Documents`
  type fail `tsc`, so validator/docs/types cannot silently drift apart.

A field-level schema can be reused directly too: `Account.accountId.properties.accountId` pulls
the plain `{type: 'string', pattern: ...}` schema out of the whole-record `accountId` object —
useful for a path parameter that validates the same field a body schema also carries.

Not every request body is object-shaped — a merge-style endpoint (`Project`'s `merge-projects`,
also present on `Recipient`/`Product`/`Category` in the legacy pattern) takes a bare JSON array
of ids. For that, skip `combine()` (it only produces `ObjectSchema<T>`) and write the array
schema directly against the exported `StrictSchema<T>`:

```ts
export const idList: StrictSchema<Api.Project.Id[]> = {
  type: 'array',
  minItems: 1,
  items: projectId.properties.projectId,
};
```

`StrictSchema<T>` and `ObjectSchema<T>` are both exported from `schema.ts` for exactly this —
`IValidatorService.validate` (`shared/src/services/validator-service.ts`) and
`apiRequestValidator`'s `RequestSchemaTypes` (`api/src/handlers/api-request-validator.handler.ts`)
both accept `StrictSchema<any>` (not just `ObjectSchema<any>`) so an array-typed `body` schema
type-checks through the same `apiRequestValidator({ body })` wiring as everything else.

### 8. `shared/src/mongodb-schemas/<domain>.schema.ts` — mongoose schema

A plain `new Schema<Documents.<Domain>>({...})`. This is mongoose's own schema DSL (validators,
indexes, defaults) — unrelated to `ObjectSchema`/AJV, just typed against the same `Documents.*`
shape.

### 9. `shared/src/converters/<domain>-document-converter.ts` — shape conversion

Interface + factory converting between shapes: `create`/`update` (`Requests.<Domain>` →
`Documents.<Domain>`), `toResponse`/`toResponseList` (`Documents.<Domain>` →
`Responses.<Domain>`), `toReport` (`Documents.<Domain>` → `Responses.<Domain>Report`) if some
other domain's report response embeds this one.

### 10. `shared/src/services/<domain>-service.ts` — persistence

Mongo CRUD (`saveAccount`, `findAccountById`, `updateAccount`, ...) operating on
`Documents.<Domain>`. No knowledge of requests/responses/schemas.

### 11. `shared/src/dependencies/{converters,services}/<domain>-*.ts` — composition root

One-line files instantiating the factories from layers 9–10 with their real dependencies
(`mongodbService`, etc.) into a singleton — `accountDocumentConverter`, `accountService`. These
singletons, not the factories, are what function wiring (layer 12) imports.

### 12. `api/src/functions/<verb>-<domain>/*` — one folder per endpoint

- `*.service.ts` — business-logic interface + factory, talks to the domain service/converter
  (layer 9–10).
- `*.handler.ts` — Lambda handler: API-Gateway-event ↔ service call.
- `*.index.ts` — wiring: `index({ handler, before: [...], after: [...] })`, where `before`
  includes `authorizer(...)` (when writes require it) and
  `apiRequestValidator({ body, pathParameters })` referencing the **exact same schema exports**
  from layer 7:

  ```ts
  import { request as body } from '@household/shared/schemas/account';
  // ...
  apiRequestValidator({ body })
  ```

  ```ts
  import { accountId as pathParameters } from '@household/shared/schemas/account';
  // ...
  apiRequestValidator({ pathParameters })
  ```

### 13. `specs/paths/<domain>/<verb>-<domain>.ts` + `specs/index.ts` — OpenAPI docs

One `PathItemObject` per HTTP verb on a path, built from the **same** layer-7 schema exports:

```ts
import { PathItemObject } from 'openapi3-ts/oas32';
import * as Account from '@household/shared/schemas/account';

export const createAccount: PathItemObject = {
  post: {
    tags: ['Account'],
    requestBody: { content: { 'application/json': { schema: Account.request } } },
    responses: { 201: { description: 'Account created', content: { 'application/json': { schema: Account.accountId } } } },
  },
};
```

Registered onto a path in `specs/index.ts`:

```ts
.addPath('/account/v1/accounts', { ...listAccounts, ...createAccount })
.addPath('/account/v1/accounts/{accountId}', { ...getAccount, ...updateAccount, ...deleteAccount })
```

Run `yarn generate:specs` (`tsx specs/index.ts`) to (re)write the JSON/YAML output file that
`specs/index.ts` currently targets — check the `writeFileSync(...)` call there for the current
output path/format, it has changed a few times.

A layer-7 export (whole-record or a single `.properties.<field>`) assigns straight into a
`SchemaObject`-typed slot — **no `as SchemaObject` cast needed**, and don't add one. This used
to require a cast (see layer 5's note on the old union-based `StrictSchema<T>`); confirmed by
assigning `Account.request`, `Account.accountId`, `Account.accountId.properties.accountId`,
`Account.response`, and `Account.leanResponse` all directly to a `SchemaObject`-typed variable
with `tsc -p tsconfig.build.json --noEmit`. If a *different* schema source doesn't assign
cleanly (e.g. anything typed via the legacy `StrictJSONSchema7<T>` from
`shared/src/types/common.ts` — a real, unrelated structural mismatch against openapi3-ts's
`SchemaObject`, not a fluke), that's a sign it isn't a layer-7 export and shouldn't be reused in
a `specs/paths/**` file in the first place — pull the field out of the domain's own layer-7
schema instead of reaching for an old-pattern partial.

### 14. Errors — `api/src/common/error-handlers.ts`

`httpErrors.<domain>.*` — one factory per failure mode (`getById`, `notFound`, `save`, `update`,
`delete`, `multipleNotFound`, ...), typed against `Api.<Domain>.AccountId`/`Documents.<Domain>`.
Add new domains under a new `httpErrors.<domain>` key following the existing entries' shape.

### 15. Test data — `shared/src/common/test-data-factory.ts`

`create<Domain>Id`, `create<Domain>Document`, `create<Domain>Request`, `create<Domain>Response`,
`create<Domain>Report` (if applicable) — faker-backed builders typed against the layer 1–4
types, used across `*.spec.ts` files instead of hand-rolled fixtures.

## Adding a new domain: the recipe

1. **`api.ts`** — add `namespace Api.<Domain>` with one type per field, a branded `Id`, and a
   `Base` composite of the writable fields.
2. **`requests.ts`** — add `Requests.<Domain>` (usually `= Api.<Domain>.Base`).
3. **`responses.ts`** — add `Responses.<Domain>` (and any lean/report variants an endpoint
   actually needs) composed with `&` from `Api.<Domain>.*`.
4. **`documents.ts`** — add `Documents.<Domain>` = local `Id & Timestamps & ...Api.<Domain>.*`,
   wrapping computed-only fields in `Partial<...>`.
5. **`shared/src/schemas/<domain>.ts`** — one `ObjectSchema<Api.<Domain>.<Field>>` per field,
   then `combine()` the composites matching every shape from steps 2–3.
6. **`shared/src/mongodb-schemas/<domain>.schema.ts`** — mongoose `Schema<Documents.<Domain>>`.
7. **`shared/src/converters/<domain>-document-converter.ts`** + a one-line singleton under
   `shared/src/dependencies/converters/`.
8. **`shared/src/services/<domain>-service.ts`** + a one-line singleton under
   `shared/src/dependencies/services/`.
9. **`api/src/functions/<verb>-<domain>/`** — one folder per endpoint (`*.service.ts`,
   `*.handler.ts`, `*.index.ts`), validator schemas imported from step 5.
10. **`api/src/common/error-handlers.ts`** — add an `httpErrors.<domain>` block.
11. **`shared/src/common/test-data-factory.ts`** — add the `create<Domain>*` builders.
12. **`specs/paths/<domain>/<verb>-<domain>.ts`** — one `PathItemObject` per endpoint from step
    9, embedding the layer-5 schema exports directly (no cast); wire into `specs/index.ts`.
13. Wire the SAM/CloudFormation route (`sam.<domain>.yaml` or equivalent) to the new Lambda —
    unrelated to this pattern but needed for the endpoint to actually exist.
14. **`test/`** (the Playwright suite) — replace every remaining `<Domain>.<Member>` reference
    from the legacy `types.ts` namespace with its new-pattern equivalent, the same mapping as
    everywhere else (`Document`→`Documents.<Domain>`, `Request`→`Requests.<Domain>`,
    `Response`→`Responses.<Domain>`, `Report`→`Responses.<Domain>Report`, everything else→
    `Api.<Domain>.<Member>`). In practice:
    - Find every file: `grep -rln "from '@household/shared/types/types'" test/ | xargs grep -l
      '<Domain>\.'`.
    - Substitute with a **word-boundary-aware** regex (`\b<Domain>\.<Member>\b` per member, in
      Python or similar — not `sed`; macOS/BSD `sed` silently drops `\b` with no error, so a
      pattern like `Account\.Id\b` matches *nothing* instead of failing loudly, and a plain
      substring replace without any boundary check will corrupt unrelated identifiers like
      `loanAccount.accountType`). Check the substitution actually landed (`grep` for the old
      pattern afterward) rather than trusting silent success.
    - Run `tsc -p tsconfig.json --noEmit` (covers `test/` without `web/`'s unrelated noise) —
      every `Cannot find namespace 'Api'/'Documents'/'Requests'/'Responses'` error names exactly
      the file and the import to add. Drop the old `<Domain>` import from
      `@household/shared/types/types` in each fixed file if nothing else in it still needs it
      (check for `(?<!\.)\b<Domain>\b` — a lookbehind excluding `.`-prefixed matches like
      `Api.Project` — since `tsc` won't flag an import as merely unused).
    - Finish with `yarn lint` (0 errors expected) and `yarn test:api` (only confirms `shared`/`api`
      unit tests still pass — the Playwright suite itself needs a live backend and isn't run
      here, so this step is a pure type-safety migration, not a behavior-verified one).

**Scope of one pass**: steps 1–14 are the domain's own layers, `test/` included. One thing is
deliberately *not* part of migrating a domain, and should be flagged to the user as available
follow-up work rather than done silently in the same pass: other domains'/`Transaction`'s
converters, services, and `error-handlers.ts` entries that reference the migrated domain's
`Document`/`Response` through `Transaction`'s still-legacy types (see "Legacy pattern" below) —
that's cross-domain cleanup belonging to whichever domain migrates next (`Transaction` itself,
ultimately), not to this one.

## Legacy pattern — do not replicate

`shared/src/types/types.ts` has one `namespace <Domain>` per domain holding *every* shape
(`Id`, field types, `Document`, `Response`, `Request`, `Report`, all intersected together in one
file), paired with hand-written AJV-only schemas in `shared/src/schemas/<domain>-id.ts` /
`<domain>-request.ts` typed via `StrictJSONSchema7<T>` (`shared/src/types/common.ts`) — a
JSON-Schema-only type with no OpenAPI story at all. See "Migration status" above for which
domains are still on this.

Once a domain migrates, mark its `namespace <Domain>` in `types.ts` `@deprecated` — but do not
delete it or its `Id`/field types/`Base`/`Document`/`Response`/`Report`: `Transaction`'s
composite types are themselves still unmigrated and embed `<Domain>.Document`, `<Domain>
.Response`, and `<Domain>.Report` via a generic `<Domain><T>` wrapper local to `namespace
Transaction` (e.g. `Account<Account.Document>`, `Project<Project.Response>` — confirmed by
grepping `types.ts` for `<Domain><<Domain>.` before assuming otherwise). Only `Request` reliably
has zero remaining consumers once a domain's own layers stop using it — comment that one out
(`// export type Request = Base;`), not delete, so it stays visible as "removed, not forgotten."
The three legacy AJV schema files for the domain (`<domain>-id.ts`, `<domain>-id-list.ts` if it
has one, `<domain>-request.ts`) usually stay too, retyped to the new `Api.<Domain>.*`/
`Requests.<Domain>` types and marked `@deprecated` — other still-unmigrated domains' legacy
schemas often import them directly (e.g. `transaction-payment-request.ts` imports
`project-id.ts`) and must keep working unchanged.

`@typescript-eslint/no-deprecated` (`.eslintrc.json`) will flag any *new* code that references a
deprecated namespace — that lint rule firing on a domain you're touching is the signal that
migration work is needed there. Expect it to keep firing inside `types.ts` itself (`Transaction`'s
embedding, described above) and inside `Transaction`'s own converters/services/`error-handlers.ts`
entries that consume a migrated domain's document/response through `Transaction`'s still-legacy
types — that cross-domain cleanup is a separate follow-up belonging to `Transaction`'s own
migration, not to the domain you just finished (recipe step 14 already covers `test/`, so no
`no-deprecated` warnings for the migrated domain should remain there).
