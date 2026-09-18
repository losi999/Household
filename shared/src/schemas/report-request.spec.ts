import { request as schema } from '@household/shared/schemas/report';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Requests } from '@household/shared/types/requests';

describe('Report request schema', () => {
  const tester = schemaTesterFactory<Requests.Report>(schema);

  tester.validateSuccess([
    testDataFactory.report.filter.account(),
    testDataFactory.report.filter.product(),
    testDataFactory.report.filter.category(),
    testDataFactory.report.filter.project(),
    testDataFactory.report.filter.recipient(),
    testDataFactory.report.filter.issuedAt(),
    testDataFactory.report.filter.issuedAt({
      from: undefined,
    }),
    testDataFactory.report.filter.issuedAt({
      to: undefined,
    }),
  ]);

  describe('should deny', () => {
    describe('if data', () => {
      tester.type({
        extra: 1,
      } as any, 'data', 'array');

      tester.minItems([], 'data', 1);

      describe('if data[0]', () => {
        tester.additionalProperties([
          {
            ...testDataFactory.report.filter.account(),
            extra: 1,
          } as any,
        ], 'data/0');

        tester.required([
          {
            ...testDataFactory.report.filter.issuedAt(),
            from: undefined,
            to: undefined,
          },
        ], 'from');

        tester.required([
          {
            ...testDataFactory.report.filter.issuedAt(),
            from: undefined,
            to: undefined,
          },
        ], 'to');
      });

      describe('if data[0].include', () => {
        tester.required([
          {
            ...testDataFactory.report.filter.account(),
            include: undefined,
          } as any,
        ], 'include');

        tester.type([
          {
            ...testDataFactory.report.filter.account(),
            include: 1 as any,
          } as any,
        ], 'include', 'boolean');
      });

      describe('if data[0].filterType', () => {
        tester.required([
          {
            ...testDataFactory.report.filter.account(),
            filterType: undefined,
          },
        ], 'filterType');

        tester.type([
          {
            ...testDataFactory.report.filter.account(),
            filterType: 1 as any,
          },
        ], 'filterType', 'string');

        tester.enum([
          {
            ...testDataFactory.report.filter.account(),
            filterType: 'not enum' as any,
          },
        ], 'filterType');
      });

      describe('if data[0].items', () => {
        tester.required([
          {
            ...testDataFactory.report.filter.account(),
            items: undefined,
          },
        ], 'items');

        tester.type([
          {
            ...testDataFactory.report.filter.account(),
            items: 1 as any,
          },
        ], 'items', 'array');

        tester.minItems([
          {
            ...testDataFactory.report.filter.account(),
            items: [],
          },
        ], 'items', 1);
      });

      describe('if data[0].items[0]', () => {
        tester.type([
          {
            ...testDataFactory.report.filter.account(),
            items: [1 as any],
          },
        ], 'items/0', 'string');

        tester.pattern([
          {
            ...testDataFactory.report.filter.account(),
            items: ['not mongo id' as any],
          },
        ], 'items/0');
      });

      describe('if data[0].from', () => {
        tester.type([
          {
            ...testDataFactory.report.filter.issuedAt(),
            from: 1 as any,
          },
        ], 'from', 'string');

        tester.format([
          {
            ...testDataFactory.report.filter.issuedAt(),
            from: 'not-date',
          },
        ], 'from', 'date-time');
      });

      describe('if data[0].to', () => {
        tester.type([
          {
            ...testDataFactory.report.filter.issuedAt(),
            to: 1 as any,
          },
        ], 'to', 'string');

        tester.format([
          {
            ...testDataFactory.report.filter.issuedAt(),
            to: 'not-date',
          },
        ], 'to', 'date-time');

        tester.formatExclusiveMinimum([
          {
            ...testDataFactory.report.filter.issuedAt(),
            to: new Date(2022, 10, 1).toISOString(),
            from: new Date(2023, 10, 1).toISOString(),
          },
        ], 'to');
      });
    });
  });
});
