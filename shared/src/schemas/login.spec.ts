import { default as schema } from '@household/shared/schemas/refresh-token';
import { validateSchemaAdditionalProperties, validateSchemaRequired, validateSchemaType } from '@household/shared/common/unit-testing';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { Auth } from '@household/shared/types/types';

describe('Refresh token schema', () => {
  let data: Auth.RefreshToken.Request;

  beforeEach(() => {
    data = {
      refreshToken: 'some.refresh.token',
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

    describe('if data.refreshToken', () => {
      it('is missing', () => {
        data.refreshToken = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'refreshToken');
      });

      it('is not string', () => {
        (data.refreshToken as any) = 2;
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'refreshToken', 'string');
      });
    });
  });
});
