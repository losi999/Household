import { default as schema } from '@household/shared/schemas/refresh-token-request';
import { Auth } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Refresh token schema', () => {
  const tester = jsonSchemaTesterFactory<Auth.RefreshToken.Request>(schema);

  tester.validateSuccess({
    refreshToken: 'some.refresh.token',
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        refreshToken: 'some.refresh.token',
        extra: 1,
      } as any, 'data');
    });

    describe('if data.refreshToken', () => {
      tester.validateSchemaRequired({
        refreshToken: undefined,
      }, 'refreshToken');

      tester.validateSchemaType({
        refreshToken: 1 as any,
      }, 'refreshToken', 'string');

      tester.validateSchemaMinLength({
        refreshToken: '',
      }, 'refreshToken', 1);
    });
  });
});

