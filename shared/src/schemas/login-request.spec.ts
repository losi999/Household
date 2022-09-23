import { default as schema } from '@household/shared/schemas/refresh-token-request';
import { Auth } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Refresh token schema', () => {
  let data: Auth.RefreshToken.Request;
  const tester = jsonSchemaTesterFactory<Auth.RefreshToken.Request>(schema);

  beforeEach(() => {
    data = {
      refreshToken: 'some.refresh.token',
    };
  });

  it('should accept valid body', () => {
    tester.validateSuccess(data);
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        tester.validateSchemaAdditionalProperties(data, 'data');
      });
    });

    describe('if data.refreshToken', () => {
      it('is missing', () => {
        data.refreshToken = undefined;
        tester.validateSchemaRequired(data, 'refreshToken');
      });

      it('is not string', () => {
        (data.refreshToken as any) = 2;
        tester.validateSchemaType(data, 'refreshToken', 'string');
      });
    });
  });
});
