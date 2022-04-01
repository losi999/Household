import { default as schema } from '@household/shared/schemas/account-id';
import { validateSchemaAdditionalProperties, validateSchemaPattern, validateSchemaRequired } from '@household/shared/common/unit-testing';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { Account } from '@household/shared/types/types';
import { createAccountId } from '@household/shared/common/test-data-factory';

describe('Account id schema', () => {
  let data: Account.Id;

  beforeEach(() => {
    data = {
      accountId: createAccountId('62378f3a6add840bbd4c630c'),
    };
  });

  it('should accept valid body', () => {
    const result = validatorService.validate(data, schema);
    expect(result).toBeUndefined();
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        const result = validatorService.validate(data, schema);
        validateSchemaAdditionalProperties(result, 'data');
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
  });
});
