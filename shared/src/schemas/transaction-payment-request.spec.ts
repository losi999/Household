import { default as schema } from '@household/shared/schemas/transaction-payment-request';
import { Transaction } from '@household/shared/types/types';
import { createAccountId, createCategoryId, createPaymentTransactionRequest, createProductId, createProjectId, createRecipientId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Payment transaction schema', () => {

  const tester = jsonSchemaTesterFactory<Transaction.PaymentRequest>(schema);

  describe('should accept', () => {
    tester.validateSuccess(createPaymentTransactionRequest(), 'without loanAccountId');

    tester.validateSuccess(createPaymentTransactionRequest({
      loanAccountId: createAccountId(),
      amount: -100,
      isSettled: false,
    }), 'with loanAccountId');

    tester.validateSuccess(createPaymentTransactionRequest({
      description: undefined,
    }), 'without description');

    tester.validateSuccess(createPaymentTransactionRequest({
      categoryId: undefined,
    }), 'without categoryId');

    tester.validateSuccess(createPaymentTransactionRequest({
      recipientId: undefined,
    }), 'without recipientId');

    tester.validateSuccess(createPaymentTransactionRequest({
      projectId: undefined,
    }), 'without projectId');

    tester.validateSuccess(createPaymentTransactionRequest({
      quantity: undefined,
      productId: undefined,
    }), 'without inventory');

    tester.validateSuccess(createPaymentTransactionRequest({
      invoiceNumber: undefined,
      billingEndDate: undefined,
      billingStartDate: undefined,
    }), 'without invoice');

    tester.validateSuccess(createPaymentTransactionRequest({
      invoiceNumber: undefined,
    }), 'without invoiceNumber');
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createPaymentTransactionRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.amount', () => {
      tester.required(createPaymentTransactionRequest({
        amount: undefined,
      }), 'amount');

      tester.type(createPaymentTransactionRequest({
        amount: '1' as any,
      }), 'amount', 'number');

      tester.exclusiveMaximum(createPaymentTransactionRequest({
        loanAccountId: createAccountId(),
        amount: 100,
        isSettled: false,
      }), 'amount', 0, 'if loanAccountId is set');
    });

    describe('if data.description', () => {
      tester.type(createPaymentTransactionRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(createPaymentTransactionRequest({
        description: '',
      }), 'description', 1);
    });

    describe('if data.quantity', () => {
      tester.dependentRequired(createPaymentTransactionRequest({
        productId: undefined,
      }), 'quantity', 'productId');

      tester.type(createPaymentTransactionRequest({
        quantity: '1' as any,
      }), 'quantity', 'number');

      tester.exclusiveMinimum(createPaymentTransactionRequest({
        quantity: 0,
      }), 'quantity', 0);
    });

    describe('if data.productId', () => {
      tester.dependentRequired(createPaymentTransactionRequest({
        quantity: undefined,
      }), 'productId', 'quantity');

      tester.type(createPaymentTransactionRequest({
        productId: 1 as any,
      }), 'productId', 'string');

      tester.pattern(createPaymentTransactionRequest({
        productId: createProductId('not-valid'),
      }), 'productId');
    });

    describe('if data.invoiceNumber', () => {
      tester.dependentRequired(createPaymentTransactionRequest({
        billingEndDate: undefined,
        billingStartDate: undefined,
      }), 'invoiceNumber', 'billingEndDate', 'billingStartDate');

      tester.type(createPaymentTransactionRequest({
        invoiceNumber: 1 as any,
      }), 'invoiceNumber', 'string');

      tester.minLength(createPaymentTransactionRequest({
        invoiceNumber: '',
      }), 'invoiceNumber', 1);
    });

    describe('if data.billingEndDate', () => {
      tester.dependentRequired(createPaymentTransactionRequest({
        billingStartDate: undefined,
      }), 'billingEndDate', 'billingStartDate');

      tester.type(createPaymentTransactionRequest({
        billingEndDate: 1 as any,
      }), 'billingEndDate', 'string');

      tester.format(createPaymentTransactionRequest({
        billingEndDate: 'not-date',
      }), 'billingEndDate', 'date');

      tester.formatExclusiveMinimum(createPaymentTransactionRequest({
        billingEndDate: '2022-01-01',
        billingStartDate: '2022-12-31',
      }), 'billingEndDate');
    });

    describe('if data.billingStartDate', () => {
      tester.dependentRequired(createPaymentTransactionRequest({
        billingEndDate: undefined,
      }), 'billingStartDate', 'billingEndDate');

      tester.type(createPaymentTransactionRequest({
        billingStartDate: 1 as any,
      }), 'billingStartDate', 'string');

      tester.format(createPaymentTransactionRequest({
        billingStartDate: 'not-date',
      }), 'billingStartDate', 'date');

    });

    describe('if data.issuedAt', () => {
      tester.required(createPaymentTransactionRequest({
        issuedAt: undefined,
      }), 'issuedAt');

      tester.type(createPaymentTransactionRequest({
        issuedAt: 1 as any,
      }), 'issuedAt', 'string');

      tester.format(createPaymentTransactionRequest({
        issuedAt: 'not-date-time',
      }), 'issuedAt', 'date-time');
    });

    describe('if data.accountId', () => {
      tester.required(createPaymentTransactionRequest({
        accountId: undefined,
      }), 'accountId');

      tester.type(createPaymentTransactionRequest({
        accountId: 1 as any,
      }), 'accountId', 'string');

      tester.pattern(createPaymentTransactionRequest({
        accountId: createAccountId('not-valid'),
      }), 'accountId');
    });

    describe('if data.categoryId', () => {
      tester.type(createPaymentTransactionRequest({
        categoryId: 1 as any,
      }), 'categoryId', 'string');

      tester.pattern(createPaymentTransactionRequest({
        categoryId: createCategoryId('not-valid'),
      }), 'categoryId');
    });

    describe('if data.recipientId', () => {
      tester.type(createPaymentTransactionRequest({
        recipientId: 1 as any,
      }), 'recipientId', 'string');

      tester.pattern(createPaymentTransactionRequest({
        recipientId: createRecipientId('not-valid'),
      }), 'recipientId');
    });

    describe('if data.projectId', () => {
      tester.type(createPaymentTransactionRequest({
        projectId: 1 as any,
      }), 'projectId', 'string');

      tester.pattern(createPaymentTransactionRequest({
        projectId: createProjectId('not-valid'),
      }), 'projectId');
    });

    describe('if data.loanAccountId', () => {
      tester.type(createPaymentTransactionRequest({
        loanAccountId: 1 as any,
      }), 'loanAccountId', 'string');

      tester.pattern(createPaymentTransactionRequest({
        loanAccountId: createAccountId('not-valid'),
      }), 'loanAccountId');
    });

    describe('if data.isSettled', () => {
      tester.type(createPaymentTransactionRequest({
        isSettled: 1 as any,
      }), 'isSettled', 'boolean');
    });
  });
});
