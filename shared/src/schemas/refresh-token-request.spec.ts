import { default as schema } from '@household/shared/schemas/refresh-token-request';
import { Requests } from '@household/shared/types/requests';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Refresh token schema', () => {
  const tester = jsonSchemaTesterFactory<Requests.RefreshToken>(schema);

  tester.validateSuccess({
    refreshToken: 'some.refresh.token',
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        refreshToken: 'some.refresh.token',
        extra: 1,
      } as any, 'data');
    });

    describe('if data.refreshToken', () => {
      tester.required({
        refreshToken: undefined,
      }, 'refreshToken');

      tester.type({
        refreshToken: 1 as any,
      }, 'refreshToken', 'string');

      tester.minLength({
        refreshToken: '',
      }, 'refreshToken', 1);
    });
  });
});

