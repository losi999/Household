import { default as schema } from '@household/shared/schemas/account-request';
import { Account } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createAccountRequest } from '@household/shared/common/test-data-factory';

describe('Account schema', () => {
  const tester = jsonSchemaTesterFactory<Account.Request>(schema);

  tester.validateSuccess(createAccountRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        ...createAccountRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.validateSchemaRequired(createAccountRequest({
        name: undefined,
      }), 'name');

      tester.validateSchemaType(createAccountRequest({
        name: 1 as any,
      }), 'name', 'string');

      tester.validateSchemaMinLength(createAccountRequest({
        name: '',
      }), 'name', 1);
    });

    describe('if data.currency', () => {
      tester.validateSchemaRequired(createAccountRequest({
        currency: undefined,
      }), 'currency');

      tester.validateSchemaType(createAccountRequest({
        currency: 1 as any,
      }), 'currency', 'string');

      tester.validateSchemaMinLength(createAccountRequest({
        currency: '',
      }), 'currency', 1);

    });

    describe('if data.accountType', () => {
      tester.validateSchemaRequired(createAccountRequest({
        accountType: undefined,
      }), 'accountType');

      tester.validateSchemaType(createAccountRequest({
        accountType: 1 as any,
      }), 'accountType', 'string');

      tester.validateSchemaEnumValue(createAccountRequest({
        accountType: 'notValid' as any,
      }), 'accountType');

    });
  });
});
