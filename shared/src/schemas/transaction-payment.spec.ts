import { default as schema } from '@household/shared/schemas/transaction-payment';
import { Transaction } from '@household/shared/types/types';
import { createAccountId, createCategoryId, createProjectId, createRecipientId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Payment transaction schema', () => {
  let data: Transaction.PaymentRequest;
  const tester = jsonSchemaTesterFactory<Transaction.PaymentRequest>(schema);

  beforeEach(() => {
    data = {
      amount: 200,
      issuedAt: new Date().toISOString(),
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
      accountId: createAccountId('62378f3a6add840bbd4c630c'),
      categoryId: createCategoryId('62378f3a6add840bbd4c630c'),
      recipientId: createRecipientId('62378f3a6add840bbd4c630c'),
      projectId: createProjectId(),
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

      it('categoryId', () => {
        delete data.categoryId;
        tester.validateSuccess(data);
      });

      it('recipientId', () => {
        delete data.recipientId;
        tester.validateSuccess(data);
      });

      it('projectId', () => {
        delete data.projectId;
        tester.validateSuccess(data);
      });

      it('inventory', () => {
        delete data.inventory;
        tester.validateSuccess(data);
      });

      it('invoice', () => {
        delete data.invoice;
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

    describe('if data.inventory', () => {
      it('is not object', () => {
        (data.inventory as any) = 2;
        tester.validateSchemaType(data, 'inventory', 'object');
      });

      it('has additional properties', () => {
        (data.inventory as any).extra = 'asd';
        tester.validateSchemaAdditionalProperties(data, 'inventory');
      });
    });

    describe('if data.inventory.quantity', () => {
      it('is not number', () => {
        (data.inventory.quantity as any) = 'a';
        tester.validateSchemaType(data, 'inventory/quantity', 'number');
      });

      it('is too small', () => {
        data.inventory.quantity = 0;
        tester.validateSchemaExclusiveMinimum(data, 'inventory/quantity', 0);
      });
    });

    describe('if data.inventory.brand', () => {
      it('is not string', () => {
        (data.inventory.brand as any) = 1;
        tester.validateSchemaType(data, 'inventory/brand', 'string');
      });

      it('is too short', () => {
        data.inventory.brand = '';
        tester.validateSchemaMinLength(data, 'inventory/brand', 1);
      });
    });

    describe('if data.inventory.measurement', () => {
      it('is not number', () => {
        (data.inventory.measurement as any) = 'a';
        tester.validateSchemaType(data, 'inventory/measurement', 'number');
      });

      it('is too small', () => {
        data.inventory.measurement = 0;
        tester.validateSchemaExclusiveMinimum(data, 'inventory/measurement', 0);
      });
    });

    describe('if data.inventory.unitOfMeasurement', () => {
      it('is not string', () => {
        (data.inventory.unitOfMeasurement as any) = 1;
        tester.validateSchemaType(data, 'inventory/unitOfMeasurement', 'string');
      });

      it('is not a valid enum vale', () => {
        (data.inventory.unitOfMeasurement as any) = 'km';
        tester.validateSchemaEnumValue(data, 'inventory/unitOfMeasurement');
      });
    });

    describe('if data.invoice', () => {
      it('is not object', () => {
        (data.invoice as any) = 2;
        tester.validateSchemaType(data, 'invoice', 'object');
      });

      it('has additional properties', () => {
        (data.invoice as any).extra = 'asd';
        tester.validateSchemaAdditionalProperties(data, 'invoice');
      });
    });

    describe('if data.invoice.invoiceNumber', () => {
      it('is not string', () => {
        (data.invoice.invoiceNumber as any) = 2;
        tester.validateSchemaType(data, 'invoice/invoiceNumber', 'string');
      });

      it('is too short', () => {
        data.invoice.invoiceNumber = '';
        tester.validateSchemaMinLength(data, 'invoice/invoiceNumber', 1);
      });
    });

    describe('if data.invoice.billingEndDate', () => {
      it('is missing', () => {
        data.invoice.billingEndDate = undefined;
        tester.validateSchemaRequired(data, 'billingEndDate');
      });
      it('is not string', () => {
        (data.invoice.billingEndDate as any) = 2;
        tester.validateSchemaType(data, 'invoice/billingEndDate', 'string');
      });

      it('is wrong format', () => {
        data.invoice.billingEndDate = 'not-date-time';
        tester.validateSchemaFormat(data, 'invoice/billingEndDate', 'date');
      });

      it('is earlier than required', () => {
        data.invoice.billingEndDate = data.invoice.billingStartDate;
        tester.validateSchemaFormatExclusiveMinimum(data, 'invoice/billingEndDate');
      });
    });

    describe('if data.invoice.billingStartDate', () => {
      it('is missing', () => {
        data.invoice.billingStartDate = undefined;
        tester.validateSchemaRequired(data, 'billingStartDate');
      });
      it('is not string', () => {
        (data.invoice.billingStartDate as any) = 2;
        tester.validateSchemaType(data, 'invoice/billingStartDate', 'string');
      });

      it('is wrong format', () => {
        data.invoice.billingStartDate = 'not-date';
        tester.validateSchemaFormat(data, 'invoice/billingStartDate', 'date');
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

    describe('if data.categoryId', () => {
      it('does not match pattern', () => {
        data.categoryId = createCategoryId('not-valid');
        tester.validateSchemaPattern(data, 'categoryId');
      });
    });

    describe('if data.recipientId', () => {
      it('does not match pattern', () => {
        data.recipientId = createRecipientId('not-valid');
        tester.validateSchemaPattern(data, 'recipientId');
      });
    });

    describe('if data.projectId', () => {
      it('does not match pattern', () => {
        data.projectId = createProjectId('not valid');
        tester.validateSchemaPattern(data, 'projectId');
      });
    });
  });
});
