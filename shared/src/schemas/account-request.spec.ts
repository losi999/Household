import { default as schema } from '@household/shared/schemas/account-request';
import { Account } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createAccountRequest } from '@household/shared/common/test-data-factory';

describe('Account schema', () => {
  const tester = jsonSchemaTesterFactory<Account.Request>(schema);

  tester.validateSuccess(createAccountRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createAccountRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(createAccountRequest({
        name: undefined,
      }), 'name');

      tester.type(createAccountRequest({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(createAccountRequest({
        name: '',
      }), 'name', 1);
    });

    describe('if data.currency', () => {
      tester.required(createAccountRequest({
        currency: undefined,
      }), 'currency');

      tester.type(createAccountRequest({
        currency: 1 as any,
      }), 'currency', 'string');

      tester.minLength(createAccountRequest({
        currency: '',
      }), 'currency', 1);

    });

    describe('if data.accountType', () => {
      tester.required(createAccountRequest({
        accountType: undefined,
      }), 'accountType');

      tester.type(createAccountRequest({
        accountType: 1 as any,
      }), 'accountType', 'string');

      tester.enum(createAccountRequest({
        accountType: 'notValid' as any,
      }), 'accountType');

    });

    describe('if data.owner', () => {
      tester.required(createAccountRequest({
        owner: undefined,
      }), 'owner');

      tester.type(createAccountRequest({
        owner: 1 as any,
      }), 'owner', 'string');

      tester.minLength(createAccountRequest({
        owner: '',
      }), 'owner', 1);

    });
  });
});
