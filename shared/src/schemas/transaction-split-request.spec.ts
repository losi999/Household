import { default as schema } from '@household/shared/schemas/transaction-split-request';
import { Transaction } from '@household/shared/types/types';
import { createAccountId, createCategoryId, createProductId, createProjectId, createRecipientId, createSplitRequestItem as createSplitRequestItem, createSplitTransactionRequest } from '@household/shared/common/test-data-factory';
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
          createSplitRequestItem({
            categoryId: undefined,
          }),
        ],
      }));

      tester.validateSuccess(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            projectId: undefined,
          }),
        ],
      }));

      tester.validateSuccess(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            description: undefined,
          }),
        ],
      }));

      tester.validateSuccess(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            quantity: undefined,
            productId: undefined,
          }),
        ],
      }));

      tester.validateSuccess(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            quantity: undefined,
            productId: undefined,
          }),
        ],
      }));

      tester.validateSuccess(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            invoiceNumber: undefined,
            billingEndDate: undefined,
            billingStartDate: undefined,
          }),
        ],
      }));

      tester.validateSuccess(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            invoiceNumber: undefined,
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
            ...createSplitRequestItem(),
            extra: 1,
          } as any,
        ],
      }), 'splits/0');
    });

    describe('if data.splits.amount', () => {
      tester.validateSchemaRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            amount: undefined,
          }),
        ],
      }), 'amount');

      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            amount: '1' as any,
          }),
        ],
      }), 'splits/0/amount', 'number');
    });

    describe('if data.splits.description', () => {
      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            description: 1 as any,
          }),
        ],
      }), 'splits/0/description', 'string');

      tester.validateSchemaMinLength(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            description: '',
          }),
        ],
      }), 'splits/0/description', 1);
    });

    describe('if data.splits.quantity', () => {
      tester.validateSchemaDependentRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            productId: undefined,
          }),
        ],
      }), 'quantity', 'productId');

      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            quantity: '1' as any,
          }),
        ],
      }), 'splits/0/quantity', 'number');

      tester.validateSchemaExclusiveMinimum(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            quantity: 0,
          }),
        ],
      }), 'splits/0/quantity', 0);
    });

    describe('if data.splits.productId', () => {
      tester.validateSchemaDependentRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            quantity: undefined,
          }),
        ],
      }), 'productId', 'quantity');

      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            productId: 1 as any,
          }),
        ],
      }), 'splits/0/productId', 'string');

      tester.validateSchemaPattern(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            productId: createProductId('not-valid'),
          }),
        ],
      }), 'splits/0/productId');
    });

    describe('if data.splits.invoiceNumber', () => {
      tester.validateSchemaDependentRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingEndDate: undefined,
            billingStartDate: undefined,
          }),
        ],
      }), 'invoiceNumber', 'billingEndDate', 'billingStartDate');

      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            invoiceNumber: 1 as any,
          }),
        ],
      }), 'splits/0/invoiceNumber', 'string');

      tester.validateSchemaMinLength(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            invoiceNumber: '',
          }),
        ],
      }), 'splits/0/invoiceNumber', 1);
    });

    describe('if data.splits[0].billingEndDate', () => {
      tester.validateSchemaDependentRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingStartDate: undefined,
          }),
        ],
      }), 'billingEndDate', 'billingStartDate');

      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingEndDate: 1 as any,
          }),
        ],
      }), 'splits/0/billingEndDate', 'string');

      tester.validateSchemaFormat(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingEndDate: 'not-date',
          }),
        ],
      }), 'splits/0/billingEndDate', 'date');

      tester.validateSchemaFormatExclusiveMinimum(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingEndDate: '2022-01-01',
            billingStartDate: '2022-12-31',
          }),
        ],
      }), 'splits/0/billingEndDate');
    });

    describe('if data.splits[0].billingStartDate', () => {
      tester.validateSchemaDependentRequired(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingEndDate: undefined,
          }),
        ],
      }), 'billingStartDate', 'billingEndDate');

      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingStartDate: 1 as any,
          }),
        ],
      }), 'splits/0/billingStartDate', 'string');

      tester.validateSchemaFormat(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            billingStartDate: 'not-date',
          }),
        ],
      }), 'splits/0/billingStartDate', 'date');
    });

    describe('if data.splits[0].categoryId', () => {
      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            categoryId: 1 as any,
          }),
        ],
      }), 'splits/0/categoryId', 'string');

      tester.validateSchemaPattern(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            categoryId: createCategoryId('not-valid'),
          }),
        ],
      }), 'splits/0/categoryId');
    });

    describe('if data.splits[0].projectId', () => {
      tester.validateSchemaType(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            projectId: 1 as any,
          }),
        ],
      }), 'splits/0/projectId', 'string');

      tester.validateSchemaPattern(createSplitTransactionRequest({
        splits: [
          createSplitRequestItem({
            projectId: createProjectId('not-valid'),
          }),
        ],
      }), 'splits/0/projectId');
    });
  });
});
