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
      tester.validateSchemaType({
        extra: 1,
      } as any, 'data', 'array');

      tester.validateSchemaMinItems([], 'data', 1);

      describe('if data[0]', () => {
        tester.validateSchemaAdditionalProperties([
          {
            ...createReportAccountFilter(),
            extra: 1,
          } as any,
        ], 'data/0');

        tester.validateSchemaRequired([
          {
            ...createReportIssuedAtFilter(),
            from: undefined,
            to: undefined,
          },
        ], 'from');

        tester.validateSchemaRequired([
          {
            ...createReportIssuedAtFilter(),
            from: undefined,
            to: undefined,
          },
        ], 'to');
      });

      describe('if data[0].include', () => {
        tester.validateSchemaRequired([
          {
            ...createReportAccountFilter(),
            include: undefined,
          } as any,
        ], 'include');

        tester.validateSchemaType([
          {
            ...createReportAccountFilter(),
            include: 1 as any,
          } as any,
        ], 'include', 'boolean');
      });

      describe('if data[0].filterType', () => {
        tester.validateSchemaRequired([
          {
            ...createReportAccountFilter(),
            filterType: undefined,
          },
        ], 'filterType');

        tester.validateSchemaType([
          {
            ...createReportAccountFilter(),
            filterType: 1 as any,
          },
        ], 'filterType', 'string');

        tester.validateSchemaEnumValue([
          {
            ...createReportAccountFilter(),
            filterType: 'not enum' as any,
          },
        ], 'filterType');
      });

      describe('if data[0].items', () => {
        tester.validateSchemaRequired([
          {
            ...createReportAccountFilter(),
            items: undefined,
          },
        ], 'items');

        tester.validateSchemaType([
          {
            ...createReportAccountFilter(),
            items: 1 as any,
          },
        ], 'items', 'array');

        tester.validateSchemaMinItems([
          {
            ...createReportAccountFilter(),
            items: [],
          },
        ], 'items', 1);
      });

      describe('if data[0].items[0]', () => {
        tester.validateSchemaType([
          {
            ...createReportAccountFilter(),
            items: [1 as any],
          },
        ], 'items/0', 'string');

        tester.validateSchemaPattern([
          {
            ...createReportAccountFilter(),
            items: ['not mongo id' as any],
          },
        ], 'items/0');
      });

      describe('if data[0].from', () => {
        tester.validateSchemaType([
          {
            ...createReportIssuedAtFilter(),
            from: 1 as any,
          },
        ], 'from', 'string');

        tester.validateSchemaFormat([
          {
            ...createReportIssuedAtFilter(),
            from: 'not-date',
          },
        ], 'from', 'date-time');
      });

      describe('if data[0].to', () => {
        tester.validateSchemaType([
          {
            ...createReportIssuedAtFilter(),
            to: 1 as any,
          },
        ], 'to', 'string');

        tester.validateSchemaFormat([
          {
            ...createReportIssuedAtFilter(),
            to: 'not-date',
          },
        ], 'to', 'date-time');

        tester.validateSchemaFormatExclusiveMinimum([
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
