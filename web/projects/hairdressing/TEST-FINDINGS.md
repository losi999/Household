# Hairdressing test findings

Findings from writing the unit tests of the hairdressing project (and the interceptors of the shared project)
with the `angular-render-tests`, `angular-store-tests`, `angular-service-tests`, `angular-guard-tests` and
`angular-interceptor-tests` skills. Nothing listed here has been fixed in the source; the tests describe the
current behavior unless noted.

## Source bugs and oddities

### Likely bugs

| Where | Finding |
|---|---|
| `src/state/calendar/with-calendar-api-events.ts` | `listCalendarDays` has `catchError` on the outer stream, so a single API error ends the handler and every later `listCalendarDaysInitiated` is ignored. The other handlers catch inside `mergeMap`. Not covered by a test yet. |
| `src/state/customer/with-customer-api-events.ts` | The add/delete blacklist handlers use `groupBy` on the payload array, which groups by array reference, so `exhaustMap` never drops duplicate requests. |
| `src/app/calendar/calendar-entry-paying-dialog` | Saving without choosing cash or transfer closes with `PendingTransfer` (`onSubmit` falls into the `else` branch). A test records this behavior. |
| `src/app/calendar/calendar-entry-edit-dialog` | `entryWarnings` calls `isWeekend(this.calendarDay().day)` without `?.`, so it throws for a work entry when the store has no day loaded yet. |
| `src/app/calendar/calendar-entry-edit-dialog` | `createDate('YYYY-MM-DD')` parses as UTC while `dateToISODateString` uses local getters; in negative-UTC timezones the day shifts. Tests pass in CET only. |
| `src/app/customer/customer-add-to-blacklist-dialog` | `onSave` does not mark the field as touched (unlike the other dialogs), so saving with nothing selected closes nothing and shows no "Kötelező" error. |
| `src/app/price/price-autocomplete-input` | Does not call `updateErrorState()` when `errors` or `touched` change (`ClearableInput` does), so `mat-error` appears only after the next view check, e.g. typing. |
| `src/state/customer/with-customer-reducer.ts` | `createCustomerJobCompleted` / `updateCustomerJobCompleted` build the job from `priceList.find(...)`; if the price is missing, `...price` spreads `undefined` and the job gets a price entry with only `quantity`. |

### Smaller oddities

- `src/app/shared/job-price-calculator`: `JobPriceCalculator.value` is `model<...>()` without a default, so `excludedPriceIds`, `total` and the template throw if the value is not set. The exported `requiredPrices(field, min, config)` never uses `min`. The `@for` in the additional-price block of the template is mis-indented (cosmetic).
- `src/app/price/price-autocomplete-input`: leftover `console.log('onselected')` in `optionSelected`; `onBlur` sets the value to `null` for a mismatched name (tested as is).
- `src/state/calendar`: `calendarEvents.setCashPaymentDialog` is declared but has no handler or reducer case. `openCalendarEntryDialog` returns `undefined` for Pay/NoShow on a non-work entry and relies on it being swallowed.
- `src/app/customer/customer-details`: `upcomingEntries` / `pastEntries` read `this.customer().customerId` and would throw for a missing customer (the template's `@if(customer())` guards it). Works whose `day` equals "now" belong to neither list. The blacklist delete buttons have no `data-testId` (found by their `danger` class).
- `src/app/customer/customer-jobs-home`: the last column's header has `mat-sort-header` on an empty column (clickable, meaningless).

## Fixed during the work (shared project)

- `authInterceptor`: calls waiting for a token refresh started by another call never ended when the refresh failed.
  The shared refresh is now one `share()`d observable; the module-level flag and `Subject` are gone.
- `progressInterceptor`: a cancelled request never dispatched `processFinished`, leaving the progress counter up.
  It now finishes once on response, error or cancellation and starts only once per request.

## Test infrastructure

- **`elementSelectorFactory` ignores a `Type` or string passed as the first nesting argument**
  (`web/projects/shared/src/lib/testing/element-selector.ts`): `getComponent(X, SomeStub)` searches from the root.
  Only a `DebugElement` parent narrows the search. Several specs therefore match the first matching element in the
  whole fixture (e.g. the save buttons in the customer dialogs, toolbar buttons in customer-home / customer-details).
- **No `data-testId` in the hairdressing templates**: specs select by CSS or by component type
  (login, price dialog, customer-details). Adding test ids would make them sturdier.
- **Menu items live in the CDK overlay**, which the selector cannot reach: `main-menu.spec.ts` reads
  `document.querySelectorAll('[mat-menu-item]')`, `customer-autocomplete-input.spec.ts` reads the options through the
  `MatAutocompleteTrigger` injector.
- **`localStorage` is `undefined` in tests** (Node 26's experimental `localStorage` hides jsdom's without
  `--localstorage-file`). Use `stubLocalStorage()` from `@household/shared-ui`.
- **Dates**: the calendar specs freeze `Date` to 2026-11-10 (`vi.useFakeTimers({ toFake: ['Date'] })`). The test
  environment has no Hungarian locale, so dates are asserted in en-US form (e.g. `2026. November 20., Friday`);
  Hungarian UI strings are asserted exactly.
- **Missing test data builder**: `testDataFactory` has no builder for `Responses.CustomerJobCost` (built inline in
  `job-price-summary.spec.ts`) and no `'kg'`-style price unit (valid units are `db`, `g`, `óra`).
- **Running a subset**: `--include='**/app/x/**'` also matches `.html` / `.scss` and breaks the build
  ("No loader is configured"). Use `--include='**/app/x/**/*.spec.ts'` (or `**/state/x/*.spec.ts`).

## Not covered

- `calendar-entry-edit-dialog`: real datepicker popup and slider drag (the slider is checked via `max` and the time text).
- `calendar-home`: the pending job's `routerLink` close button is only checked for presence.
- `customer-autocomplete-input`: the `setTimeout` blur after `optionSelected` (needs the overlay and a timer).
- `toolbar`: the `ng-content` projection. `job-price-calculator`: the exported `requiredPrices` validator.
- `with-calendar-api-events`: the `listCalendarDays` error-termination bug above.

## Weak tests worth revisiting

- `with-customer-events.spec.ts`: a small test that price-filter and sort events open no dialogs.
- `customer-store.spec.ts`: a test that only checks the mocked `PriceStore` provider works.
- `paying-dialog` spec: records the `PendingTransfer` behavior above; change it together with the fix.
