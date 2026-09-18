import { request as schema } from '@household/shared/schemas/account';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Requests } from '@household/shared/types/requests';

describe('Account schema', () => {
  const tester = schemaTesterFactory<Requests.Account>(schema);

  tester.validateSuccess(testDataFactory.account.request());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.account.request(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(testDataFactory.account.request({
        name: undefined,
      }), 'name');

      tester.type(testDataFactory.account.request({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(testDataFactory.account.request({
        name: '',
      }), 'name', 1);
    });

    describe('if data.currency', () => {
      tester.required(testDataFactory.account.request({
        currency: undefined,
      }), 'currency');

      tester.type(testDataFactory.account.request({
        currency: 1 as any,
      }), 'currency', 'string');

      tester.minLength(testDataFactory.account.request({
        currency: '',
      }), 'currency', 1);

    });

    describe('if data.accountType', () => {
      tester.required(testDataFactory.account.request({
        accountType: undefined,
      }), 'accountType');

      tester.type(testDataFactory.account.request({
        accountType: 1 as any,
      }), 'accountType', 'string');

      tester.enum(testDataFactory.account.request({
        accountType: 'notValid' as any,
      }), 'accountType');

    });

    describe('if data.owner', () => {
      tester.required(testDataFactory.account.request({
        owner: undefined,
      }), 'owner');

      tester.type(testDataFactory.account.request({
        owner: 1 as any,
      }), 'owner', 'string');

      tester.minLength(testDataFactory.account.request({
        owner: '',
      }), 'owner', 1);

    });
  });
});
