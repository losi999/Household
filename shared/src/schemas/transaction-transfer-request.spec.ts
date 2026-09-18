import { transferRequest } from '@household/shared/schemas/transaction';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Requests } from '@household/shared/types/requests';

describe('Transfer transaction schema', () => {
  const tester = schemaTesterFactory<Requests.TransferTransaction>(transferRequest);

  describe('should accept', () => {
    tester.validateSuccess(testDataFactory.transaction.request.transfer(), 'without payments');

    tester.validateSuccess(testDataFactory.transaction.request.transfer({
      description: undefined,
    }), 'without description');
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.transaction.request.transfer(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.amount', () => {
      tester.required(testDataFactory.transaction.request.transfer({
        amount: undefined,
      }), 'amount');

      tester.type(testDataFactory.transaction.request.transfer({
        amount: '1' as any,
      }), 'amount', 'number');
    });

    describe('if data.description', () => {
      tester.type(testDataFactory.transaction.request.transfer({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(testDataFactory.transaction.request.transfer({
        description: '',
      }), 'description', 1);
    });

    describe('if data.issuedAt', () => {
      tester.required(testDataFactory.transaction.request.transfer({
        issuedAt: undefined,
      }), 'issuedAt');

      tester.type(testDataFactory.transaction.request.transfer({
        issuedAt: 1 as any,
      }), 'issuedAt', 'string');

      tester.format(testDataFactory.transaction.request.transfer({
        issuedAt: 'not-date-time',
      }), 'issuedAt', 'date-time');
    });

    describe('if data.accountId', () => {
      tester.required(testDataFactory.transaction.request.transfer({
        accountId: undefined,
      }), 'accountId');

      tester.type(testDataFactory.transaction.request.transfer({
        accountId: 1 as any,
      }), 'accountId', 'string');

      tester.pattern(testDataFactory.transaction.request.transfer({
        accountId: testDataFactory.account.id('not-valid'),
      }), 'accountId');
    });

    describe('if data.transferAccountId', () => {
      tester.required(testDataFactory.transaction.request.transfer({
        transferAccountId: undefined,
      }), 'transferAccountId');

      tester.type(testDataFactory.transaction.request.transfer({
        transferAccountId: 1 as any,
      }), 'transferAccountId', 'string');

      tester.pattern(testDataFactory.transaction.request.transfer({
        transferAccountId: testDataFactory.account.id('not-valid'),
      }), 'transferAccountId');
    });

    describe('if data.transferAmount', () => {
      tester.type(testDataFactory.transaction.request.transfer({
        transferAmount: '1' as any,
      }), 'transferAmount', 'number');
    });
  });
});
