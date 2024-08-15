import { default as schema } from '@household/shared/schemas/report-request';
import { Report } from '@household/shared/types/types';
import { createReportAccountFilter, createReportCategoryFilter, createReportIssuedAtFilter, createReportProductFilter, createReportProjectFilter, createReportRecipientFilter } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Report request schema', () => {
  const tester = jsonSchemaTesterFactory<Report.Request>(schema);

  tester.validateSuccess([
    createReportAccountFilter(),
    createReportProductFilter(),
    createReportCategoryFilter(),
    createReportProjectFilter(),
    createReportRecipientFilter(),
    createReportIssuedAtFilter(),
    createReportIssuedAtFilter({
      from: undefined,
    }),
    createReportIssuedAtFilter({
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
            ...createReportAccountFilter(),
            extra: 1,
          } as any,
        ], 'data/0');

        tester.required([
          {
            ...createReportIssuedAtFilter(),
            from: undefined,
            to: undefined,
          },
        ], 'from');

        tester.required([
          {
            ...createReportIssuedAtFilter(),
            from: undefined,
            to: undefined,
          },
        ], 'to');
      });

      describe('if data[0].include', () => {
        tester.required([
          {
            ...createReportAccountFilter(),
            include: undefined,
          } as any,
        ], 'include');

        tester.type([
          {
            ...createReportAccountFilter(),
            include: 1 as any,
          } as any,
        ], 'include', 'boolean');
      });

      describe('if data[0].filterType', () => {
        tester.required([
          {
            ...createReportAccountFilter(),
            filterType: undefined,
          },
        ], 'filterType');

        tester.type([
          {
            ...createReportAccountFilter(),
            filterType: 1 as any,
          },
        ], 'filterType', 'string');

        tester.enum([
          {
            ...createReportAccountFilter(),
            filterType: 'not enum' as any,
          },
        ], 'filterType');
      });

      describe('if data[0].items', () => {
        tester.required([
          {
            ...createReportAccountFilter(),
            items: undefined,
          },
        ], 'items');

        tester.type([
          {
            ...createReportAccountFilter(),
            items: 1 as any,
          },
        ], 'items', 'array');

        tester.minItems([
          {
            ...createReportAccountFilter(),
            items: [],
          },
        ], 'items', 1);
      });

      describe('if data[0].items[0]', () => {
        tester.type([
          {
            ...createReportAccountFilter(),
            items: [1 as any],
          },
        ], 'items/0', 'string');

        tester.pattern([
          {
            ...createReportAccountFilter(),
            items: ['not mongo id' as any],
          },
        ], 'items/0');
      });

      describe('if data[0].from', () => {
        tester.type([
          {
            ...createReportIssuedAtFilter(),
            from: 1 as any,
          },
        ], 'from', 'string');

        tester.format([
          {
            ...createReportIssuedAtFilter(),
            from: 'not-date',
          },
        ], 'from', 'date-time');
      });

      describe('if data[0].to', () => {
        tester.type([
          {
            ...createReportIssuedAtFilter(),
            to: 1 as any,
          },
        ], 'to', 'string');

        tester.format([
          {
            ...createReportIssuedAtFilter(),
            to: 'not-date',
          },
        ], 'to', 'date-time');

        tester.formatExclusiveMinimum([
          {
            ...createReportIssuedAtFilter(),
            to: new Date(2022, 10, 1).toISOString(),
            from: new Date(2023, 10, 1).toISOString(),
          },
        ], 'to');
      });
    });
  });
});
