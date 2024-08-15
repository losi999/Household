import { default as schema } from '@household/shared/schemas/transaction-transfer-request';
import { Transaction } from '@household/shared/types/types';
import { createAccountId, createTransactionId, createTransferPaymentItemRequest, createTransferTransactionRequest } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Transfer transaction schema', () => {
  const tester = jsonSchemaTesterFactory<Transaction.TransferRequest>(schema);

  describe('should accept', () => {
    tester.validateSuccess(createTransferTransactionRequest(), 'without payments');

    tester.validateSuccess(createTransferTransactionRequest({
      payments: [
        {
          amount: 100,
          transactionId: createTransactionId(),
        },
      ],
    }), 'with payments');

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

    describe('if data.payments', () => {
      tester.type(createTransferTransactionRequest({
        payments: 1 as any,
      }), 'payments', 'array');

      tester.minItems(createTransferTransactionRequest({
        payments: [],
      }), 'payments', 1);
    });

    describe('if data.payments[0]', () => {
      tester.type(createTransferTransactionRequest({
        payments: [1 as any],
      }), 'data/payments/0', 'object');

      tester.additionalProperties(createTransferTransactionRequest({
        payments: [
          {
            ...createTransferPaymentItemRequest(),
            extra: 1,
          } as any,
        ],
      }), 'data/payments/0');
    });

    describe('if data.payments[0].transactionId', () => {
      tester.required(createTransferTransactionRequest({
        payments: [
          createTransferPaymentItemRequest({
            transactionId: undefined,
          }),
        ],
      }), 'transactionId');

      tester.type(createTransferTransactionRequest({
        payments: [
          createTransferPaymentItemRequest({
            transactionId: 1 as any,
          }),
        ],
      }), 'data/payments/0/transactionId', 'string');

      tester.pattern(createTransferTransactionRequest({
        payments: [
          createTransferPaymentItemRequest({
            transactionId: createTransactionId('not-valid'),
          }),
        ],
      }), 'data/payments/0/transactionId');
    });

    describe('if data.payments[0].amount', () => {
      tester.required(createTransferTransactionRequest({
        payments: [
          createTransferPaymentItemRequest({
            amount: undefined,
          }),
        ],
      }), 'amount');

      tester.type(createTransferTransactionRequest({
        payments: [
          createTransferPaymentItemRequest({
            amount: '1' as any,
          }),
        ],
      }), 'data/payments/0/amount', 'number');

      tester.exclusiveMinimum(createTransferTransactionRequest({
        payments: [
          createTransferPaymentItemRequest({
            amount: -10,
          }),
        ],
      }), 'data/payments/0/amount', 0);
    });
  });
});
