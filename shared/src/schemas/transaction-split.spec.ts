import { default as schema } from '@household/shared/schemas/transaction-split';
import { Transaction } from '@household/shared/types/types';
import { createAccountId, createCategoryId, createProjectId, createRecipientId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Split transaction schema', () => {
  let data: Transaction.SplitRequest;
  const tester = jsonSchemaTesterFactory<Transaction.SplitRequest>(schema);

  beforeEach(() => {
    data = {
      amount: 200,
      issuedAt: new Date().toISOString(),
      description: 'description',
      accountId: createAccountId(),
      recipientId: createRecipientId(),
      splits: [
        {
          amount: 200,
          description: 'description',
          inventory: {
            quantity: 1,
            brand: 'spar',
            measurement: 250,
            unitOfMeasurement: 'g',
          },
          invoice: {
            invoiceNumber: 'asdf',
            billingEndDate: new Date(2022, 5, 3).toISOString()
              .split('T')[0],
            billingStartDate: new Date(2022, 5, 2).toISOString()
              .split('T')[0],
          },
          categoryId: createCategoryId(),
          projectId: createProjectId(),
        },
      ],
    };
  });

  describe('should accept', () => {
    it('complete body', () => {
      tester.validateSuccess(data);
    });

    describe('without optional property', () => {
      it('description', () => {
        delete data.description;
        tester.validateSuccess(data);
      });

      it('recipientId', () => {
        delete data.recipientId;
        tester.validateSuccess(data);
      });

      it('splits.categoryId', () => {
        delete data.splits[0].categoryId;
        tester.validateSuccess(data);
      });

      it('splits.projectId', () => {
        delete data.splits[0].projectId;
        tester.validateSuccess(data);
      });

      it('splits.description', () => {
        delete data.splits[0].description;
        tester.validateSuccess(data);
      });

      it('splits.inventory', () => {
        delete data.splits[0].inventory;
        tester.validateSuccess(data);
      });

      it('splits.invoice', () => {
        delete data.splits[0].invoice;
        tester.validateSuccess(data);
      });
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        tester.validateSchemaAdditionalProperties(data, 'data');
      });
    });

    describe('if data.amount', () => {
      it('is missing', () => {
        data.amount = undefined;
        tester.validateSchemaRequired(data, 'amount');
      });

      it('is not number', () => {
        (data.amount as any) = 'text';
        tester.validateSchemaType(data, 'amount', 'number');
      });
    });

    describe('if data.description', () => {
      it('is not string', () => {
        (data.description as any) = 2;
        tester.validateSchemaType(data, 'description', 'string');
      });

      it('is too short', () => {
        data.description = '';
        tester.validateSchemaMinLength(data, 'description', 1);
      });
    });

    describe('if data.issuedAt', () => {
      it('is missing', () => {
        data.issuedAt = undefined;
        tester.validateSchemaRequired(data, 'issuedAt');
      });
      it('is not string', () => {
        (data.issuedAt as any) = 2;
        tester.validateSchemaType(data, 'issuedAt', 'string');
      });

      it('is wrong format', () => {
        data.issuedAt = 'not-date-time';
        tester.validateSchemaFormat(data, 'issuedAt', 'date-time');
      });
    });

    describe('if data.accountId', () => {
      it('is missing', () => {
        data.accountId = undefined;
        tester.validateSchemaRequired(data, 'accountId');
      });

      it('does not match pattern', () => {
        data.accountId = createAccountId('not-valid');
        tester.validateSchemaPattern(data, 'accountId');
      });
    });

    describe('if data.recipientId', () => {
      it('does not match pattern', () => {
        data.recipientId = createRecipientId('not-valid');
        tester.validateSchemaPattern(data, 'recipientId');
      });
    });

    describe('if data.splits', () => {
      it('is missing', () => {
        data.splits = undefined;
        tester.validateSchemaRequired(data, 'splits');
      });

      it('has too few item', () => {
        data.splits = [];
        tester.validateSchemaMinItems(data, 'splits', 1);
      });

      it('has additional property', () => {
        (data.splits[0] as any).extra = 'extra';
        tester.validateSchemaAdditionalProperties(data, 'splits/0');
      });
    });

    describe('if data.splits.amount', () => {
      it('is missing', () => {
        data.splits[0].amount = undefined;
        tester.validateSchemaRequired(data, 'amount');
      });

      it('is not number', () => {
        (data.splits[0].amount as any) = 'text';
        tester.validateSchemaType(data, 'splits/0/amount', 'number');
      });
    });

    describe('if data.splits.description', () => {
      it('is not string', () => {
        (data.splits[0].description as any) = 2;
        tester.validateSchemaType(data, 'splits/0/description', 'string');
      });

      it('is too short', () => {
        data.splits[0].description = '';
        tester.validateSchemaMinLength(data, 'splits/0/description', 1);
      });
    });

    describe('if data.splits.inventory', () => {
      it('is not object', () => {
        (data.splits[0].inventory as any) = 2;
        tester.validateSchemaType(data, 'splits/0/inventory', 'object');
      });

      it('has additional properties', () => {
        (data.splits[0].inventory as any).extra = 'asd';
        tester.validateSchemaAdditionalProperties(data, 'splits/0/inventory');
      });
    });

    describe('if data.splits.inventory.quantity', () => {
      it('is not number', () => {
        (data.splits[0].inventory.quantity as any) = 'a';
        tester.validateSchemaType(data, 'splits/0/inventory/quantity', 'number');
      });

      it('is too small', () => {
        data.splits[0].inventory.quantity = 0;
        tester.validateSchemaExclusiveMinimum(data, 'splits/0/inventory/quantity', 0);
      });
    });

    describe('if data.splits.inventory.brand', () => {
      it('is not string', () => {
        (data.splits[0].inventory.brand as any) = 1;
        tester.validateSchemaType(data, 'splits/0/inventory/brand', 'string');
      });

      it('is too short', () => {
        data.splits[0].inventory.brand = '';
        tester.validateSchemaMinLength(data, 'splits/0/inventory/brand', 1);
      });
    });

    describe('if data.splits.inventory.measurement', () => {
      it('is not number', () => {
        (data.splits[0].inventory.measurement as any) = 'a';
        tester.validateSchemaType(data, 'splits/0/inventory/measurement', 'number');
      });

      it('is too small', () => {
        data.splits[0].inventory.measurement = 0;
        tester.validateSchemaExclusiveMinimum(data, 'splits/0/inventory/measurement', 0);
      });
    });

    describe('if data.splits.inventory.unitOfMeasurement', () => {
      it('is not string', () => {
        (data.splits[0].inventory.unitOfMeasurement as any) = 1;
        tester.validateSchemaType(data, 'splits/0/inventory/unitOfMeasurement', 'string');
      });

      it('is not a valid enum vale', () => {
        (data.splits[0].inventory.unitOfMeasurement as any) = 'km';
        tester.validateSchemaEnumValue(data, 'splits/0/inventory/unitOfMeasurement');
      });
    });

    describe('if data.splits.invoice', () => {
      it('is not object', () => {
        (data.splits[0].invoice as any) = 2;
        tester.validateSchemaType(data, 'splits/0/invoice', 'object');
      });

      it('has additional properties', () => {
        (data.splits[0].invoice as any).extra = 'asd';
        tester.validateSchemaAdditionalProperties(data, 'splits/0/invoice');
      });
    });

    describe('if data.splits.invoice.invoiceNumber', () => {
      it('is not string', () => {
        (data.splits[0].invoice.invoiceNumber as any) = 2;
        tester.validateSchemaType(data, 'splits/0/invoice/invoiceNumber', 'string');
      });

      it('is too short', () => {
        data.splits[0].invoice.invoiceNumber = '';
        tester.validateSchemaMinLength(data, 'splits/0/invoice/invoiceNumber', 1);
      });
    });

    describe('if data.splits[0].invoice.billingEndDate', () => {
      it('is missing', () => {
        data.splits[0].invoice.billingEndDate = undefined;
        tester.validateSchemaRequired(data, 'billingEndDate');
      });
      it('is not string', () => {
        (data.splits[0].invoice.billingEndDate as any) = 2;
        tester.validateSchemaType(data, 'splits/0/invoice/billingEndDate', 'string');
      });

      it('is wrong format', () => {
        data.splits[0].invoice.billingEndDate = 'not-date-time';
        tester.validateSchemaFormat(data, 'splits/0/invoice/billingEndDate', 'date');
      });

      it('is earlier than required', () => {
        data.splits[0].invoice.billingEndDate = data.splits[0].invoice.billingStartDate;
        tester.validateSchemaFormatExclusiveMinimum(data, 'splits/0/invoice/billingEndDate');
      });
    });

    describe('if data.splits[0].invoice.billingStartDate', () => {
      it('is missing', () => {
        data.splits[0].invoice.billingStartDate = undefined;
        tester.validateSchemaRequired(data, 'billingStartDate');
      });
      it('is not string', () => {
        (data.splits[0].invoice.billingStartDate as any) = 2;
        tester.validateSchemaType(data, 'splits/0/invoice/billingStartDate', 'string');
      });

      it('is wrong format', () => {
        data.splits[0].invoice.billingStartDate = 'not-date-time';
        tester.validateSchemaFormat(data, 'splits/0/invoice/billingStartDate', 'date');
      });
    });

    describe('if data.splits[0].categoryId', () => {
      it('does not match pattern', () => {
        data.splits[0].categoryId = createCategoryId('not-valid');
        tester.validateSchemaPattern(data, 'splits/0/categoryId');
      });
    });

    describe('if data.splits[0].projectId', () => {
      it('does not match pattern', () => {
        data.splits[0].projectId = createProjectId('not valid');
        tester.validateSchemaPattern(data, 'splits/0/projectId');
      });
    });
  });
});
