import { default as schema } from '@household/shared/schemas/report-request';
import { Report } from '@household/shared/types/types';
import { createAccountId, createCategoryId, createProductId, createProjectId, createRecipientId, createReportRequest } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Report request schema', () => {
  const tester = jsonSchemaTesterFactory<Report.Request>(schema);

  tester.validateSuccess(createReportRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        ...createReportRequest(),
        extra: 1,
      } as any, 'data');

      tester.validateSchemaMinProperties({} as any, 'data', 1);
    });

    describe('if data.accountIds', () => {
      tester.validateSchemaType({
        ...createReportRequest(),
        accountIds: 1 as any,
      }, 'accountIds', 'array');
    });

    describe('if data.accountIds[0]', () => {

      tester.validateSchemaType({
        ...createReportRequest(),
        accountIds: [1 as any],
      }, 'accountIds/0', 'string');

      tester.validateSchemaPattern({
        ...createReportRequest(),
        accountIds: [createAccountId('not-valid')],
      }, 'accountIds/0');
    });

    describe('if data.projectIds', () => {
      tester.validateSchemaType({
        ...createReportRequest(),
        projectIds: 1 as any,
      }, 'projectIds', 'array');
    });

    describe('if data.projectIds[0]', () => {

      tester.validateSchemaType({
        ...createReportRequest(),
        projectIds: [1 as any],
      }, 'projectIds/0', 'string');

      tester.validateSchemaPattern({
        ...createReportRequest(),
        projectIds: [createProjectId('not-valid')],
      }, 'projectIds/0');
    });

    describe('if data.recipientIds', () => {
      tester.validateSchemaType({
        ...createReportRequest(),
        recipientIds: 1 as any,
      }, 'recipientIds', 'array');
    });

    describe('if data.recipientIds[0]', () => {

      tester.validateSchemaType({
        ...createReportRequest(),
        recipientIds: [1 as any],
      }, 'recipientIds/0', 'string');

      tester.validateSchemaPattern({
        ...createReportRequest(),
        recipientIds: [createRecipientId('not-valid')],
      }, 'recipientIds/0');
    });

    describe('if data.categoryIds', () => {
      tester.validateSchemaType({
        ...createReportRequest(),
        categoryIds: 1 as any,
      }, 'categoryIds', 'array');
    });

    describe('if data.categoryIds[0]', () => {

      tester.validateSchemaType({
        ...createReportRequest(),
        categoryIds: [1 as any],
      }, 'categoryIds/0', 'string');

      tester.validateSchemaPattern({
        ...createReportRequest(),
        categoryIds: [createCategoryId('not-valid')],
      }, 'categoryIds/0');
    });

    describe('if data.productIds', () => {
      tester.validateSchemaType({
        ...createReportRequest(),
        productIds: 1 as any,
      }, 'productIds', 'array');
    });

    describe('if data.productIds[0]', () => {

      tester.validateSchemaType({
        ...createReportRequest(),
        productIds: [1 as any],
      }, 'productIds/0', 'string');

      tester.validateSchemaPattern({
        ...createReportRequest(),
        productIds: [createProductId('not-valid')],
      }, 'productIds/0');
    });

    describe('if data.issuedAtFrom', () => {
      tester.validateSchemaType({
        ...createReportRequest(),
        issuedAtFrom: 1 as any,
      }, 'issuedAtFrom', 'string');

      tester.validateSchemaFormat({
        ...createReportRequest(),
        issuedAtFrom: 'not-date',
      }, 'issuedAtFrom', 'date-time');
    });

    describe('if data.issuedAtTo', () => {
      tester.validateSchemaType({
        ...createReportRequest(),
        issuedAtTo: 1 as any,
      }, 'issuedAtTo', 'string');

      tester.validateSchemaFormat({
        ...createReportRequest(),
        issuedAtTo: 'not-date',
      }, 'issuedAtTo', 'date-time');
    });
  });
});
