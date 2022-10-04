import { default as schema } from '@household/shared/schemas/transaction-payment-request';
import { Transaction } from '@household/shared/types/types';
import { createAccountId, createCategoryId, createInventoryRequest, createInvoiceRequest, createPaymentTransactionRequest, createProductId, createProjectId, createRecipientId } from '@household/shared/common/test-data-factory';
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
        inventory: undefined,
      }));

      tester.validateSuccess(createPaymentTransactionRequest({
        invoice: undefined,
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

    describe('if data.inventory', () => {
      tester.validateSchemaType(createPaymentTransactionRequest({
        inventory: 1 as any,
      }), 'inventory', 'object');

      tester.validateSchemaAdditionalProperties(createPaymentTransactionRequest({
        inventory: {
          ...createInventoryRequest(),
          extra: 1,
        } as any,
      }), 'inventory');
    });

    describe('if data.inventory.quantity', () => {
      tester.validateSchemaRequired(createPaymentTransactionRequest({
        inventory: createInventoryRequest({
          quantity: undefined,
        }),
      }), 'quantity');

      tester.validateSchemaType(createPaymentTransactionRequest({
        inventory: createInventoryRequest({
          quantity: '1' as any,
        }),
      }), 'inventory/quantity', 'number');

      tester.validateSchemaExclusiveMinimum(createPaymentTransactionRequest({
        inventory: createInventoryRequest({
          quantity: 0,
        }),
      }), 'inventory/quantity', 0);
    });

    describe('if data.inventory.productId', () => {
      tester.validateSchemaRequired(createPaymentTransactionRequest({
        inventory: createInventoryRequest({
          productId: undefined,
        }),
      }), 'productId');

      tester.validateSchemaType(createPaymentTransactionRequest({
        inventory: createInventoryRequest({
          productId: 1 as any,
        }),
      }), 'inventory/productId', 'string');

      tester.validateSchemaPattern(createPaymentTransactionRequest({
        inventory: createInventoryRequest({
          productId: createProductId('not-valid'),
        }),
      }), 'inventory/productId');
    });

    describe('if data.invoice', () => {
      tester.validateSchemaType(createPaymentTransactionRequest({
        invoice: 1 as any,
      }), 'invoice', 'object');

      tester.validateSchemaAdditionalProperties(createPaymentTransactionRequest({
        invoice: {
          ...createInvoiceRequest(),
          extra: 1,
        } as any,
      }), 'invoice');
    });

    describe('if data.invoice.invoiceNumber', () => {
      tester.validateSchemaType(createPaymentTransactionRequest({
        invoice: createInvoiceRequest({
          invoiceNumber: 1 as any,
        }),
      }), 'invoice/invoiceNumber', 'string');

      tester.validateSchemaMinLength(createPaymentTransactionRequest({
        invoice: createInvoiceRequest({
          invoiceNumber: '',
        }),
      }), 'invoice/invoiceNumber', 1);
    });

    describe('if data.invoice.billingEndDate', () => {
      tester.validateSchemaRequired(createPaymentTransactionRequest({
        invoice: createInvoiceRequest({
          billingEndDate: undefined,
        }),
      }), 'billingEndDate');

      tester.validateSchemaType(createPaymentTransactionRequest({
        invoice: createInvoiceRequest({
          billingEndDate: 1 as any,
        }),
      }), 'invoice/billingEndDate', 'string');

      tester.validateSchemaFormat(createPaymentTransactionRequest({
        invoice: createInvoiceRequest({
          billingEndDate: 'not-date',
        }),
      }), 'invoice/billingEndDate', 'date');

      tester.validateSchemaFormatExclusiveMinimum(createPaymentTransactionRequest({
        invoice: createInvoiceRequest({
          billingEndDate: '2022-01-01',
          billingStartDate: '2022-12-31',
        }),
      }), 'invoice/billingEndDate');
    });

    describe('if data.invoice.billingStartDate', () => {
      tester.validateSchemaRequired(createPaymentTransactionRequest({
        invoice: createInvoiceRequest({
          billingStartDate: undefined,
        }),
      }), 'billingStartDate');

      tester.validateSchemaType(createPaymentTransactionRequest({
        invoice: createInvoiceRequest({
          billingStartDate: 1 as any,
        }),
      }), 'invoice/billingStartDate', 'string');

      tester.validateSchemaFormat(createPaymentTransactionRequest({
        invoice: createInvoiceRequest({
          billingStartDate: 'not-date',
        }),
      }), 'invoice/billingStartDate', 'date');

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
