import { default as schema } from '@household/shared/schemas/transaction-transfer-request';
import { Transaction } from '@household/shared/types/types';
import { createAccountId, createTransferTransactionRequest } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Transfer transaction schema', () => {
  const tester = jsonSchemaTesterFactory<Transaction.TransferRequest>(schema);

  describe('should accept', () => {
    tester.validateSuccess(createTransferTransactionRequest());

    describe('without optional property', () => {
      tester.validateSuccess(createTransferTransactionRequest({
        description: undefined,
      }));
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        ...createTransferTransactionRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.amount', () => {
      tester.validateSchemaRequired(createTransferTransactionRequest({
        amount: undefined,
      }), 'amount');

      tester.validateSchemaType(createTransferTransactionRequest({
        amount: '1' as any,
      }), 'amount', 'number');
    });

    describe('if data.description', () => {
      tester.validateSchemaType(createTransferTransactionRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.validateSchemaMinLength(createTransferTransactionRequest({
        description: '',
      }), 'description', 1);
    });

    describe('if data.issuedAt', () => {
      tester.validateSchemaRequired(createTransferTransactionRequest({
        issuedAt: undefined,
      }), 'issuedAt');

      tester.validateSchemaType(createTransferTransactionRequest({
        issuedAt: 1 as any,
      }), 'issuedAt', 'string');

      tester.validateSchemaFormat(createTransferTransactionRequest({
        issuedAt: 'not-date-time',
      }), 'issuedAt', 'date-time');
    });

    describe('if data.accountId', () => {
      tester.validateSchemaRequired(createTransferTransactionRequest({
        accountId: undefined,
      }), 'accountId');

      tester.validateSchemaType(createTransferTransactionRequest({
        accountId: 1 as any,
      }), 'accountId', 'string');

      tester.validateSchemaPattern(createTransferTransactionRequest({
        accountId: createAccountId('not-valid'),
      }), 'accountId');
    });

    describe('if data.transferAccountId', () => {
      tester.validateSchemaRequired(createTransferTransactionRequest({
        transferAccountId: undefined,
      }), 'transferAccountId');

      tester.validateSchemaType(createTransferTransactionRequest({
        transferAccountId: 1 as any,
      }), 'transferAccountId', 'string');

      tester.validateSchemaPattern(createTransferTransactionRequest({
        transferAccountId: createAccountId('not-valid'),
      }), 'transferAccountId');
    });

    describe('if data.transferAmount', () => {
      tester.validateSchemaType(createTransferTransactionRequest({
        transferAmount: '1' as any,
      }), 'transferAmount', 'number');
    });
  });
});
