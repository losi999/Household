import { default as schema } from '@household/shared/schemas/transaction-split-request';
import { Transaction } from '@household/shared/types/types';
import { createAccountId, createCategoryId, createInventoryRequest, createInvoiceRequest, createProductId, createProjectId, createRecipientId, createSplitRequestIem, createSplitTransactionRequest } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Split transaction schema', () => {
  const tester = jsonSchemaTesterFactory<Transaction.SplitRequest>(schema);

  describe('should accept', () => {
    tester.validateSuccess(createSplitTransactionRequest());

    describe('without optional property', () => {
      tester.validateSuccess(createSplitTransactionRequest({
        description: undefined,
      }));

      tester.validateSuccess(createSplitTransactionRequest({
        recipientId: undefined,
      }));

      tester.validateSuccess(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId: undefined,
          }),
        ],
      }));

      tester.validateSuccess(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            projectId: undefined,
          }),
        ],
      }));

      tester.validateSuccess(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            description: undefined,
          }),
        ],
      }));

      tester.validateSuccess(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            inventory: undefined,
          }),
        ],
      }));

      tester.validateSuccess(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            invoice: undefined,
          }),
        ],
      }));

      tester.validateSuccess(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            invoice: createInvoiceRequest({
              invoiceNumber: undefined,
            }),
          }),
        ],
      }));
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        ...createSplitTransactionRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.amount', () => {
      tester.validateSchemaRequired(createSplitTransactionRequest({
        amount: undefined,
      }), 'amount');

      tester.validateSchemaType(createSplitTransactionRequest({
        amount: '1' as any,
      }), 'amount', 'number');
    });

    describe('if data.description', () => {
      tester.validateSchemaType(createSplitTransactionRequest({
        description: 1 as any,
      }), 'description', 'string');

      tester.validateSchemaMinLength(createSplitTransactionRequest({
        description: '',
      }), 'description', 1);
    });

    describe('if data.issuedAt', () => {
      tester.validateSchemaRequired(createSplitTransactionRequest({
        issuedAt: undefined,
      }), 'issuedAt');

      tester.validateSchemaType(createSplitTransactionRequest({
        issuedAt: 1 as any,
      }), 'issuedAt', 'string');

      tester.validateSchemaFormat(createSplitTransactionRequest({
        issuedAt: 'not-date-time',
      }), 'issuedAt', 'date-time');
    });

    describe('if data.accountId', () => {
      tester.validateSchemaRequired(createSplitTransactionRequest({
        accountId: undefined,
      }), 'accountId');

      tester.validateSchemaType(createSplitTransactionRequest({
        accountId: 1 as any,
      }), 'accountId', 'string');

      tester.validateSchemaPattern(createSplitTransactionRequest({
        accountId: createAccountId('not-valid'),
      }), 'accountId');
    });

    describe('if data.recipientId', () => {
      tester.validateSchemaType(createSplitTransactionRequest({
        recipientId: 1 as any,
      }), 'recipientId', 'string');

      tester.validateSchemaPattern(createSplitTransactionRequest({
        recipientId: createRecipientId('not-valid'),
      }), 'recipientId');
    });

    describe('if data.splits', () => {
      tester.validateSchemaRequired(createSplitTransactionRequest({
        splits: undefined,
      }), 'splits');

      tester.validateSchemaMinItems(createSplitTransactionRequest({
        splits: [],
      }), 'splits', 1);

      tester.validateSchemaAdditionalProperties(createSplitTransactionRequest({
        splits: [
          {
            ...createSplitRequestIem(),
            extra: 1,
          } as any,
        ],
      }), 'splits/0');
    });

    describe('if data.splits.amount', () => {
      tester.validateSchemaRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            amount: undefined,
          }),
        ],
      }), 'amount');

      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            amount: '1' as any,
          }),
        ],
      }), 'splits/0/amount', 'number');
    });

    describe('if data.splits.description', () => {
      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            description: 1 as any,
          }),
        ],
      }), 'splits/0/description', 'string');

      tester.validateSchemaMinLength(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            description: '',
          }),
        ],
      }), 'splits/0/description', 1);
    });

    describe('if data.splits.inventory', () => {
      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            inventory: 1 as any,
          }),
        ],
      }), 'splits/0/inventory', 'object');

      tester.validateSchemaAdditionalProperties(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            inventory: {
              ...createInventoryRequest(),
              extra: 1,
            } as any,
          }),
        ],
      }), 'splits/0/inventory');
    });

    describe('if data.splits.inventory.quantity', () => {
      tester.validateSchemaRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            inventory: createInventoryRequest({
              quantity: undefined,
            }),
          }),
        ],
      }), 'quantity');

      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            inventory: createInventoryRequest({
              quantity: '1' as any,
            }),
          }),
        ],
      }), 'splits/0/inventory/quantity', 'number');

      tester.validateSchemaExclusiveMinimum(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            inventory: createInventoryRequest({
              quantity: 0,
            }),
          }),
        ],
      }), 'splits/0/inventory/quantity', 0);
    });

    describe('if data.splits.inventory.productId', () => {
      tester.validateSchemaRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            inventory: createInventoryRequest({
              productId: undefined,
            }),
          }),
        ],
      }), 'productId');

      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            inventory: createInventoryRequest({
              productId: 1 as any,
            }),
          }),
        ],
      }), 'splits/0/inventory/productId', 'string');

      tester.validateSchemaPattern(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            inventory: createInventoryRequest({
              productId: createProductId('not-valid'),
            }),
          }),
        ],
      }), 'splits/0/inventory/productId');
    });

    describe('if data.splits.invoice', () => {
      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            invoice: 1 as any,
          }),
        ],
      }), 'splits/0/invoice', 'object');

      tester.validateSchemaAdditionalProperties(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            invoice: {
              ...createInvoiceRequest(),
              extra: 1,
            } as any,
          }),
        ],
      }), 'splits/0/invoice');
    });

    describe('if data.splits.invoice.invoiceNumber', () => {
      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            invoice: createInvoiceRequest({
              invoiceNumber: 1 as any,
            }),
          }),
        ],
      }), 'splits/0/invoice/invoiceNumber', 'string');

      tester.validateSchemaMinLength(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            invoice: createInvoiceRequest({
              invoiceNumber: '',
            }),
          }),
        ],
      }), 'splits/0/invoice/invoiceNumber', 1);
    });

    describe('if data.splits[0].invoice.billingEndDate', () => {
      tester.validateSchemaRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            invoice: createInvoiceRequest({
              billingEndDate: undefined,
            }),
          }),
        ],
      }), 'billingEndDate');

      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            invoice: createInvoiceRequest({
              billingEndDate: 1 as any,
            }),
          }),
        ],
      }), 'splits/0/invoice/billingEndDate', 'string');

      tester.validateSchemaFormat(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            invoice: createInvoiceRequest({
              billingEndDate: 'not-date',
            }),
          }),
        ],
      }), 'splits/0/invoice/billingEndDate', 'date');

      tester.validateSchemaFormatExclusiveMinimum(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            invoice: createInvoiceRequest({
              billingEndDate: '2022-01-01',
              billingStartDate: '2022-12-31',
            }),
          }),
        ],
      }), 'splits/0/invoice/billingEndDate');
    });

    describe('if data.splits[0].invoice.billingStartDate', () => {
      tester.validateSchemaRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            invoice: createInvoiceRequest({
              billingStartDate: undefined,
            }),
          }),
        ],
      }), 'billingStartDate');

      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            invoice: createInvoiceRequest({
              billingStartDate: 1 as any,
            }),
          }),
        ],
      }), 'splits/0/invoice/billingStartDate', 'string');

      tester.validateSchemaFormat(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            invoice: createInvoiceRequest({
              billingStartDate: 'not-date',
            }),
          }),
        ],
      }), 'splits/0/invoice/billingStartDate', 'date');
    });

    describe('if data.splits[0].categoryId', () => {
      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId: 1 as any,
          }),
        ],
      }), 'splits/0/categoryId', 'string');

      tester.validateSchemaPattern(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            categoryId: createCategoryId('not-valid'),
          }),
        ],
      }), 'splits/0/categoryId');
    });

    describe('if data.splits[0].projectId', () => {
      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            projectId: 1 as any,
          }),
        ],
      }), 'splits/0/projectId', 'string');

      tester.validateSchemaPattern(createSplitTransactionRequest({
        splits: [
          createSplitRequestIem({
            projectId: createProjectId('not-valid'),
          }),
        ],
      }), 'splits/0/projectId');
    });
  });
});
