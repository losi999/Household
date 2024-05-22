import { default as schema } from '@household/shared/schemas/transaction-payment-request';
import { Transaction } from '@household/shared/types/types';
import { createAccountId, createCategoryId, createPaymentTransactionRequest, createProductId, createProjectId, createRecipientId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Payment transaction schema', () => {

  const tester = jsonSchemaTesterFactory<Transaction.PaymentRequest>(schema);

  describe('should accept', () => {
    tester.validateSuccess(createPaymentTransactionRequest());

    describe('without optional property', () => {
      tester.validateSuccess(createPaymentTransactionRequest({
        description: undefined,
      }));

      tester.validateSuccess(createPaymentTransactionRequest({
        categoryId: undefined,
      }));

      tester.validateSuccess(createPaymentTransactionRequest({
        recipientId: undefined,
      }));

      tester.validateSuccess(createPaymentTransactionRequest({
        projectId: undefined,
      }));

      tester.validateSuccess(createPaymentTransactionRequest({
        quantity: undefined,
        productId: undefined,
      }));

      tester.validateSuccess(createPaymentTransactionRequest({
        invoiceNumber: undefined,
        billingEndDate: undefined,
        billingStartDate: undefined,
      }));

      tester.validateSuccess(createPaymentTransactionRequest({
        invoiceNumber: undefined,
      }));
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        ...createPaymentTransactionRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.amount', () => {
      tester.validateSchemaRequired(createPaymentTransactionRequest({
        amount: undefined,
      }), 'amount');

      tester.validateSchemaType(createPaymentTransactionRequest({
        amount: '1' as any,
      }), 'amount', 'number');
    });

    describe('if data.description', () => {
      tester.validateSchemaType(createPaymentTransactionRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.validateSchemaMinLength(createPaymentTransactionRequest({
        description: '',
      }), 'description', 1);
    });

    describe('if data.quantity', () => {
      tester.validateSchemaDependentRequired(createPaymentTransactionRequest({
        productId: undefined,
      }), 'quantity', 'productId');

      tester.validateSchemaType(createPaymentTransactionRequest({
        quantity: '1' as any,
      }), 'quantity', 'number');

      tester.validateSchemaExclusiveMinimum(createPaymentTransactionRequest({
        quantity: 0,
      }), 'quantity', 0);
    });

    describe('if data.productId', () => {
      tester.validateSchemaDependentRequired(createPaymentTransactionRequest({
        quantity: undefined,
      }), 'productId', 'quantity');

      tester.validateSchemaType(createPaymentTransactionRequest({
        productId: 1 as any,
      }), 'productId', 'string');

      tester.validateSchemaPattern(createPaymentTransactionRequest({
        productId: createProductId('not-valid'),
      }), 'productId');
    });

    describe('if data.invoiceNumber', () => {
      tester.validateSchemaDependentRequired(createPaymentTransactionRequest({
        billingEndDate: undefined,
        billingStartDate: undefined,
      }), 'invoiceNumber', 'billingEndDate', 'billingStartDate');

      tester.validateSchemaType(createPaymentTransactionRequest({
        invoiceNumber: 1 as any,
      }), 'invoiceNumber', 'string');

      tester.validateSchemaMinLength(createPaymentTransactionRequest({
        invoiceNumber: '',
      }), 'invoiceNumber', 1);
    });

    describe('if data.billingEndDate', () => {
      tester.validateSchemaDependentRequired(createPaymentTransactionRequest({
        billingStartDate: undefined,
      }), 'billingEndDate', 'billingStartDate');

      tester.validateSchemaType(createPaymentTransactionRequest({
        billingEndDate: 1 as any,
      }), 'billingEndDate', 'string');

      tester.validateSchemaFormat(createPaymentTransactionRequest({
        billingEndDate: 'not-date',
      }), 'billingEndDate', 'date');

      tester.validateSchemaFormatExclusiveMinimum(createPaymentTransactionRequest({
        billingEndDate: '2022-01-01',
        billingStartDate: '2022-12-31',
      }), 'billingEndDate');
    });

    describe('if data.billingStartDate', () => {
      tester.validateSchemaDependentRequired(createPaymentTransactionRequest({
        billingEndDate: undefined,
      }), 'billingStartDate', 'billingEndDate');

      tester.validateSchemaType(createPaymentTransactionRequest({
        billingStartDate: 1 as any,
      }), 'billingStartDate', 'string');

      tester.validateSchemaFormat(createPaymentTransactionRequest({
        billingStartDate: 'not-date',
      }), 'billingStartDate', 'date');

    });

    describe('if data.issuedAt', () => {
      tester.validateSchemaRequired(createPaymentTransactionRequest({
        issuedAt: undefined,
      }), 'issuedAt');

      tester.validateSchemaType(createPaymentTransactionRequest({
        issuedAt: 1 as any,
      }), 'issuedAt', 'string');

      tester.validateSchemaFormat(createPaymentTransactionRequest({
        issuedAt: 'not-date-time',
      }), 'issuedAt', 'date-time');
    });

    describe('if data.accountId', () => {
      tester.validateSchemaRequired(createPaymentTransactionRequest({
        accountId: undefined,
      }), 'accountId');

      tester.validateSchemaType(createPaymentTransactionRequest({
        accountId: 1 as any,
      }), 'accountId', 'string');

      tester.validateSchemaPattern(createPaymentTransactionRequest({
        accountId: createAccountId('not-valid'),
      }), 'accountId');
    });

    describe('if data.categoryId', () => {
      tester.validateSchemaType(createPaymentTransactionRequest({
        categoryId: 1 as any,
      }), 'categoryId', 'string');

      tester.validateSchemaPattern(createPaymentTransactionRequest({
        categoryId: createCategoryId('not-valid'),
      }), 'categoryId');
    });

    describe('if data.recipientId', () => {
      tester.validateSchemaType(createPaymentTransactionRequest({
        recipientId: 1 as any,
      }), 'recipientId', 'string');

      tester.validateSchemaPattern(createPaymentTransactionRequest({
        recipientId: createRecipientId('not-valid'),
      }), 'recipientId');
    });

    describe('if data.projectId', () => {
      tester.validateSchemaType(createPaymentTransactionRequest({
        projectId: 1 as any,
      }), 'projectId', 'string');

      tester.validateSchemaPattern(createPaymentTransactionRequest({
        projectId: createProjectId('not-valid'),
      }), 'projectId');
    });
  });
});
