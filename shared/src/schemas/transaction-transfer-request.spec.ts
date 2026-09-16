import { transferRequest } from '@household/shared/schemas/transaction';
import { createAccountId, createTransferTransactionRequest } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Requests } from '@household/shared/types/requests';

describe('Transfer transaction schema', () => {
  const tester = schemaTesterFactory<Requests.TransferTransaction>(transferRequest);

  describe('should accept', () => {
    tester.validateSuccess(createTransferTransactionRequest(), 'without payments');

    tester.validateSuccess(createTransferTransactionRequest({
      description: undefined,
    }), 'without description');
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createTransferTransactionRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.amount', () => {
      tester.required(createTransferTransactionRequest({
        amount: undefined,
      }), 'amount');

      tester.type(createTransferTransactionRequest({
        amount: '1' as any,
      }), 'amount', 'number');
    });

    describe('if data.description', () => {
      tester.type(createTransferTransactionRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(createTransferTransactionRequest({
        description: '',
      }), 'description', 1);
    });

    describe('if data.issuedAt', () => {
      tester.required(createTransferTransactionRequest({
        issuedAt: undefined,
      }), 'issuedAt');

      tester.type(createTransferTransactionRequest({
        issuedAt: 1 as any,
      }), 'issuedAt', 'string');

      tester.format(createTransferTransactionRequest({
        issuedAt: 'not-date-time',
      }), 'issuedAt', 'date-time');
    });

    describe('if data.accountId', () => {
      tester.required(createTransferTransactionRequest({
        accountId: undefined,
      }), 'accountId');

      tester.type(createTransferTransactionRequest({
        accountId: 1 as any,
      }), 'accountId', 'string');

      tester.pattern(createTransferTransactionRequest({
        accountId: createAccountId('not-valid'),
      }), 'accountId');
    });

    describe('if data.transferAccountId', () => {
      tester.required(createTransferTransactionRequest({
        transferAccountId: undefined,
      }), 'transferAccountId');

      tester.type(createTransferTransactionRequest({
        transferAccountId: 1 as any,
      }), 'transferAccountId', 'string');

      tester.pattern(createTransferTransactionRequest({
        transferAccountId: createAccountId('not-valid'),
      }), 'transferAccountId');
    });

    describe('if data.transferAmount', () => {
      tester.type(createTransferTransactionRequest({
        transferAmount: '1' as any,
      }), 'transferAmount', 'number');
    });
  });
});
