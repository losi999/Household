import { default as schema } from '@household/shared/schemas/transaction-split';
import { validateSchemaAdditionalProperties, validateSchemaFormat, validateSchemaMinItems, validateSchemaMinLength, validateSchemaPattern, validateSchemaRequired, validateSchemaType } from '@household/shared/common/unit-testing';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { Transaction } from '@household/shared/types/types';
import { createAccountId, createCategoryId, createProjectId, createRecipientId } from '@household/shared/common/test-data-factory';

describe('Split transaction schema', () => {
  let data: Transaction.SplitRequest;

  beforeEach(() => {
    data = {
      amount: 200,
      issuedAt: new Date().toISOString(),
      description: 'description',
      accountId: createAccountId('62378f3a6add840bbd4c630c'),
      recipientId: createRecipientId('62378f3a6add840bbd4c630c'),
      splits: [
        {
          amount: 200,
          description: 'description',
          categoryId: createCategoryId('62378f3a6add840bbd4c630c'),
          projectId: createProjectId('62378f3a6add840bbd4c630c'),
        },
      ],
    };
  });

  describe('should accept', () => {
    it('complete body', () => {
      const result = validatorService.validate(data, schema);
      expect(result).toBeUndefined();
    });

    describe('without optional property', () => {
      it('description', () => {
        delete data.description;
        const result = validatorService.validate(data, schema);
        expect(result).toBeUndefined();
      });

      it('recipientId', () => {
        delete data.recipientId;
        const result = validatorService.validate(data, schema);
        expect(result).toBeUndefined();
      });

      it('splits.categoryId', () => {
        delete data.splits[0].categoryId;
        const result = validatorService.validate(data, schema);
        expect(result).toBeUndefined();
      });

      it('splits.projectId', () => {
        delete data.splits[0].projectId;
        const result = validatorService.validate(data, schema);
        expect(result).toBeUndefined();
      });

      it('splits.description', () => {
        delete data.splits[0].description;
        const result = validatorService.validate(data, schema);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        const result = validatorService.validate(data, schema);
        validateSchemaAdditionalProperties(result, 'data');
      });
    });

    describe('if data.amount', () => {
      it('is missing', () => {
        data.amount = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'amount');
      });

      it('is not number', () => {
        (data.amount as any) = 'text';
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'amount', 'number');
      });
    });

    describe('if data.description', () => {
      it('is not string', () => {
        (data.description as any) = 2;
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'description', 'string');
      });

      it('is too short', () => {
        data.description = '';
        const result = validatorService.validate(data, schema);
        validateSchemaMinLength(result, 'description', 1);
      });
    });

    describe('if data.issuedAt', () => {
      it('is missing', () => {
        data.issuedAt = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'issuedAt');
      });
      it('is not string', () => {
        (data.issuedAt as any) = 2;
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'issuedAt', 'string');
      });

      it('is wrong format', () => {
        data.issuedAt = 'not-date-time';
        const result = validatorService.validate(data, schema);
        validateSchemaFormat(result, 'issuedAt', 'date-time');
      });
    });

    describe('if data.accountId', () => {
      it('is missing', () => {
        data.accountId = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'accountId');
      });

      it('does not match pattern', () => {
        data.accountId = createAccountId();
        const result = validatorService.validate(data, schema);
        validateSchemaPattern(result, 'accountId');
      });
    });

    describe('if data.recipientId', () => {
      it('does not match pattern', () => {
        data.recipientId = createRecipientId();
        const result = validatorService.validate(data, schema);
        validateSchemaPattern(result, 'recipientId');
      });
    });

    describe('if data.splits', () => {
      it('is missing', () => {
        data.splits = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'splits');
      });

      it('has to few item', () => {
        data.splits = [];
        const result = validatorService.validate(data, schema);
        validateSchemaMinItems(result, 'splits', 1);
      });

      it('has additional property', () => {
        (data.splits[0] as any).extra = 'extra';
        const result = validatorService.validate(data, schema);
        validateSchemaAdditionalProperties(result, 'splits[0]');
      });
    });

    describe('if data.splits.amount', () => {
      it('is missing', () => {
        data.splits[0].amount = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'amount');
      });

      it('is not number', () => {
        (data.splits[0].amount as any) = 'text';
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'splits[0].amount', 'number');
      });
    });

    describe('if data.splits.description', () => {
      it('is not string', () => {
        (data.splits[0].description as any) = 2;
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'splits[0].description', 'string');
      });

      it('is too short', () => {
        data.splits[0].description = '';
        const result = validatorService.validate(data, schema);
        validateSchemaMinLength(result, 'splits[0].description', 1);
      });
    });

    describe('if data.splits[0].categoryId', () => {
      it('does not match pattern', () => {
        data.splits[0].categoryId = createCategoryId();
        const result = validatorService.validate(data, schema);
        validateSchemaPattern(result, 'splits[0].categoryId');
      });
    });

    describe('if data.splits[0].projectId', () => {
      it('does not match pattern', () => {
        data.splits[0].projectId = createProjectId();
        const result = validatorService.validate(data, schema);
        validateSchemaPattern(result, 'splits[0].projectId');
      });
    });
  });
});
