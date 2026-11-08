---
name: angular-pipe-tests
description: How to write and review unit tests for pure Angular pipes (classes implementing PipeTransform with no injected dependencies, e.g. PaginatePipe, MinutesToHourPipe, TimeSlotToTimePipe, AccountTypeIconPipe, CategoryTypeIconPipe) in the web/ projects - the pipe is instantiated with `new` and driven through `it.each` tables, with no TestBed. Use whenever creating, extending, reviewing or fixing a `*-pipe.spec.ts` under web/projects. Plain helper functions use generic-unit-tests; components use angular-render-tests.
---

# Pipe tests: `new Pipe()` and `it.each`

A pure pipe is a function wrapped in a class, so its spec needs no `TestBed`, no mocks and no fixture. The pipe is
created once at `describe` scope and every case is a row of an `it.each` table (input -> expected output).

Components and directives use `angular-render-tests`; plain exported functions (utils) use `generic-unit-tests`.
A pipe that injects services is not pure: test it through a host component with `angular-render-tests`.

## The shape

```ts
import { MinutesToHourPipe } from './minutes-to-hour-pipe';

describe('MinutesToHourPipe', () => {
  const pipe = new MinutesToHourPipe();

  it.each([
    [
      0,
      '0:00',
    ],
    [
      65,
      '1:05',
    ],
    [
      1500,
      '25:00',
    ],
  ])('should convert %s minutes to %s', (totalMinutes, time) => {
    expect(pipe.transform(totalMinutes)).toBe(time);
  });
});
```

Domain inputs come from `testDataFactory`, overriding only the field the pipe reads:

```ts
it.each([
  [CategoryType.Regular, 'category'],
  [CategoryType.Inventory, 'inventory_2'],
])('should return the icon of the %s category type', (categoryType, icon) => {
  expect(pipe.transform(testDataFactory.category.response({ categoryType }))).toBe(icon);
});
```

## Rules

- `describe('<PipeClassName>')`, with `const pipe = new <PipeClassName>()` inside it. No `TestBed`, no `beforeEach`
  (a pure pipe has no state to reset).
- **One `it.each` table per behavior**: rows are `[input..., expected]`, each row is multi-line (the repo's
  eslint `object-curly-newline` / array rules require it). Put the input(s) first and the expected value last.
- **Test names start with `should`** and use `%s` for the row values: `should convert %s minutes to %s`,
  `should return the icon of the %s account type`. The name reads as a sentence for every row.
- **Cover the boundaries and every branch of the pipe**: zero / first / last value, padding, values past a unit
  boundary (more than a day, a page past the end), and one row per value of an enum the pipe switches on - when a
  new enum member is added, a new row is added.
- Behavior that does not fit a table (e.g. "does not mutate the input") is a plain `it('should ...')` next to it.
- `toBe` for primitives, `toEqual` for arrays / objects.
- Use `testDataFactory` for domain objects instead of hand-built literals; pass only the overridden field.
- No `.only`, no `.skip`, no "create an instance" placeholder (`expect(pipe).toBeTruthy()` tests nothing).

## Review checklist

- [ ] No `TestBed`; the pipe is instantiated once at `describe` scope.
- [ ] Every behavior is an `it.each` table with `should ... %s` names; rows are multi-line.
- [ ] Boundary values and every enum member / branch of the pipe have a row.
- [ ] Domain inputs are built with `testDataFactory`.
- [ ] No placeholder "should create" test.

## Reference specs

`web/projects/household/src/app/account/account-type-icon-pipe.spec.ts` and
`category/category-type-icon-pipe.spec.ts` (enum tables with `testDataFactory`);
`web/projects/hairdressing/src/app/pipes/*.spec.ts` (numeric tables, plus a non-mutation `it` in `paginate-pipe`).
